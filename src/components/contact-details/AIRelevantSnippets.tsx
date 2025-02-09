import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// 1) Remove supabase import
// import { supabase } from "@/integrations/supabase/client";

import { SnippetsContent } from "./snippets/SnippetsContent";

interface Snippet {
  id: string;
  content: string;
  timestamp: string | null;
}

interface AIRelevantSnippetsProps {
  contactId: string;
  snippetIds: string[];
  onSnippetClick?: (snippetId: string) => void;
}

export const AIRelevantSnippets = ({
  contactId,
  snippetIds,
  onSnippetClick
}: AIRelevantSnippetsProps) => {
  console.log("AIRelevantSnippets rendered with:", { contactId, snippetIds });

  const { data: snippets, isLoading, error } = useQuery<Snippet[]>({
    queryKey: ["ai-snippets", contactId, snippetIds],
    queryFn: async () => {
      console.log("Fetching snippets for contact:", contactId);
      console.log("Snippet IDs to fetch:", snippetIds);

      // If no snippet IDs, return empty array
      if (!snippetIds || snippetIds.length === 0) {
        console.log("No snippet IDs provided");
        return [];
      }

      // 2) Use fetch call to your new Python Azure Function endpoint (e.g., /snippets)
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/snippets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contactId, snippet_ids: snippetIds })
      });
      if (!response.ok) {
        const errText = await response.text();
        console.error("Error fetching snippet data:", errText);
        throw new Error(`Error fetching snippet data: ${response.status} - ${errText}`);
      }

      // 3) Assume the Python function returns an array of snippet objects
      const relevantSnippets: Snippet[] = await response.json();
      console.log("Filtered relevant snippets:", relevantSnippets);
      return relevantSnippets;
    },
    enabled: !!contactId && snippetIds.length > 0
  });

  if (error) {
    console.error("Error in AIRelevantSnippets:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="text-red-500">
        Error loading snippets: {errMsg}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-gray-500" />
        <h4 className="font-medium text-gray-700">Analysis Evidence:</h4>
      </div>
      <ScrollArea className="h-[200px] pr-4 border rounded-md p-3 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <SnippetsContent
              isLoading={isLoading}
              snippets={snippets}
              snippetIds={snippetIds}
              onSnippetClick={onSnippetClick}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
