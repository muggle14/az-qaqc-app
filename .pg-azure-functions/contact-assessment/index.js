const { Client } = require("pg");
const { corsHeaders } = require("../shared/cors.js");  // for CORS if needed
// Import your local Node-based assessment logic
const { assess_complaints, assess_vulnerability, store_assessment_results } = require("./assessment.js");

module.exports = async function (context, req) {
  // If this is a preflight request (OPTIONS), respond with CORS headers immediately.
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: {
        ...corsHeaders,
      },
    };
    return;
  }

  try {
    context.log("Contact assessment function called");

    // Parse JSON body to get contact_id
    const { contact_id } = req.body || {};
    if (!contact_id) {
      throw new Error("Contact ID is required");
    }

    // Configure PostgreSQL client using environment variables
    const config = {
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      port: Number(process.env.PGPORT || 5432),
      ssl: { rejectUnauthorized: false }, // For Azure Postgres
    };

    const client = new Client(config);
    await client.connect();

    context.log("Fetching conversation transcript for contact:", contact_id);

    // Fetch conversation transcript from 'contact_conversations' table
    const transcriptQuery = `
      SELECT transcript
      FROM contact_conversations
      WHERE contact_id = $1
      LIMIT 1
    `;
    const transcriptResult = await client.query(transcriptQuery, [contact_id]);
    if (transcriptResult.rowCount === 0) {
      throw new Error("No conversation found for this contact");
    }

    const transcript = transcriptResult.rows[0].transcript || null;
    context.log("Transcript found:", transcript ? "Yes" : "No");

    context.log("Performing assessments");
    // Perform your local complaint/vulnerability logic
    const complaintsResult = await assess_complaints(client, contact_id, transcript);
    const vulnerabilityResult = await assess_vulnerability(client, contact_id, transcript);

    context.log("Storing assessment results");
    // Store results in DB
    const results = await store_assessment_results(
      client,
      contact_id,
      complaintsResult,
      vulnerabilityResult
    );

    await client.end();

    context.log("Assessment completed successfully");
    context.res = {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    };
  } catch (error) {
    context.log.error("Error:", error.message);
    context.res = {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
