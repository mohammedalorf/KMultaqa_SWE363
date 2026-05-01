import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendVerificationEmail({ to, name, code, token, expiresAt }) {
  const verificationParam = token
    ? `token=${encodeURIComponent(token)}`
    : `code=${encodeURIComponent(code)}`;
  const verificationUrl = `${env.appBaseUrl}/api/auth/verify-email?${verificationParam}`;
  const expiresAtText = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (!env.smtp.enabled) {
    console.log(`Verification code for ${to}: ${code}`);
    console.log(`Verification link for ${to}: ${verificationUrl}`);
    return { sent: false, delivery: 'console' };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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

  return { sent: true, delivery: 'smtp' };
}

export async function sendClubPasswordSetupEmail({ to, clubName, token, expiresAt }) {
  const setupUrl = `${env.frontendBaseUrl}/club/setup-password/${encodeURIComponent(token)}`;
  const expiresAtText = new Date(expiresAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (!env.smtp.enabled) {
    console.log(`Club password setup link for ${to}: ${setupUrl}`);
    return { sent: false, delivery: 'console' };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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

  return { sent: true, delivery: 'smtp' };
}

export async function sendClubRequestRejectionEmail({ to, clubName, representativeName, adminNote }) {
  const recipients = Array.isArray(to)
    ? [...new Set(to.filter(Boolean).map((email) => String(email).trim().toLowerCase()))]
    : [String(to).trim().toLowerCase()].filter(Boolean);
  const note = adminNote || 'No additional note was provided.';

  if (recipients.length === 0) {
    return { sent: false, delivery: 'none', recipients: [] };
  }

  if (!env.smtp.enabled) {
    console.log(`Club request rejection email for ${recipients.join(', ')}`);
    console.log(`Club: ${clubName}`);
    console.log(`Admin note: ${note}`);
    return { sent: false, delivery: 'console', recipients };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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
      <p>Your club registration request for <strong>${escapeHtml(clubName)}</strong> was not approved.</p>
      <p><strong>Admin note:</strong></p>
      <p>${escapeHtml(note)}</p>
      <p>You may revise your request and submit it again if appropriate.</p>
    `,
  });

  return { sent: true, delivery: 'smtp', recipients };
}

export async function sendFollowerContentEmail({ to, studentName, clubName, contentType, title, targetUrl }) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  if (!env.smtp.enabled) {
    console.log(`Follower ${contentType} notification for ${recipient}`);
    console.log(`Club: ${clubName}`);
    console.log(`Title: ${title}`);
    console.log(`Link: ${targetUrl}`);
    return { sent: false, delivery: 'console', recipient };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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

  return { sent: true, delivery: 'smtp', recipient };
}

export async function sendClubWarningEmail({ to, clubName, warningType, message, evidenceReference }) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const evidenceText = evidenceReference || 'No evidence reference was provided.';

  if (!env.smtp.enabled) {
    console.log(`Club warning email for ${recipient}`);
    console.log(`Club: ${clubName}`);
    console.log(`Warning type: ${warningType}`);
    console.log(`Message: ${message}`);
    console.log(`Evidence: ${evidenceText}`);
    return { sent: false, delivery: 'console', recipient };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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

  return { sent: true, delivery: 'smtp', recipient };
}

export async function sendClubStatusEmail({ to, clubName, status, reason }) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const statusLabel = status === 'suspended' ? 'suspended' : 'reactivated';
  const reasonText = reason || 'No additional note was provided.';

  if (!env.smtp.enabled) {
    console.log(`Club status email for ${recipient}`);
    console.log(`Club: ${clubName}`);
    console.log(`Status: ${statusLabel}`);
    console.log(`Reason: ${reasonText}`);
    return { sent: false, delivery: 'console', recipient };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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

  return { sent: true, delivery: 'smtp', recipient };
}

export async function sendAppealDecisionEmail({ to, requesterName, appealType, decision, explanation }) {
  const recipient = String(to ?? '').trim().toLowerCase();

  if (!recipient) {
    return { sent: false, delivery: 'none', recipient: '' };
  }

  const name = requesterName || 'there';

  if (!env.smtp.enabled) {
    console.log(`Appeal decision email for ${recipient}`);
    console.log(`Appeal type: ${appealType}`);
    console.log(`Decision: ${decision}`);
    console.log(`Explanation: ${explanation}`);
    return { sent: false, delivery: 'console', recipient };
  }

  await getTransporter().sendMail({
    from: env.smtp.from,
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

  return { sent: true, delivery: 'smtp', recipient };
}
