import Minion from "@minionjs/core";
import nodemailer from "nodemailer";
import mojo, { jsonConfigPlugin } from "@mojojs/core";

export const app = mojo();

app.plugin(jsonConfigPlugin);

const minion = new Minion(app.config.pg);

async function run() {
  // Update the database schema to the latest version
  await minion.update();

  // add email task
  minion.addTask("email", async (job, ...args) => {
    console.log("This is a background worker process for sending emails.");
    //await emailTask(config, job, ...args);
    await emailTask(job, args);
  });

  // Start a worker to perform up to 12 jobs concurrently
  const worker = minion.worker();
  worker.status.jobs = 12;
  await worker.start();

  async function emailTask(job, ...args) {
    console.log(`Running ${job.id}`);
    const emailConfig = args[0][0];
    console.log(emailConfig);

    const transporter = nodemailer.createTransport({
      host: app.config.SMTP_SERVER_HOST,
      port: app.config.SMTP_SERVER_PORT,
      secure: false, // upgrade later with STARTTLS
      //auth: {
      //    user: 'username',
      //    pass: 'password',
      //},
    });

    try {
      const data = await transporter.sendMail({
        from: app.config.FROM_EMAIL_ADDRESS,
        to: emailConfig.to,
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: emailConfig.html,
      });
      console.log("finished sending email");
      console.log(JSON.stringify(data, null, 2));
      return;
    } catch (err) {
      throw err;
    }
  }
}

run();
