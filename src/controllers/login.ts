import type { MojoContext } from "@mojojs/core";
import Minion from "@minionjs/core";
import { User, Users } from "../models/users.js";

export default class Controller {
  async show(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();
    if (session.current_user) await ctx.redirectTo("/");

    ctx.stash.msg = "Receive a magic link to login";
    ctx.stash.login = {};
    await ctx.render();
  }

  async create(ctx: MojoContext): Promise<void> {
    const email = (await ctx.params()).toObject().email;

    if (ctx.validateEmail(ctx, email) === false) {
      await ctx.render(
        { view: "login/show" },
        {
          msg: "Receive a magic link to login",
          login: { email, err: "invalid email" },
        }
      );
      return;
    }

    const users = new Users(ctx.models.pg);
    const loginToken = await users.login(email);
    const confirmationUrl = new URL(
      `/login/verify/${loginToken}`,
      ctx.config.domain
    );

    const minion = new Minion(ctx.config.pg);

    // probably better to move this to a DB job insert
    // send it out in a queue with minion.js
    await minion.enqueue("email", [
      {
        to: email,
        subject: "Welcome to mojojs-passwordless-example!",
        text: "Welcome to mojojs-passwordless-example! Please check your email for a login link.",
        html: `<h1>Welcome to mojojs-passwordless-example!</h1><p>Login with the follow link</p><a href='${confirmationUrl}'>${confirmationUrl}</a>`,
      },
    ]);
    ctx.redirectTo("check_email");
  }

  async verify(ctx: MojoContext): Promise<void> {
    const users = new Users(ctx.models.pg);
    const current_user: User = await users.verify(
      ctx.stash.login_key,
      "session"
    );
    const session = await ctx.session();
    session.current_user = current_user;
    ctx.stash.current_user = current_user;
    await ctx.redirectTo("main");
  }

  async delete(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();
    session.current_user = null;
    ctx.stash.current_user = null;
    await ctx.redirectTo("main");
  }

  async check_email(ctx: MojoContext): Promise<void> {
    ctx.stash.msg = "Check your email";
    await ctx.render();
  }
}
