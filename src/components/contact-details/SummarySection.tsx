import { DetailedSummary } from "./DetailedSummary";
import { OverallSummary } from "./OverallSummary";

interface SummarySectionProps {
  overallSummary: string;
  detailedSummaryPoints: string[];
}

export const SummarySection = ({ 
  overallSummary, 
  detailedSummaryPoints 
}: SummarySectionProps) => {
  return (
    <div className="space-y-6 h-full">
      <OverallSummary summary={overallSummary} />
      <DetailedSummary summaryPoints={detailedSummaryPoints} />
    </div>
  );
};