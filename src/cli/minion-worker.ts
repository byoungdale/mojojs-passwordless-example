import Minion from "@minionjs/core";
import { MojoApp } from "@mojojs/core";
import nodemailer from "nodemailer";

export default async function minionWorkerCommand(
  app: MojoApp,
  args: Array<any>
) {
  const minion = new Minion(app.config.pg);
  // Update the database schema to the latest version
  await minion.update();

  // add email task
  minion.addTask("email", async (job, ...args) => {
    app.log.debug("processing an email task");
    const emailConfig = args[0];

    const transporter = nodemailer.createTransport({
      host: app.config.SMTP_SERVER_HOST,
      port: app.config.SMTP_SERVER_PORT,
      secure: false, // upgrade later with STARTTLS
      //auth: {
      //    user: 'username',
      //    pass: 'password',
      //},
    });

    app.log.debug("sending email");
    try {
      const data = await transporter.sendMail({
        from: app.config.FROM_EMAIL_ADDRESS,
        to: emailConfig.to,
        subject: emailConfig.subject,
        text: emailConfig.text,
        html: emailConfig.html,
      });
      app.log.debug("finished sending email");
      app.log.debug(JSON.stringify(data, null, 2));
      job.finish(data);
      return;
    } catch (err) {
      job.fail(err);
    }
  });

  // Start a worker to perform up to [jobs] concurrently
  const worker = minion.worker();
  if (args[2] == "jobs") {
    worker.status.jobs = args[3];
  } else {
    worker.status.jobs = 12;
  }

  app.log.debug(`starting minion worker with ${worker.status.jobs} jobs`);

  await worker.start();
}

minionWorkerCommand.description = "Start minion minion-worker job process";
minionWorkerCommand.usage = `Usage: APPLICATION minion-worker [OPTIONS]

  node lib/index.js minoin-worker

Options:
  -h, --help   Show this summary of available options
  -j, --jobs   number of jobs to run
`;
