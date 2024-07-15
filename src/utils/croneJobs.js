import axios from "axios";
import cron from "node-cron";
import chalk from "chalk";

export const keepAwake = () =>
  cron.schedule("10 * * * *", async () => {
    try {
      const res = await axios.patch(
        "https://auto-lease.onrender.com/api/v1/auth/verify/token",
        {
          // email: process.env.CRONE_USER_EMAIL,
          // password: process.env.CRONE_USER_PASSWORD,
        },
        { headers: { "Content-Type": "application/json" }, method: "PATCH" },
      );

      console.log(res.data.message);
    } catch (err) {
      console.log(chalk.red(err));
    }
  });
