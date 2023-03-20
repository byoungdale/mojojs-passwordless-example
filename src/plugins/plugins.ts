import type { MojoApp, MojoContext } from "@mojojs/core";
import Minion from "@minionjs/core";

export function minionHelpers(app: MojoApp) {
  app.addHelper("emailTask", async (ctx: MojoContext, ...args) => {
    const minion = new Minion(ctx.config.pg);
    await minion.enqueue("email", args);
  });
}

export function errorHelpers(app: MojoApp) {
  type ErrorWithMessage = {
    message: string;
  };
  function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    );
  }
  function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError;

    try {
      return new Error(JSON.stringify(maybeError));
    } catch {
      // fallback in case there's an error stringifying the maybeError
      // like with circular references for example.
      return new Error(String(maybeError));
    }
  }
  app.addHelper("getErrorMessage", async (ctx: MojoContext, ...args) => {
    return toErrorWithMessage(args[0]);
  });
}

export function validators(app: MojoApp) {
  app.addHelper("validateEmail", async (ctx: MojoContext, ...args) => {
    const validate = ctx.schema({
      $id: "postForm",
      type: "string",
      minLength: 6,
      maxLength: 320,
      pattern: "^\\S+@\\S+\\.\\S+$",
    });

    const email = args[1];
    return validate(email).isValid;
  });
  app.addHelper("validateUsername", async (ctx: MojoContext, ...args) => {
    const validate = ctx.schema({
      type: "string",
      minLength: 3,
      maxLength: 50,
      pattern:
        "^(?!(admin|Admin|ADMIN|administrator|Administrator|ADMINISTRATOR|contact|Contact|CONTACT|fraud|Fraud|FRAUD|guest|Guest|GUEST|help|Help|HELP|hostmaster|Hostmaster|HOSTMASTER|mailer-daemon|moderator|Moderator|MODERATOR|moderators|Moderators|MODERATORS|nobody|Nobody|NOBODY|postmaster|Postmaster|POSTMASTER|root|Root|ROOT|security|SECURITY|Security|support|Suport|SUPPORT|sysop|Sysop|SYSOP|webmaster|Webmaster|WEBMASTER|enable|Enable|ENABLE|new|New|NEW|signup|Signup|SIGNUP)).*$",
    });

    const username = args[1];
    return validate(username).isValid;
  });
}
