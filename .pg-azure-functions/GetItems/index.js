const { Client } = require("pg");
const { corsHeaders } = require("../shared/cors.js");


/**
 * Azure Function: GetItems
 * This function uses a GET request to retrieve rows from a 'items' table in PostgreSQL.
 */
module.exports = async function (context, req) {
    // If this is a preflight request (OPTIONS), respond immediately with CORS headers
    if (req.method === "OPTIONS") {
        context.res = {
            status: 204, // No Content
            headers: corsHeaders
        };
        return;
        }
  // Log an informational message
  context.log("GetItems function processing request...");

  // DB connection details - prefer environment variables for secrets!
const config = {
    user: process.env.PGUSER,                                  // e.g. h.chaturvedi14@gmail.com
    password: process.env.PGPASSWORD,                          // Obtained using: az account get-access-token ...
    host: process.env.PGHOST,                                  // e.g. postgres-server-qaqc.postgres.database.azure.com
    database: process.env.PGDATABASE,                          // e.g. postgres
    port: Number(process.env.PGPORT || 5432),
    ssl: { rejectUnauthorized: false }                       // For Azure SSL
  };


  // Create a new client
  const client = new Client(config);

  try {
    // Connect to PostgreSQL
    await client.connect();

    // Basic SELECT from an "items" table
    const result = await client.query(`SELECT id, name FROM items LIMIT 50;`);

    // Close the client
    await client.end();

    // Return the rows in JSON format
    context.res = {
      status: 200,
      body: result.rows,
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    context.log.error("Error connecting to PostgreSQL:", err);

    // Return 500 on error
    context.res = {
      status: 500,
      body: { error: err.message },
    };
  }
};
