import axios from "axios";
import cron from "node-cron";
import chalk from "chalk";

export const keepAwake = () =>
  cron.schedule("* * * * *", async () => {
    try {
      const res = await axios.post(
        "https://auto-lease.onrender.com/api/v1/auth/sign-in",
        {
          email: process.env.CRONE_USER_EMAIL,
          password: process.env.CRONE_USER_PASSWORD,
        },
        { headers: { "Content-Type": "application/json" }, method: "POST" },
      );

      console.log(res.data.message);
    } catch (err) {
      console.log(chalk.red(err));
    }
  });
