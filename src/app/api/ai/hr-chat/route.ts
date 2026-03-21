import { NextResponse } from "next/server";
import { answerHrQuestion } from "@/lib/claude";
import { getAllReviews } from "@/lib/google-sheets";
import { USERS } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const allReviews = await getAllReviews();
    const employees = USERS.filter(u => u.role === "employee");

    const answer = await answerHrQuestion(question, allReviews, employees);
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error answering HR question:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to get answer" },
      { status: 500 }
    );
  }
}
