import Anthropic from "@anthropic-ai/sdk";
import { Review } from "./types";
import { User } from "./auth";

// Provide a mock client if there's no API key to prevent crashes in local dev without env vars
let anthropic: Anthropic | null = null;
const model = process.env.CLAUDE_MODEL || "claude-3-haiku-20240307";

if (process.env.CLAUDE_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });
}

/**
 * Meaningful AI Integration 1: Feedback Assistant for Managers
 * Takes a rough draft comment and improves it to be more constructive, specific, and professional.
 */
export async function improveFeedback(draftComment: string, scores: { outputQuality: number, attendance: number, teamwork: number}): Promise<string> {
  if (!anthropic) {
    return `${draftComment} (AI: Please add an CLAUDE_API_KEY to see improved text)`;
  }

  const prompt = `You are an expert HR coach. A manager has written a draft performance review comment. The employee scored: Output Quality: ${scores.outputQuality}/5, Attendance: ${scores.attendance}/5, Teamwork: ${scores.teamwork}/5.
  
Draft comment: "${draftComment}"

Please rewrite this comment to be professional, constructive, and actionable. It should flow naturally as a single paragraph. Keep the exact same sentiment (don't make it artificially positive if scores/draft are low), but make it sound more professional. Return ONLY the improved text, without quotes or introductory phrases.`;

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 300,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return (response.content[0] as any).text.trim();
}

/**
 * Meaningful AI Integration 2: Trend Summarization for Employees
 * Summarizes an employee's performance trend based on past reviews.
 */
export async function summarizeEmployeeTrend(reviews: Review[]): Promise<string> {
  if (reviews.length === 0) {
    return "Not enough data to generate a trend summary.";
  }
  
  if (!anthropic) {
    return "Your performance has been generally stable. (AI: Please add an CLAUDE_API_KEY to see real AI-generated trends based on your history).";
  }

  // Convert reviews to a readable format for Claude
  const historyText = reviews.map(r => 
    `Month: ${r.month} | Scores: Output(${r.outputQuality}/5), Attendance(${r.attendance}/5), Teamwork(${r.teamwork}/5) | Manager Comment: "${r.comment}"`
  ).join("\n");

  const prompt = `You are an encouraging but objective HR assistant. Analyze the following performance review history for an employee over the last few months (most recent first). 

${historyText}

Write a short, engaging 2-3 sentence summary addressed directly to the employee. Point out any clear trends (e.g., "Your teamwork has consistently improved," or "Your output quality dipped slightly this month"). Keep it supportive and plain English. Return ONLY the summary text.`;

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 200,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return (response.content[0] as any).text.trim();
}

/**
 * Meaningful AI Integration 3: Action Plan for Low Scorers
 * Generates a tailored, score-aware improvement plan for employees with low ratings.
 */
export async function generateImprovementPlan(
  scores: { outputQuality: number; attendance: number; teamwork: number },
  currentComment: string
): Promise<string> {
  if (!anthropic) {
    return "- Focus on missing areas.\n- Meet weekly. (AI: Please add CLAUDE_API_KEY)";
  }

  // Determine which areas are actually weak so the plan is targeted
  const weakAreas: string[] = [];
  if (scores.outputQuality <= 2)
    weakAreas.push(`Output Quality (${scores.outputQuality}/5)`);
  if (scores.attendance <= 2)
    weakAreas.push(`Attendance & Reliability (${scores.attendance}/5)`);
  if (scores.teamwork <= 2)
    weakAreas.push(`Teamwork & Collaboration (${scores.teamwork}/5)`);

  const weakAreasList = weakAreas.join(", ");

  const prompt = `You are a seasoned HR coach crafting a personalized 30-day improvement plan for an employee.

Performance scores:
- Output Quality: ${scores.outputQuality}/5
- Attendance & Reliability: ${scores.attendance}/5
- Teamwork & Collaboration: ${scores.teamwork}/5

Weak areas requiring attention: ${weakAreasList}
Manager's current comment: "${currentComment || "(no comment yet)"}"

Your task:
Write EXACTLY 3 bullet points as a focused action plan. Each bullet must:
1. Target a specific weak area by name
2. Suggest ONE concrete, measurable action (e.g. "attend all standups for 4 consecutive weeks", "submit deliverables 24 hours before deadline")
3. Be empathetic in tone — motivating, not punitive

Do NOT use generic advice like "improve communication" or "try harder". Be creative and specific.
Return ONLY the 3 bullet points, no preamble, no heading.`;

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 350,
    messages: [{ role: "user", content: prompt }],
  });

  return (response.content[0] as any).text.trim();
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Meaningful AI Integration 4: HR Assistant Chat
 * Supports multi-turn conversation history for contextual, non-repetitive answers.
 */
export async function answerHrQuestion(
  question: string,
  reviews: Review[],
  employees: User[],
  history: ChatMessage[] = []
): Promise<string> {
  if (!anthropic) {
    return "I am unable to answer without an API key. Please configure CLAUDE_API_KEY.";
  }

  const reviewsSummary =
    reviews.length === 0
      ? "No reviews have been submitted yet."
      : reviews
          .map(
            (r) =>
              `• ${r.employeeEmail} | ${r.month} | Output: ${r.outputQuality}/5, Attendance: ${r.attendance}/5, Teamwork: ${r.teamwork}/5 | "${r.comment}"`
          )
          .join("\n");

  const employeesSummary = employees
    .map((e) => `• ${e.name} (${e.email})`)
    .join("\n");

  const systemPrompt = `You are a sharp, friendly HR Assistant embedded in a performance management tool. A manager is chatting with you.

You have access to the following live data:

=== EMPLOYEES ===
${employeesSummary}

=== PERFORMANCE REVIEWS ===
${reviewsSummary}

Rules:
- Answer ONLY using the data above. If data is missing or insufficient, say so briefly and helpfully.
- Be concise: 1-3 sentences max unless the manager explicitly asks for a detailed breakdown.
- Vary your tone and wording — never start two consecutive answers the same way.
- Use plain English. No jargon. No bullet lists unless the question clearly calls for one.
- If the question is ambiguous, make a reasonable assumption and state it in one clause.
- Do NOT repeat yourself or hedge excessively. Be direct and confident.`;

  // Build the multi-turn message array
  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...history,
    { role: "user", content: question },
  ];

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 400,
    system: systemPrompt,
    messages,
  });

  return (response.content[0] as any).text.trim();
}
