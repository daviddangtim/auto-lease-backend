import axios from "axios";
import cron from "node-cron";
import chalk from "chalk";

export const keepAwake = () =>
  cron.schedule("* * * * *", async () => {
    try {
      const response = await fetch(
        `https://auto-lease.onrender.com/api/v1/auth/sign-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: process.env.CRONE_USER_EMAIL,
            password: process.env.CRONE_USER_PASSWORD,
          }),
        },
      );

      // Debug HTTP status
      console.log(chalk.green("HTTP status:", response.status));

      if (!response.ok) {
        const errRes = await response.json();
        console.error(
          chalk.red(
            `HTTP error! status: ${response.status}, ${errRes.statusText}`,
          ),
        );
        return; // Ensure to exit early in case of error
      }

      const data = await response.json();
      console.log(
        chalk.blueBright(
          `${data.data.user.name} is keeping online server awake`,
        ),
      );
    } catch (err) {
      console.error(chalk.red("Fetch error:", err));
    }
  });
