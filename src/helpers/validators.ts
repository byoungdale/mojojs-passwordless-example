import type { MojoContext } from "@mojojs/core";

export function _validate_email(ctx: MojoContext, email: string): Boolean {
  const validate = ctx.schema({
    $id: "postForm",
    type: "string",
    minLength: 6,
    maxLength: 320,
    pattern: "^\\S+@\\S+\\.\\S+$",
  });
  return validate(email).isValid;
}

export function _validate_username(
  ctx: MojoContext,
  username: string
): Boolean {
  const validate = ctx.schema({
    type: "string",
    minLength: 3,
    maxLength: 50,
    pattern:
      "^(?!(admin|Admin|ADMIN|administrator|Administrator|ADMINISTRATOR|contact|Contact|CONTACT|fraud|Fraud|FRAUD|guest|Guest|GUEST|help|Help|HELP|hostmaster|Hostmaster|HOSTMASTER|mailer-daemon|moderator|Moderator|MODERATOR|moderators|Moderators|MODERATORS|nobody|Nobody|NOBODY|postmaster|Postmaster|POSTMASTER|root|Root|ROOT|security|SECURITY|Security|support|Suport|SUPPORT|sysop|Sysop|SYSOP|webmaster|Webmaster|WEBMASTER|enable|Enable|ENABLE|new|New|NEW|signup|Signup|SIGNUP))(\\w*)",
  });
  return validate(username).isValid;
}
