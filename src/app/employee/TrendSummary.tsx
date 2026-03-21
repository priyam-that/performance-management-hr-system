import { getReviewsForEmployee } from "@/lib/google-sheets";
import { summarizeEmployeeTrend } from "@/lib/claude";

export default async function TrendSummary({ employeeEmail }: { employeeEmail: string }) {
  const reviews = await getReviewsForEmployee(employeeEmail);
  const summary = await summarizeEmployeeTrend(reviews);

  return (
    <div className="text-sm text-blue-800 leading-relaxed italic">
      {summary}
    </div>
  );
}
