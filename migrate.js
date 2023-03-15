import Pg from "@mojojs/pg";
import mojo, { jsonConfigPlugin } from "@mojojs/core";
import Path from "@mojojs/path";
import child from "child_process";
import util from "util";
const exec = util.promisify(child.exec);

export const app = mojo();

app.plugin(jsonConfigPlugin);

const pg = new Pg(app.config.pg);

async function run() {
  await pg.migrations.fromFile(
    Path.currentFile().sibling("migrations", "schema.sql"),
    {
      name: app.config.db_name,
    }
  );

  switch (process.argv[2]) {
    case "--drop":
      await pg.migrations.migrate(0);
      break;
    case "--reset":
      await pg.migrations.migrate(0);
      await pg.migrations.migrate();
      break;
    default:
      await pg.migrations.migrate();
  }
}

run();
