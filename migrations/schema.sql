-- 1 up
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
  id    serial primary key,
  username citext UNIQUE,
  email citext UNIQUE,
  status character varying(255) NOT NULL -- pending, blocked, confirmed
);

CREATE TABLE IF NOT EXISTS users_tokens
(
    id serial primary key,
    user_id bigint NOT NULL,
    token bytea NOT NULL,
    context character varying(255) NOT NULL, -- confirm (on signup) OR session (on login)
    sent_to character varying(255),
    inserted_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT users_tokens_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- 1 down
DROP TABLE IF EXISTS users_tokens;
DROP TABLE IF EXISTS users;
