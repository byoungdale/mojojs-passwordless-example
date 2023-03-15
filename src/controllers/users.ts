import type { MojoContext } from "@mojojs/core";
import { User, Users } from "../models/users.js";
import { _validate_email, _validate_username } from "../helpers/validators.js";

export default class Controller {
  async show(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();
    const users = new Users(ctx.models.pg);
    const user = await users.find(ctx.stash.id);
    await ctx.render(
      { view: "users/show" },
      {
        msg: "Account settings",
        form: {
          error: [],
        },
        user,
        current_user: session.current_user,
      }
    );
  }

  /**
   * Run once the user has confirmed their email by clicking the link sent from signup.ts
   *
   * @param ctx
   */
  async create(ctx: MojoContext): Promise<void> {}

  async edit(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();
    if (!session.current_user || session.current_user?.id != ctx.stash.id) {
      return ctx.redirectTo("show_user", {
        status: 302,
        values: { id: ctx.stash.id },
      });
    }

    await ctx.render(
      { view: "users/edit" },
      {
        msg: "Account settings",
        form: {
          error: [],
        },
        user: session.current_user,
        current_user: session.current_user,
      }
    );
  }

  async update(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();
    const currentUser: User = session.current_user;
    const formUser: User = (await ctx.params()).toObject();
    const updatedUser: any = {};

    const formErrors: string[] = _validate(ctx, formUser);
    if (formErrors.length > 0) {
      await ctx.render(
        { view: "users/edit" },
        {
          msg: "Account settings",
          form: {
            errors: formErrors,
          },
          user: session.current_user,
          current_user: session.current_user,
        }
      );
      return;
    }

    // check for no changes
    let noChanges = true;
    if (currentUser.email !== formUser.email) {
      ctx.log.debug("need to send confirmation email");
      updatedUser.email = formUser.email;
      noChanges = false;
    }

    if (currentUser.username != formUser.username) {
      ctx.log.debug("updated username too");
      updatedUser.username = formUser.username;
      noChanges = false;
    }

    if (noChanges) {
      await ctx.render(
        { view: "users/edit" },
        {
          msg: "Account settings",
          form: {
            errors: ["No changes were made"],
          },
          user: session.current_user,
          current_user: session.current_user,
        }
      );
      return;
    }

    const users = new Users(ctx.models.pg);
    const newUser: User = await users.update(currentUser.id, updatedUser);

    session.current_user = newUser;

    ctx.redirectTo("edit_user", {
      status: 302,
      values: { id: ctx.stash.id },
    });
  }

  async check_email(ctx: MojoContext): Promise<void> {
    ctx.stash.msg = "Check your email";
    await ctx.render();
  }
}

function _validate(ctx: MojoContext, formUser: User): string[] {
  let errors = [];

  if (_validate_email(ctx, formUser.email) == false) {
    errors.push("invalid email");
  }

  if (_validate_username(ctx, formUser.username) == false) {
    errors.push("invalid username");
  }

  return [];
}
