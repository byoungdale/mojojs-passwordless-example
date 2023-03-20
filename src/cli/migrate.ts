import { MojoApp } from "@mojojs/core";
import Path from "@mojojs/path";

export default async function migrateCommand(app: MojoApp, args: Array<any>) {
  const pg = app.models.pg;
  await pg.migrations.fromFile(
    Path.currentFile().sibling("../../migrations", "schema.sql"),
    {
      name: app.config.db_name,
    }
  );

  switch (args[1]) {
    case "drop":
      await pg.migrations.migrate(0);
      break;
    case "reset":
      await pg.migrations.migrate(0);
      await pg.migrations.migrate();
      break;
    default:
      await pg.migrations.migrate();
  }
}

migrateCommand.description = "Run database migration";
migrateCommand.usage = `Usage: APPLICATION migrate [OPTIONS]

  node lib/index.js migrate

Options:
  -h, --help   Show this summary of available options
  -d, --drop   Drop current database
  -r, --reset  Drop and re-run migrations
`;
