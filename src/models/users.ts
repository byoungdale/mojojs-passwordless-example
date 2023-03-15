import { Database } from "@mojojs/pg";
import crypto from "crypto";

export interface User {
  id: number;
  username: string;
  email: string;
}

export class Users {
  pg: Database;
  constructor(pg: Database) {
    this.pg = pg;
  }

  /**
   * Adds a new user to the data using the email provided. They are set to 'pending' status until confirmed.
   *
   * @param email the email of the user wanting to signup
   * @returns token for use in confirmation email
   */
  async add(email: string): Promise<string> {
    // create confirmation token
    const token = crypto.randomBytes(32).toString("hex");

    const id = (
      await this.pg
        .query<User>`INSERT INTO users (email, status) VALUES (${email}, 'pending') RETURNING id`
    ).first.id;

    await this.pg
      .query`INSERT INTO users_tokens (user_id, token, context, sent_to) VALUES (${id}, ${token}, 'confirm', ${email})`;

    return token;
  }

  /**
   * creates a new login token for the user to confirm for their session
   *
   * @param email the email of the user wanting to login
   * @returns token for use in confirmation email
   */
  async login(email: string): Promise<string> {
    // create confirmation token
    const token = crypto.randomBytes(32).toString("hex");

    // verify email is associated with a current active user
    const { id } = (
      await this.pg
        .query`SELECT id FROM users WHERE email=${email} AND status='active'`
    ).first;

    await this.pg
      .query`INSERT INTO users_tokens (user_id, token, context, sent_to) VALUES (${id}, ${token}, 'session', ${email})`;

    return token;
  }

  /**
   * Verifies a user from the token sent to their email
   *
   * @param token token sent to the user's email
   * @param context this will be 'confirm' for signs ups and 'session' for logins
   * @returns User object of the user that was just verified
   */
  async verify(token: string, context: string): Promise<User> {
    const { user_id } = (
      await this.pg
        .query`SELECT user_id FROM users_tokens WHERE token=${token} AND context=${context} AND age(now(), inserted_at) < '1 hour'`
    ).first;

    if (user_id == undefined) {
      throw new Error(`invalid token ${token} and context ${context}`);
    }

    await this.pg
      .query`DELETE FROM users_tokens WHERE user_id=${user_id} AND token=${token} AND context=${context}`;

    return (
      await this.pg
        .query<User>`UPDATE users SET status='active' WHERE id=${user_id} RETURNING *`
    ).first;
  }

  async find(id: number): Promise<User> {
    return (await this.pg.query<User>`SELECT * FROM users WHERE id = ${id}`)
      .first;
  }

  async update(id: number, updatedUser: any): Promise<User> {
    let updateQueryMainClause = `UPDATE users SET`;
    let updateQuerySetClause = ``;

    const updateLength: number = Object.entries(updatedUser).length;
    Object.entries(updatedUser).forEach(([column, value], index) => {
      console.log(`${column}=\'${value}\'`);
      const updateSection =
        updateLength > 1 && index + 1 < updateLength
          ? `${column}=\'${value}\', `
          : `${column}=\'${value}\'`;

      updateQuerySetClause = `${updateQuerySetClause}${updateSection}`;
    });

    return (
      await this.pg.rawQuery(
        `${updateQueryMainClause} ${updateQuerySetClause} WHERE id=${id} RETURNING *`
      )
    ).first;
  }
}
