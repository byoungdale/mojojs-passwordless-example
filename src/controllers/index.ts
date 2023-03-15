import type { MojoContext } from "@mojojs/core";

export default class Controller {
  // Render template "example/welcome.html.tmpl" with message
  async welcome(ctx: MojoContext): Promise<void> {
    const session = await ctx.session();

    await ctx.render(
      { view: "index/welcome" },
      {
        msg: "Welcome to mojojs-passwordless-example example page!",
        form: {
          error: [],
        },
        current_user: session.current_user,
      }
    );
    await ctx.render();
  }
}
