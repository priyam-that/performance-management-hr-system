import { NextResponse } from "next/server";
import { generateImprovementPlan } from "@/lib/claude";

export async function POST(req: Request) {
  try {
    const { scores, comment } = await req.json();

    if (!scores) {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 });
    }

    const plan = await generateImprovementPlan(scores, comment || "");
    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Error generating improvement plan:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}
