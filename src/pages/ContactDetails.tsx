import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const ContactDetails: React.FC = () => {
  // Suppose we have a contactId from state or a query param:
  const [contactId] = useState<string>("CONTACT123");

  // Use React Query to call our new Python Azure Function endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ["contactDetails", contactId],
    queryFn: async () => {
      // Assume you set VITE_API_BASE_URL in your .env or vite config
      const baseUrl = import.meta.env.VITE_API_BASE_URL; 
      const response = await fetch(`${baseUrl}/contact-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contactId })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch contact details: ${response.status} - ${errText}`);
      }
      return response.json();
    },
    enabled: !!contactId,
    retry: 1,
  });

  if (isLoading) {
    return <div>Loading contact details...</div>;
  }

  if (error) {
    return (
      <div style={{ color: "red" }}>
        Error loading contact details:{" "}
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  // data should contain the results from the new Python function, e.g. { complaints: {...}, vulnerability: {...} }
  return (
    <div>
      <h2>Contact Details for {contactId}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default ContactDetails;
