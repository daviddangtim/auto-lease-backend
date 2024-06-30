import cron from "node-cron";
import chalk from "chalk";

export const keepAwake = () =>
  cron.schedule("0 * * * * *", async () => {
    try {
      const response = await fetch(
        `https://auto-lease.onrender.com/api/v1/auth/sign-in`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "fake.user@gmail.com",
            password: "Sag@frog",
          }),
        },
      );

      if (!response.ok) {
        return console.error(
          chalk.red(
            `HTTP error! status: ${JSON.stringify(await response.json())}`,
          ),
        );
      }

      const signInRes = await response.json();
      console.log(chalk.green("sign in response", signInRes));
    } catch (err) {
      console.log();
    }
  });
