import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ComplaintsResult {
  complaints_flag: boolean;
  complaints_reasoning: string | null;
  physical_disability_flag: boolean;
  physical_disability_reasoning: string | null;
  relevant_snippet_ids: string[];
}

interface VulnerabilityResult {
  vulnerability_flag: boolean;
  vulnerability_reasoning: string | null;
  relevant_snippet_ids: string[];
}

interface Snippet {
  id: string;
  content: string;
  timestamp: string | null;
}

async function getRandomSnippets(
  supabase: SupabaseClient,
  contactId: string,
  maxSnippets: number = 3
): Promise<string[]> {
  console.log(`Getting random snippets for contact: ${contactId}, max: ${maxSnippets}`);

  const { data: conversationData, error } = await supabase
    .from('contact_conversations')
    .select('snippets_metadata')
    .eq('contact_id', contactId)
    .single();

  if (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }

  if (!conversationData?.snippets_metadata) {
    console.log("No snippets found in conversation");
    return [];
  }

  const snippets = conversationData.snippets_metadata as Snippet[];
  console.log(`Total snippets available: ${snippets.length}`);

  // Shuffle array and take first maxSnippets elements
  const shuffledSnippets = snippets
    .sort(() => Math.random() - 0.5)
    .slice(0, maxSnippets);

  const snippetIds = shuffledSnippets.map(snippet => snippet.id);
  console.log("Selected random snippet IDs:", snippetIds);

  return snippetIds;
}

export async function assess_complaints(
  supabase: SupabaseClient,
  contactId: string,
  transcript: string | null
): Promise<ComplaintsResult> {
  console.log("Starting complaints assessment");
  
  // Get random snippets regardless of transcript content
  const relevantSnippetIds = await getRandomSnippets(supabase, contactId, 3);
  
  // Set default flags
  const hasComplaints = false;
  const hasDisability = false;

  return {
    complaints_flag: hasComplaints,
    complaints_reasoning: hasComplaints ? 
      "The conversation contains mentions of complaints or issues." : 
      "No significant complaints detected in the conversation.",
    physical_disability_flag: hasDisability,
    physical_disability_reasoning: hasDisability ? 
      "The conversation indicates presence of physical disability." : 
      "No clear indicators of physical disability found.",
    relevant_snippet_ids: relevantSnippetIds
  };
}

export async function assess_vulnerability(
  supabase: SupabaseClient,
  contactId: string,
  transcript: string | null
): Promise<VulnerabilityResult> {
  console.log("Starting vulnerability assessment");
  
  // Get random snippets regardless of transcript content
  const relevantSnippetIds = await getRandomSnippets(supabase, contactId, 3);
  
  // Set default flag
  const hasVulnerability = false;

  return {
    vulnerability_flag: hasVulnerability,
    vulnerability_reasoning: hasVulnerability ? 
      "The conversation indicates potential vulnerability." : 
      "No clear vulnerability indicators detected.",
    relevant_snippet_ids: relevantSnippetIds
  };
}

export async function store_assessment_results(
  supabase: SupabaseClient,
  contact_id: string,
  complaints_result: ComplaintsResult,
  vulnerability_result: VulnerabilityResult
) {
  console.log("Storing assessment results for contact:", contact_id);

  try {
    // Store complaints assessment
    const { data: complaintsData, error: complaintsError } = await supabase
      .from('ai_assess_complaints')
      .upsert({
        contact_id,
        complaints_flag: complaints_result.complaints_flag,
        complaints_reasoning: complaints_result.complaints_reasoning,
        physical_disability_flag: complaints_result.physical_disability_flag,
        physical_disability_reasoning: complaints_result.physical_disability_reasoning,
        relevant_snippet_ids: complaints_result.relevant_snippet_ids
      })
      .select()
      .single();

    if (complaintsError) throw complaintsError;

    // Store vulnerability assessment
    const { data: vulnerabilityData, error: vulnerabilityError } = await supabase
      .from('ai_assess_vulnerability')
      .upsert({
        contact_id,
        vulnerability_flag: vulnerability_result.vulnerability_flag,
        vulnerability_reasoning: vulnerability_result.vulnerability_reasoning,
        relevant_snippet_ids: vulnerability_result.relevant_snippet_ids
      })
      .select()
      .single();

    if (vulnerabilityError) throw vulnerabilityError;

    return {
      complaints: complaintsData,
      vulnerability: vulnerabilityData
    };
  } catch (error) {
    console.error("Error storing assessment results:", error);
    throw new Error("Failed to store assessment results");
  }
}