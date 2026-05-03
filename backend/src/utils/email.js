import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const gmailTokenUrl = 'https://oauth2.googleapis.com/token';
const gmailMessagesUrl = 'https://gmail.googleapis.com/gmail/v1/users';

let smtpTransporter;
let gmailAccessToken = '';
let gmailAccessTokenExpiresAt = 0;

function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }

  return smtpTransporter;
}

function isConsoleDelivery() {
  return env.email.delivery === 'console';
}

function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.map((email) => String(email).trim()).filter(Boolean);
  }

  return [String(to ?? '').trim()].filter(Boolean);
}

function sanitizeHeader(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function encodeHeader(value) {
  const sanitized = sanitizeHeader(value);

  if (/^[\x00-\x7F]*$/.test(sanitized)) {
    return sanitized;
  }

  return `=?UTF-8?B?${Buffer.from(sanitized, 'utf8').toString('base64')}?=`;
}

function normalizeBody(value) {
  return String(value ?? '').replace(/\r?\n/g, '\r\n');
}

function toBase64Url(value) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildRawEmail({ from, to, subject, text, html }) {
  const recipients = normalizeRecipients(to);

  if (recipients.length === 0) {
    throw new Error('Email recipient is required');
  }

  const boundary = `kmultaqa_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const headers = [
    `From: ${sanitizeHeader(from)}`,
    `To: ${recipients.map(sanitizeHeader).join(', ')}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  const textPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    normalizeBody(text),
  ];
  const htmlPart = [
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    normalizeBody(html),
    `--${boundary}--`,
  ];

  return [...headers, '', ...textPart, ...htmlPart, ''].join('\r\n');
}

async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function buildHttpError(prefix, response, data) {
  const message =
    data?.error?.message
    || data?.error_description
    || data?.error
    || response.statusText;

  return new Error(`${prefix} (${response.status}): ${message}`);
}

async function getGmailAccessToken() {
  if (gmailAccessToken && gmailAccessTokenExpiresAt > Date.now() + 60000) {
    return gmailAccessToken;
  }

  const response = await fetch(gmailTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: env.gmailApi.clientId,
      client_secret: env.gmailApi.clientSecret,
      refresh_token: env.gmailApi.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildHttpError('Gmail access token request failed', response, data);
  }

  gmailAccessToken = data.access_token;
  gmailAccessTokenExpiresAt =
    Date.now() + Math.max(Number(data.expires_in ?? 3600) - 60, 0) * 1000;

  return gmailAccessToken;
}

async function sendWithGmailApi(message) {
  const accessToken = await getGmailAccessToken();
  const raw = toBase64Url(buildRawEmail({
    ...message,
    from: env.gmailApi.from,
  }));
  const userId = encodeURIComponent(env.gmailApi.user);
  const response = await fetch(`${gmailMessagesUrl}/${userId}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildHttpError('Gmail message send failed', response, data);
  }

  return { sent: true, delivery: 'gmail-api', id: data.id };
}

async function sendEmail({ to, subject, text, html }) {
  if (isConsoleDelivery()) {
    return { sent: false, delivery: 'console' };
  }

  if (env.email.delivery === 'gmail-api') {
    return sendWithGmailApi({ to, subject, text, html });
  }

  await getSmtpTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, delivery: 'smtp' };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendVerificationEmail({
  to,
  name,
  code,
  token,
  expiresAt,
}) {
  const verificationParam = token
    ? `token=${encodeURIComponent(token)}`
    : `code=${encodeURIComponent(code)}`;
  const verificationUrl = `${env.appBaseUrl}/api/auth/verify-email?${verificationParam}`;
  const expiresAtText = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (isConsoleDelivery()) {
    console.log(`Verification code for ${to}: ${code}`);
    console.log(`Verification link for ${to}: ${verificationUrl}`);
    return { sent: false, delivery: 'console' };
  }

  return sendEmail({
    to,
    subject: 'Verify your KMultaqa email',
    text: [
      `Hello ${name},`,
      '',
      'Your verification code is:',
      code,
      '',
      `This code expires at ${expiresAtText}.`,
      '',
      'You can also verify your email using this link:',
      verificationUrl,
      '',
      'If you did not create this account, ignore this email.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 0.12em;">${escapeHtml(code)}</p>
      <p>This code expires at ${escapeHtml(expiresAtText)}.</p>
      <p>You can also verify your email using this link:</p>
      <p><a href="${escapeHtml(verificationUrl)}">${escapeHtml(verificationUrl)}</a></p>
      <p>If you did not create this account, ignore this email.</p>
    `,
  });
}

export async function sendClubPasswordSetupEmail({
  to,
  clubName,
  token,
  expiresAt,
}) {
  const setupUrl = `${env.frontendBaseUrl}/club/setup-password/${encodeURIComponent(token)}`;
  const expiresAtText = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (isConsoleDelivery()) {
    console.log(`Club password setup link for ${to}: ${setupUrl}`);
    return { sent: false, delivery: 'console' };
  }

  return sendEmail({
    to,
    subject: 'Set your KMultaqa club password',
    text: [
      `Hello ${clubName},`,
      '',
      'Your club request has been approved.',
      '',
      'Set your club account password using this link:',
      setupUrl,
      '',
      `This link expires at ${expiresAtText}.`,
      '',
      'If you did not request this club account, ignore this email.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(clubName)},</p>
      <p>Your club request has been approved.</p>
      <p>Set your club account password using this link:</p>
      <p><a href="${escapeHtml(setupUrl)}">${escapeHtml(setupUrl)}</a></p>
      <p>This link expires at ${escapeHtml(expiresAtText)}.</p>
      <p>If you did not request this club account, ignore this email.</p>
    `,
  });
}

export async function sendClubRequestRejectionEmail({
  to,
  clubName,
  representativeName,
  adminNote,
}) {
  const recipients = Array.isArray(to)
    ? [
        ...new Set(
          to.filter(Boolean).map((email) => String(email).trim().toLowerCase())
        ),
      ]
    : [String(to).trim().toLowerCase()].filter(Boolean);
  const note = adminNote || 'No additional note was provided.';

  if (recipients.length === 0) {
    return { sent: false, delivery: 'none', recipients: [] };
  }

  if (isConsoleDelivery()) {
    console.log(`Club request rejection email for ${recipients.join(', ')}`);
    console.log(`Club: ${clubName}`);
    console.log(`Admin note: ${note}`);
    return { sent: false, delivery: 'console', recipients };
  }

  const delivery = await sendEmail({
    to: recipients,
    subject: 'KMultaqa club request update',
    text: [
      `Hello ${representativeName},`,
      '',
      `Your club registration request for ${clubName} was not approved.`,
      '',
      'Admin note:',
      note,
      '',
      'You may revise your request and submit it again if appropriate.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(representativeName)},</p>
      <p>
        Your club registration request for
        <strong>${escapeHtml(clubName)}</strong>
        was not approved.
      </p>
      <p><strong>Admin note:</strong></p>
      <p>${escapeHtml(note)}</p>
      <p>You may revise your request and submit it again if appropriate.</p>
    `,
  });

  return { ...delivery, recipients };
}

export async function sendFollowerContentEmail({
  to,
  studentName,
  clubName,
  contentType,
  title,
  targetUrl,
}) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  if (isConsoleDelivery()) {
    console.log(`Follower ${contentType} notification for ${recipient}`);
    console.log(`Club: ${clubName}`);
    console.log(`Title: ${title}`);
    console.log(`Link: ${targetUrl}`);
    return { sent: false, delivery: 'console', recipient };
  }

  const delivery = await sendEmail({
    to: recipient,
    subject: `New ${contentType} from ${clubName}`,
    text: [
      `Hello ${studentName || 'there'},`,
      '',
      `${clubName} published a new ${contentType}:`,
      title,
      '',
      'Open it here:',
      targetUrl,
      '',
      'You are receiving this because your KMultaqa email notifications are enabled.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(studentName || 'there')},</p>
      <p><strong>${escapeHtml(clubName)}</strong> published a new ${escapeHtml(contentType)}:</p>
      <p>${escapeHtml(title)}</p>
      <p><a href="${escapeHtml(targetUrl)}">${escapeHtml(targetUrl)}</a></p>
      <p>You are receiving this because your KMultaqa email notifications are enabled.</p>
    `,
  });

  return { ...delivery, recipient };
}

export async function sendClubWarningEmail({
  to,
  clubName,
  warningType,
  message,
  evidenceReference,
}) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const evidenceText = evidenceReference || 'No evidence reference was provided.';

  if (isConsoleDelivery()) {
    console.log(`Club warning email for ${recipient}`);
    console.log(`Club: ${clubName}`);
    console.log(`Warning type: ${warningType}`);
    console.log(`Message: ${message}`);
    console.log(`Evidence: ${evidenceText}`);
    return { sent: false, delivery: 'console', recipient };
  }

  const delivery = await sendEmail({
    to: recipient,
    subject: 'KMultaqa club warning notice',
    text: [
      `Hello ${clubName},`,
      '',
      `Warning type: ${warningType}`,
      '',
      'Message:',
      message,
      '',
      'Evidence/reference:',
      evidenceText,
      '',
      'Please review platform guidelines and correct the issue.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(clubName)},</p>
      <p><strong>Warning type:</strong> ${escapeHtml(warningType)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message)}</p>
      <p><strong>Evidence/reference:</strong> ${escapeHtml(evidenceText)}</p>
      <p>Please review platform guidelines and correct the issue.</p>
    `,
  });

  return { ...delivery, recipient };
}

export async function sendClubStatusEmail({
  to,
  clubName,
  status,
  reason,
}) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const statusLabel = status === 'suspended' ? 'suspended' : 'reactivated';
  const reasonText = reason || 'No additional note was provided.';

  if (isConsoleDelivery()) {
    console.log(`Club status email for ${recipient}`);
    console.log(`Club: ${clubName}`);
    console.log(`Status: ${statusLabel}`);
    console.log(`Reason: ${reasonText}`);
    return { sent: false, delivery: 'console', recipient };
  }

  const delivery = await sendEmail({
    to: recipient,
    subject: `KMultaqa club account ${statusLabel}`,
    text: [
      `Hello ${clubName},`,
      '',
      `Your club account has been ${statusLabel}.`,
      '',
      'Admin note:',
      reasonText,
      '',
      'Contact the platform administrator if you believe this needs review.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(clubName)},</p>
      <p>Your club account has been <strong>${escapeHtml(statusLabel)}</strong>.</p>
      <p><strong>Admin note:</strong></p>
      <p>${escapeHtml(reasonText)}</p>
      <p>Contact the platform administrator if you believe this needs review.</p>
    `,
  });

  return { ...delivery, recipient };
}

export async function sendAppealDecisionEmail({
  to,
  requesterName,
  appealType,
  decision,
  explanation,
}) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const name = requesterName || 'there';

  if (isConsoleDelivery()) {
    console.log(`Appeal decision email for ${recipient}`);
    console.log(`Appeal type: ${appealType}`);
    console.log(`Decision: ${decision}`);
    console.log(`Explanation: ${explanation}`);
    return { sent: false, delivery: 'console', recipient };
  }

  const delivery = await sendEmail({
    to: recipient,
    subject: 'KMultaqa appeal decision',
    text: [
      `Hello ${name},`,
      '',
      `Your ${appealType} appeal has been reviewed.`,
      '',
      `Decision: ${decision}`,
      '',
      'Explanation:',
      explanation,
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>Your ${escapeHtml(appealType)} appeal has been reviewed.</p>
      <p><strong>Decision:</strong> ${escapeHtml(decision)}</p>
      <p><strong>Explanation:</strong></p>
      <p>${escapeHtml(explanation)}</p>
    `,
  });

  return { ...delivery, recipient };
}

export async function sendPlatformAnnouncementEmail({
  to,
  recipientName,
  title,
  message,
}) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const name = recipientName || 'there';

  if (isConsoleDelivery()) {
    console.log(`Platform announcement email for ${recipient}`);
    console.log(`Title: ${title}`);
    return { sent: false, delivery: 'console', recipient };
  }

  const delivery = await sendEmail({
    to: recipient,
    subject: title,
    text: [
      `Hello ${name},`,
      '',
      message,
      '',
      'This announcement was sent by KMultaqa administration.',
    ].join('\n'),
    html: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>${escapeHtml(message)}</p>
      <p>This announcement was sent by KMultaqa administration.</p>
    `,
  });

  return { ...delivery, recipient };
}
