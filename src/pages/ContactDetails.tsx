import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const ContactDetails: React.FC = () => {
  const { contactId } = useParams<{ contactId?: string }>();
  const location = useLocation();
  const contactDataFromState = location.state?.contactData;

  // Use contact ID from state if not found in URL
  const finalContactId = contactId || contactDataFromState?.contact_id;

  // Fetch contact details
  const { data, isLoading, isError } = useQuery({
    queryKey: ["contactDetails", finalContactId],
    queryFn: async () => {
      if (!finalContactId) throw new Error("Contact ID is missing");

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/contact-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: finalContactId }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch contact details: ${response.status} - ${errText}`);
      }

      return response.json();
    },
    enabled: !!finalContactId,
    retry: 1,
  });

  if (!finalContactId) {
    return (
      <div className="container mx-auto p-6 text-center text-red-600">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>No Contact ID provided.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10 text-gray-600" />
        <h1 className="text-xl font-semibold ml-3">Loading contact details...</h1>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error loading contact details</h1>
        <p>Check your internet connection or API settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Navigation Bar */}
      <nav className="bg-gray-100 p-4 rounded-md shadow-sm mb-6">
        <ul className="flex space-x-4">
          <li><Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">Home</Link></li>
          <li><Link to="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">Admin</Link></li>
          <li><Link to="/contact/view" className="text-blue-600 hover:text-blue-800 font-semibold">Contact Details</Link></li>
          <li><Link to="/past-conversations" className="text-blue-600 hover:text-blue-800 font-semibold">Past Conversations</Link></li>
        </ul>
      </nav>

      <h2 className="text-2xl font-bold mb-4">Contact Details for {finalContactId}</h2>

      <div className="bg-gray-100 p-4 rounded-md shadow-md">
        <pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ContactDetails;
