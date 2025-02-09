1. Set Up the Azure Function App Environment

### 1.1 Install Prerequisites

**Node.js (LTS or Current)**  
Download and install Node.js if you don’t have it already.

**Azure Functions Core Tools**  
This lets you develop and run Azure Functions locally.

On most systems, you can install via npm:

```bash
npm install -g azure-functions-core-tools@4
```

See official installation docs for other options.

**PostgreSQL Database**  
If you plan to use Azure Database for PostgreSQL, create a new server (e.g., via Azure Portal) or connect to an existing PostgreSQL instance.  
Take note of the connection details (host, port, username, password, database).

### 1.2 Create a New Azure Functions Project

**Initialize the Project Folder**  
Create a new folder (e.g., pg-azure-functions), then initialize a Functions project in JavaScript (Node.js):

```bash
mkdir pg-azure-functions
cd pg-azure-functions
func init . --javascript
```

**Add the pg Library (for PostgreSQL)**  
Install node-postgres:

```bash
npm install pg
```

**(Optional) Add GraphQL Libraries**  
For a GraphQL endpoint, we’ll use apollo-server-azure-functions and graphql:

```bash
npm install apollo-server-azure-functions graphql
```

2. Create a REST Endpoint to Query PostgreSQL

### 2.1 Generate a Function

From your project folder:

```bash
func new --name GetItems --template "HTTP trigger"
```

This creates a new folder `GetItems` with `index.js`. By default, it looks like:

```javascript
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
```

### 2.2 Connect to PostgreSQL in the Function

Replace the contents of `GetItems/index.js` with the following:

```javascript
const { Client } = require("pg");

/**
 * Azure Function: GetItems
 * This function uses a GET request to retrieve rows from a 'items' table in PostgreSQL.
 */
module.exports = async function (context, req) {
  // Log an informational message
  context.log("GetItems function processing request...");

  // DB connection details - prefer environment variables for secrets!
  const config = {
    user: process.env.DB_USER,            // e.g. "pgadmin"
    password: process.env.DB_PASSWORD,    // e.g. "MySecurePassword123"
    host: process.env.DB_HOST,           // e.g. "my-postgres-server.postgres.database.azure.com"
    database: process.env.DB_DATABASE,    // e.g. "mydbname"
    port: Number(process.env.DB_PORT || 5432),
    ssl: { rejectUnauthorized: false }    // For Azure SSL
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
```

### 2.3 Use Environment Variables for Secrets

Create a `.env` file in the root of your functions project (this will not be committed if your `.gitignore` is standard). For example:

```plaintext
DB_USER=pgadmin
DB_PASSWORD=MySecurePassword123
DB_HOST=my-postgres-server.postgres.database.azure.com
DB_DATABASE=mydbname
DB_PORT=5432
```

Azure Functions Core Tools will automatically load these into `process.env` when running locally.

### 2.4 Test Locally

Start the local Azure Functions runtime:

```bash
func start
```

Call the REST Endpoint:

```bash
curl http://localhost:7071/api/GetItems
```

If all goes well, you should see a JSON array of items from your PostgreSQL table.

**Incremental Test:** If you see an error, check the function logs in the terminal to confirm the database connection details are correct.
