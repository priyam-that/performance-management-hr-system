import { NextRequest, NextResponse } from "next/server";
import { appendReviewRow, getAllReviews } from "@/lib/google-sheets";
import { Review } from "@/lib/types";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: Review = await req.json();
    
    // Add server-side timestamps and manager email
    data.timestamp = new Date().toISOString();
    data.managerEmail = user.email;
    data.id = crypto.randomUUID();

    const success = await appendReviewRow(data);
    if (success) {
      return NextResponse.json({ success: true, review: data });
    } else {
      return NextResponse.json({ error: "Failed to append review" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

