import { MinionJob } from "@minionjs/core";
import { MinionArgs } from "@minionjs/core/lib/types";
import { MojoApp } from "@mojojs/core";
import nodemailer from "nodemailer";

export function emailTask(app: MojoApp) {
  app.models.minion.addTask("email", sendEmail);
}

async function sendEmail(job: MinionJob, ...args: MinionArgs) {
  const app = job.app;
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
}
