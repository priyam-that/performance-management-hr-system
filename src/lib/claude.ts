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
 * Generates an improvement plan if scores are low.
 */
export async function generateImprovementPlan(scores: { outputQuality: number, attendance: number, teamwork: number}, currentComment: string): Promise<string> {
  if (!anthropic) {
    return "- Focus on missing areas.\n- Meet weekly. (AI: Please add CLAUDE_API_KEY)";
  }

  const prompt = `You are an expert HR coach. A manager is evaluating an employee who received low scores in certain areas. 
Scores: Output Quality: ${scores.outputQuality}/5, Attendance: ${scores.attendance}/5, Teamwork: ${scores.teamwork}/5.
Manager's draft comment so far: "${currentComment}"

Generate a short, constructive 2-3 bullet point action plan for this employee to improve their low-scoring areas. Write it such that the manager can append it directly to the performance review comment. Keep it very plain English, empathetic yet direct. Return ONLY the bullet points.`;

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 250,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return (response.content[0] as any).text.trim();
}

/**
 * Meaningful AI Integration 4: HR Assistant Chat
 */
export async function answerHrQuestion(question: string, reviews: Review[], employees: User[]): Promise<string> {
  if (!anthropic) {
    return "I am unable to answer without an API key. Please configure CLAUDE_API_KEY.";
  }

  const reviewsSummary = reviews.map(r => `[Employee: ${r.employeeEmail}, Month: ${r.month}, Output: ${r.outputQuality}, Attendance: ${r.attendance}, Teamwork: ${r.teamwork}, Comment: "${r.comment}"]`).join("\n");
  const employeesSummary = employees.map(e => `[Name: ${e.name}, Email: ${e.email}, Role: ${e.role}]`).join("\n");

  const prompt = `You are a helpful and intelligent HR Assistant for a Manager.
You have access to the following raw data about employees and their performance reviews.

EMPLOYEES:
${employeesSummary}

REVIEWS:
${reviewsSummary}

The manager is asking the following question:
"${question}"

Answer to the best of your ability using ONLY the data provided above. If you don't know or if the data doesn't contain the answer, say so directly. Be concise, friendly, and plain English.`;

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 300,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return (response.content[0] as any).text.trim();
}
