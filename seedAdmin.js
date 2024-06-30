import mongoose from "mongoose";
import inquirer from "inquirer";
import dotenv from "dotenv";
import chalk from "chalk";
dotenv.config();
import User from "./src/models/userModel.js";
import connectDb from "./src/utils/db.js";
import { ROLES } from "./src/utils/constants.js";

const seedAdmin = async () => {
  let isSuccessful = false;

  while (!isSuccessful) {
    try {
      const answers = await inquirer.prompt([
        { name: "name", message: "Enter name:" },
        { name: "email", message: "Enter email:" },
        { type: "password", name: "password", message: "Enter password:" },
        {
          type: "password",
          name: "passwordConfirm",
          message: "Confirm password:",
        },
        {
          type: "list",
          name: "role",
          message: "Select role:",
          choices: [ROLES.ADMIN],
          default: "admin",
        },
      ]);

      const admin = new User({
        name: answers.name,
        email: answers.email,
        password: answers.password,
        passwordConfirm: answers.passwordConfirm,
        role: answers.role,
      });

      admin.isUserConfirmed = true;
      await admin.save();
      isSuccessful = true;
      console.log(chalk.blueBright("Admin saved:", admin));
    } catch (err) {
      console.error(chalk.red("Error saving admin:", err.message));
      console.log(chalk.blue("Please try again"));
    }
  }
};

const run = async () => {
  try {
    await connectDb({ localDb: true });
    await seedAdmin();
  } catch (error) {
    console.error(
      "Error connecting to the database or saving admin:",
      error.message,
    );
  } finally {
    await mongoose.disconnect();
    console.log(chalk.green("Disconnected from database"));
    process.exit(1);
  }
};

(async () => await run())();
