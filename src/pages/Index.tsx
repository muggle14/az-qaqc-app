import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { format } from "date-fns";
import { ExternalLink, ArrowUpDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JoinedData {
  contact_id: string;
  evaluator: string;
  upload_timestamp: string;
  transcript: string | null;
  updated_at: string | null;
}

type SortField = "upload_timestamp" | "updated_at";
type SortOrder = "asc" | "desc";

const Index = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>("upload_timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // 1) Use React Query to fetch data from your new Python function
  const { data: joinedData, isLoading } = useQuery<JoinedData[]>({
    queryKey: ["joined-data"],
    queryFn: async () => {
      console.log("Fetching joined data...");
      // Retrieve from your Azure Function
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/upload-details`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("Error fetching joined data:", errText);
        throw new Error(`Failed to fetch data: ${response.status} - ${errText}`);
      }
      const rawData = await response.json();
      console.log("Raw joined data:", rawData);

      // Transform the data if needed
      const transformedData: JoinedData[] = rawData.map((item: any) => ({
        contact_id: item.contact_id,
        evaluator: item.evaluator,
        upload_timestamp: item.upload_timestamp,
        transcript: item.transcript ?? null,
        updated_at: item.updated_at ?? null,
      }));
      console.log("Transformed data:", transformedData);
      return transformedData;
    },
  });

  // 2) Sorting logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // 3) Sort the data client-side
  const sortedData = joinedData
    ? [...joinedData].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (!aValue && !bValue) return 0;
        if (!aValue) return 1;
        if (!bValue) return -1;

        const comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      })
    : [];

  // 4) Navigate on row click
  const handleRowClick = (contactData: JoinedData) => {
    console.log("Navigating to contact details with state:", contactData);
    navigate("/contact/view", { 
      state: { contactData },
      replace: true 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Data Tab</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact ID</TableHead>
              <TableHead>Evaluator</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("upload_timestamp")}
                  className="h-8 flex items-center gap-1"
                >
                  Upload Date
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("updated_at")}
                  className="h-8 flex items-center gap-1"
                >
                  Last Updated
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Transcript Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow
                key={row.contact_id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  onClick={() => handleRowClick(row)}
                >
                  {row.contact_id}
                  <ExternalLink className="h-4 w-4" />
                </TableCell>
                <TableCell>{row.evaluator}</TableCell>
                <TableCell>
                  {row.upload_timestamp
                    ? format(new Date(row.upload_timestamp), "PPp")
                    : "No upload date"}
                </TableCell>
                <TableCell>
                  {row.updated_at
                    ? format(new Date(row.updated_at), "PPp")
                    : "Not updated"}
                </TableCell>
                <TableCell className="max-w-md">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between px-2 gap-2 h-8 hover:bg-gray-100"
                      >
                        <span className="truncate">
                          {row.transcript || "No transcript"}
                        </span>
                        <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-4">
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="text-sm whitespace-pre-wrap">
                          {row.transcript || "No transcript available"}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;
