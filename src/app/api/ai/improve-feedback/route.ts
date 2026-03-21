import { NextRequest, NextResponse } from "next/server";
import { improveFeedback } from "@/lib/claude";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { draftComment, scores } = await req.json();
    if (!draftComment || !scores) {
      return NextResponse.json({ error: "Missing draftComment or scores" }, { status: 400 });
    }

    const improved = await improveFeedback(draftComment, scores);
    
    return NextResponse.json({ improvedComment: improved });
  } catch (error) {
    console.error("Error in POST /api/ai/improve-feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
