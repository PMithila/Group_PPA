import nodemailer from 'nodemailer';

let cachedTransporter = null;

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM
} = process.env;

export const isEmailConfigured = () => {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && EMAIL_FROM);
};

const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return cachedTransporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('[Email] Email transport not configured. Skipping send to:', to);
    return { skipped: true };
  }

  const payload = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html: html || text
  };

  await transporter.sendMail(payload);
  return { sent: true };
};
