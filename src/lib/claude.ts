import Anthropic from "@anthropic-ai/sdk";
import { Review } from "./types";

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
