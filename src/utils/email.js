import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";
import { __dirname } from "./dirname.js";
import { join } from "node:path";

export default class Email {
  constructor(user, payload) {
    this.to = user.email;
    this.name = user.name.split(" ")[0];
    this.payload = payload;
    this.from = `Auto Lease <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    // if (process.env.NODE_ENV === "production") {
    //   return 1;
    // }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(
      `${join(__dirname, "../views/emails", `${template}.pug`)}`,
      {
        firstName: this.name,
        payload: this.payload,
      },
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

  async sendConfirmation() {
    await this.send(
      "confirmEmail",
      "Confirm your email (valid for only 10 minutes)",
    );
  }

  async sendWelcome() {
    await this.send("sendWelcome", "Welcome to Auto Lease");
  }

  async sendPasswordReset() {
    await this.send(
      "resetPassword",
      "Password reset requested (valid for only 10 minutes)",
    );
  }

  async sendOtp() {
    await this.send(
      "sendOtp",
      "Your One Time Password (valid for only 2 minutes)",
    );
  }
}
