import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendMail = async (to, subject, otp) => {
  try {
    const info = await transporter.sendMail({
      from: "Hiky",
      to,
      subject: subject,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, sans-serif;">

  <div style="max-width: 500px; margin: 30px auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
    
    <!-- Logo -->
    <div style="margin-bottom: 20px;">
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="logoTitle">
        <title id="logoTitle">Hiky Chat App Logo</title>
        <defs>
          <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#1D4ED8" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <rect x="10" y="10" width="80" height="80" rx="20" ry="20" fill="url(#logoGradient)" filter="url(#shadow)" />
        <path d="M35,85 L48,95 L53,85 Z" fill="url(#logoGradient)" />
        <g transform="translate(0, 5)">
          <path d="M38 33 H62 A4 4 0 0 1 66 37 V47 A4 4 0 0 1 62 51 H38 A4 4 0 0 1 34 47 V37 A4 4 0 0 1 38 33 Z 
                   M42 40 H58 M42 44 H58" 
                stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
          <text x="50" y="65" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="middle">
            Hiky
          </text>
        </g>
      </svg>
    </div>

    <!-- Message -->
    <h2 style="color: #1D4ED8; margin-bottom: 10px;">Verify Your Email</h2>
    <p style="font-size: 16px; color: #444444;">Hello 👋</p>
    <p style="font-size: 16px; color: #444444;">Your one-time password (OTP) is:</p>

    <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; color: #1D4ED8;">
      ${otp}
    </div>

    <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
    <p style="font-size: 12px; color: #aaa;">If you didn’t request this, you can safely ignore this email.</p>
  </div>

</body>
</html>`,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export default sendMail;
