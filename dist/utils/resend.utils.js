"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationEmailHTML = exports.generatePasswordResetEmailHTML = exports.sendVerificationEmail = void 0;
const resend_1 = require("resend");
// Initialize Resend with API key
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
/**
 * Send email using Resend
 * @param options Email options including recipient, subject, and HTML content
 */
const sendVerificationEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Make sure to use the verified domain from environment variables
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'admin@megagigsolution.com';
        const { to, subject, html, from = `Financial Hub <${fromEmail}>` } = options;
        console.log(`Sending email from: ${from} to: ${to}`);
        const { data, error } = yield resend.emails.send({
            from,
            to,
            subject,
            html,
            // Add these options to improve deliverability
            text: subject, // Plain text version
            tags: [{ name: 'email_verification', value: 'true' }],
        });
        if (error) {
            console.error('Resend email error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
        console.log('Email sent successfully:', data);
    }
    catch (error) {
        console.error('Resend service error:', error);
        throw new Error('Failed to send verification email. Please try again later.');
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Generate verification email HTML content
 * @param userName User's name
 * @param verificationToken Verification token
 * @param verificationUrl URL for verification
 */
/**
 * Generate password reset email HTML content
 * @param userName User's name
 * @param resetUrl URL for password reset
 */
const generatePasswordResetEmailHTML = (userName, resetUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #3b82f6;
          margin: 0;
        }
        .content {
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>You requested to reset your password for your Financial Hub account. Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>This link is valid for 10 minutes.</p>
        </div>
        <div class="footer">
          <p>Financial Hub - Secure Financial Management</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
exports.generatePasswordResetEmailHTML = generatePasswordResetEmailHTML;
/**
 * Generate verification email HTML content
 * @param userName User's name
 * @param verificationToken Verification token
 * @param verificationUrl URL for verification
 */
const generateVerificationEmailHTML = (userName, verificationToken, verificationUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #3b82f6;
          margin: 0;
        }
        .content {
          margin-bottom: 20px;
        }
        .token {
          background-color: #eee;
          padding: 10px;
          text-align: center;
          font-size: 24px;
          letter-spacing: 5px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 10px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Financial Hub</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Thank you for registering with Financial Hub. To complete your registration and verify your email address, please use the verification code below:</p>
          
          <div class="token">${verificationToken}</div>
          
          <p>Alternatively, you can click the button below to verify your email:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </p>
          
          <p>This verification code will expire in 1 hour.</p>
          <p>If you did not register for an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>Financial Hub - Your trusted financial management platform</p>
          <p>&copy; ${new Date().getFullYear()} Financial Hub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
exports.generateVerificationEmailHTML = generateVerificationEmailHTML;
