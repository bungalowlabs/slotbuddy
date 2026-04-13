const { neon } = require("@neondatabase/serverless");
require("dotenv").config();
const sql = neon(process.env.DATABASE_URL);
sql`DROP SCHEMA public CASCADE`
  .then(() => sql`CREATE SCHEMA public`)
  .then(() => console.log("DB wiped"))
  .catch((e) => console.error(e));
