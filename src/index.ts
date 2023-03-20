import { Users } from "./models/users.js";
import mojo, { jsonConfigPlugin } from "@mojojs/core";
import Pg from "@mojojs/pg";
import { minionHelpers, validators } from "./plugins/plugins.js";

export const app = mojo({
  // Default configuration
  config: { name: "mojojs-passwordless-example" },

  // Detect if the application has been imported and disable the command line interface if it has
  detectImport: false,

  // Format for HTTP exceptions ("html", "json", or "txt")
  exceptionFormat: "html",

  // Rotating secret passphrases used for signed cookies and the like
  secrets: [
    "%^6i9#$zHNKD5ym&#$bxB*&A",
    "9ZyAQUA8SyLDp2I064P^zm",
    "1bCd8#Tx6!F09Di72%Yl0c2u",
  ],

  // Operating mode for application
  mode: process.env.NODE_ENV, // development or production
});

// load plugins
app.plugin(jsonConfigPlugin);
app.plugin(minionHelpers);
app.plugin(validators);

app.secrets = app.config.secrets;
app.defaults.current_user = undefined; // no user login by default

app.addAppHook("app:start", async (app) => {
  if (app.models.pg === undefined) app.models.pg = new Pg(app.config.pg);
  app.models.posts = new Users(app.models.pg);

  const migrations = app.models.pg.migrations;
  await migrations.fromFile(app.home.child("migrations", "schema.sql"), {
    name: "mojojs_passwordless_example_dev",
  });
  await migrations.migrate();
});

// main ui
app.get("/").to("index#welcome").name("main");

// signup
app.get("/signup").to("signup#show").name("show_signup");
app.post("/signup").to("signup#create").name("create_signup");
app.get("/signup/verify/:signup_key").to("signup#verify").name("verify_signup");

// login
app.get("/login").to("login#show").name("show_login");
app.post("/login").to("login#create").name("create_login");
app.get("/login/verify/:login_key").to("login#verify").name("verify_login");
app.get("/logout").to("login#delete").name("logout");

// users
app.get("/users/check_email").to("users#check_email").name("check_email");
app.get("/users/:id").to("users#show").name("show_user");
app.get("/users/:id/edit").to("users#edit").name("edit_user");
app.post("/users/:id/edit").to("users#update").name("update_user");

app.start();
