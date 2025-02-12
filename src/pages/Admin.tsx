import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface JoinedData {
  contact_id: string;
  evaluator: string;
  upload_timestamp: string;
  transcript: string | null;
  updated_at: string | null;
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (!["admin2", "admin3"].includes(user?.username)) {
      navigate("/");
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  const { data: joinedData, isLoading, isError } = useQuery<JoinedData[]>({
    queryKey: ["joined-data"],
    queryFn: async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/upload-details`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errText = await response.text();
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
        throw new Error(`Request failed: ${response.status} - ${errText}`);
      }

      return response.json();
    },
  });

  const handleRowClick = (contactData: JoinedData) => {
    navigate("/contact/view", { state: { contactData }, replace: true });
  };

  if (!isAuthorized) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center">
        <Loader2 className="animate-spin h-10 w-10 text-gray-600" />
        <h1 className="text-xl font-semibold ml-3">Loading data...</h1>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error loading data</h1>
        <p>Check your internet connection or API settings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <nav className="bg-gray-100 p-4 rounded-md shadow-sm mb-6">
        <ul className="flex space-x-4">
          <li><Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">Home</Link></li>
          <li><Link to="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">Admin</Link></li>
          <li><Link to="/contact/view" className="text-blue-600 hover:text-blue-800 font-semibold">Contact Details</Link></li>
          <li><Link to="/past-conversations" className="text-blue-600 hover:text-blue-800 font-semibold">Past Conversations</Link></li>
        </ul>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Contact Records</h1>

      {joinedData?.length === 0 ? (
        <p className="text-gray-500 text-center">No contact records found.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact ID</TableHead>
                <TableHead>Evaluator</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Transcript Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {joinedData?.map((row) => (
                <TableRow
                  key={row.contact_id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell onClick={() => handleRowClick(row)}>
                    {row.contact_id}
                    <ExternalLink className="h-4 w-4 ml-2 text-blue-500" />
                  </TableCell>
                  <TableCell>{row.evaluator}</TableCell>
                  <TableCell>{format(new Date(row.upload_timestamp), "PPp")}</TableCell>
                  <TableCell>
                    {row.updated_at ? format(new Date(row.updated_at), "PPp") : "Not updated"}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {row.transcript || "No transcript"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Admin;
