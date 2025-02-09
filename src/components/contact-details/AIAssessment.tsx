import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
// 1) Remove or comment out "apiClient" if you no longer use it
// import { apiClient } from "@/integrations/supabase/client";

import { PhysicalDisabilitySection } from "./PhysicalDisabilitySection";
import { AIAssessmentSection } from "./AIAssessmentSection";
import { AlertCircle } from "lucide-react";

interface AIAssessmentProps {
  complaints: string[];
  vulnerabilities: string[];
  hasPhysicalDisability: boolean;
  contactId: string;
  onSnippetClick?: (snippetId: string) => void;
}

export const AIAssessment = ({
  complaints,
  vulnerabilities,
  contactId,
  onSnippetClick
}: AIAssessmentProps) => {
  const { data: aiAssessment, isLoading, error } = useQuery({
    queryKey: ["ai-assessment", contactId],
    queryFn: async () => {
      console.log("Fetching AI assessment for contact:", contactId);

      // 2) Use a direct fetch call to your Azure Function
      const baseUrl = import.meta.env.VITE_API_BASE_URL; 
      const response = await fetch(`${baseUrl}/contact-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: contactId })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Error fetching assessment:", errText);
        throw new Error(`Error fetching assessment: ${response.status} - ${errText}`);
      }

      // 3) The function returns a JSON object with "complaints" and "vulnerability"
      const data = await response.json();
      console.log("AI assessment data:", data);

      // 4) Map the returned data to the shape your component expects
      return {
        complaints_flag: data.complaints?.complaints_flag || false,
        complaints_reasoning: data.complaints?.complaints_reasoning,
        relevant_snippet_ids: data.complaints?.relevant_snippet_ids || [],
        physical_disability_flag: data.complaints?.physical_disability_flag || false,
        physical_disability_reasoning: data.complaints?.physical_disability_reasoning,
        vulnerability_flag: data.vulnerability?.vulnerability_flag || false,
        vulnerability_reasoning: data.vulnerability?.vulnerability_reasoning,
        vulnerability_snippet_ids: data.vulnerability?.relevant_snippet_ids || []
      };
    },
    retry: 1
  });

  const bothFlagsTrue =
    aiAssessment?.complaints_flag && aiAssessment?.vulnerability_flag;

  if (isLoading) {
    return (
      <Card className="w-full min-h-[600px]">
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-gray-500">Loading assessment...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full min-h-[600px]">
        <CardContent className="flex flex-col items-center justify-center h-[600px] space-y-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="text-red-500 font-medium">Error loading assessment</div>
          <div className="text-sm text-gray-500 max-w-md text-center">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full min-h-[600px]">
      <CardContent>
        <div className="space-y-6">
          <PhysicalDisabilitySection
            physicalDisabilityFlag={aiAssessment?.physical_disability_flag || false}
            physicalDisabilityReasoning={aiAssessment?.physical_disability_reasoning}
          />

          <AIAssessmentSection
            complaints={complaints}
            vulnerabilities={vulnerabilities}
            complaintsFlag={aiAssessment?.complaints_flag || false}
            vulnerabilityFlag={aiAssessment?.vulnerability_flag || false}
            complaintsReasoning={aiAssessment?.complaints_reasoning}
            vulnerabilityReasoning={aiAssessment?.vulnerability_reasoning}
            bothFlagsTrue={bothFlagsTrue}
            contactId={contactId}
            complaintsSnippetIds={aiAssessment?.relevant_snippet_ids || []}
            vulnerabilitySnippetIds={aiAssessment?.vulnerability_snippet_ids || []}
            onSnippetClick={onSnippetClick}
          />
        </div>
      </CardContent>
    </Card>
  );
};