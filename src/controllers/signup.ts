import type { MojoContext } from "@mojojs/core";
import { User, Users } from "../models/users.js";
import Minion from "@minionjs/core";
import { _validate_email } from "../helpers/validators.js";

export default class Controller {
  async show(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();
    console.log(session);
    if (session.current_user) ctx.redirectTo("/");
    ctx.stash.msg = "One website to rule them all";
    ctx.stash.signup = {};
    await ctx.render();
  }

  async create(ctx: MojoContext): Promise<void> {
    const email = (await ctx.params()).toObject().email;

    if (_validate_email(ctx, email) === false) {
      await ctx.render(
        { view: "signup/show" },
        {
          msg: "One website to rule them all",
          signup: { email, err: "invalid email" },
        }
      );
      return;
    }

    try {
      const users = new Users(ctx.models.pg);
      const signupToken = await users.add(email);
      const confirmationUrl = new URL(
        `/signup/verify/${signupToken}`,
        ctx.config.domain
      );

      const minion = new Minion(ctx.config.pg);

      // probably better to move this to a DB job insert
      // send it out in a queue with minion.js
      await minion.enqueue("email", [
        {
          to: email,
          subject: "Welcome to mojojs-passwordless-example!",
          text: "Welcome to mojojs-passwordless-example! Please confirm your address",
          html: `<h1>Welcome to mojojs-passwordless-example!</h1><p>Please confirm your address with the follow link</p><a href='${confirmationUrl}'>${confirmationUrl}</a>`,
        },
      ]);
    } catch (err: any) {
      // this is lame
      // maybe just need to add a helper to avoid this weirdness
      let errMsg = "unknown error occurred";
      if (err instanceof Error) errMsg = err.message;
      ctx.app.log.error("there was a problem sending email");
      ctx.app.log.error(errMsg);

      // re-render signup page
      await ctx.render(
        { view: "signup/show" },
        {
          msg: "One website to rule them all",
          signup: {
            email,
            err: "Sorry, a problem occurred on our end",
          },
        }
      );
      return;
    }

    ctx.redirectTo("check_email");
  }

  async verify(ctx: MojoContext): Promise<void> {
    const users = new Users(ctx.models.pg);
    const current_user: User = await users.verify(
      ctx.stash.signup_key,
      "confirm"
    );
    const session = await ctx.session();
    session.current_user = current_user;
    ctx.stash.current_user = current_user;
    ctx.redirectTo(`/users/${current_user.id}/edit`);
  }
}
