import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";
import { __dirname } from "./dirname.js";
import { join } from "node:path";

export default class Email {
  constructor(user, options = {}) {
    this.to = user.email;
    this.name = user.name.split(" ")[0];
    this.options = options;
    this.from = `Auto Lease <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, cb = () => {}) {
    const options = {
      firstName: this.name,
      url: this.options?.url,
    };

    cb(options);
    const html = pug.renderFile(
      `${join(__dirname, "../views/emails", `${template}.pug`)}`,
      options,
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendVerification(minutes = 10) {
    await this.send(
      "sendVerificationEmail",
      `Confirm your email (valid for only ${minutes} minutes)`,
    );
  }

  async sendWelcome() {
    await this.send("sendWelcome", "Welcome to Auto Lease");
  }

  async sendPasswordReset(minutes = 10) {
    await this.send(
      "resetPassword",
      `Password reset requested (valid for only ${minutes} minutes)`,
    );
  }

  async sendOtp(minutes = 2) {
    await this.send(
      "sendOtp",
      `Your One Time Password (valid for only ${minutes} minutes)`,
      (options) => {
        options.otp = this.options?.otp;
      },
    );
  }

  async sendApplyDealership() {
    await this.send(
      "sendApplyDealership",
      "Dealership Application status (pending)",
    );
  }

  async sendApprovedDealership() {
    const createdByAdmin = this.options?.createdByAdmin;
    await this.send(
      "sendApprovedDealership",
      createdByAdmin
        ? "Your Dealership Has Been Created"
        : "Dealership Application status (approved)",
      (options) => {
        options.createdByAdmin = createdByAdmin;
      },
    );
  }

  async sendRejectDealership() {
    await this.send(
      "sendRejectDealership",
      "Reject Application status (Rejected)",
      (options) => {
        options.reason = this.options?.reason;
      },
    );
  }

  async sendRevokeDealership() {
    await this.send(
      "sendRevokeDealership",
      "Revoke Application status (Revoked)",
      (options) => {
        options.reason = this.options?.reason;
      },
    );
  }

  async sendContactUsRes() {
    await this.send("endContactUsRes", "Contact Us");
  }
}
