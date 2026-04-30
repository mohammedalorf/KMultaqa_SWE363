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
