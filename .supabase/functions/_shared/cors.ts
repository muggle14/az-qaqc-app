// import { Headers } from "https://deno.land/std@0.168.0/http/mod.ts";

// export const corsHeaders = new Headers({
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// });

module.exports = async function (context, req) {
  // Some code to process the request

  const responseBody = { message: "Hello from Azure Function!" };

  context.res = {
    status: 200,
    body: responseBody,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  };
};

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    // Respond quickly to OPTIONS
    context.res = {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    };
    return;
  }

  // Else, handle actual GET/POST/etc.
  context.res = {
    status: 200,
    body: { message: "Some data" },
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  };
};
