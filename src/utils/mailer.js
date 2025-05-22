const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const canResend = (lastSent) => {
  const now = Date.now();
  const cooldown = parseInt(process.env.RESEND_VERIFICATION_INTERVAL, 10);
  return now - new Date(lastSent).getTime() > cooldown;
};


const sendVerificationEmail = async (to, token) => {
  const url = `http://localhost:3000/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: `"Event App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verifica il tuo account',
    html: `<p>Clicca sul link per verificare la tua email:</p><a href="${url}">${url}</a>`,
  });
};

module.exports = sendVerificationEmail;
