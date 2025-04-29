import nodemailer from 'nodemailer';
import { AppError } from '../middleware/error.middleware';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

/**
 * Send email using nodemailer
 * @param options Email options including recipient, subject, and message
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define email options
    const mailOptions = {
      from: `Financial Hub <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
    throw new AppError('Failed to send email', 500);
  }
};
