import { getReviewsForEmployee } from "@/lib/google-sheets";
import { format } from "date-fns";

export default async function ReviewTimeline({ employeeEmail }: { employeeEmail: string }) {
  const reviews = await getReviewsForEmployee(employeeEmail);

  if (reviews.length === 0) {
    return (
      <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">No performance reviews found yet.</p>
      </div>
    );
  }

  const ScoreBadge = ({ label, score }: { label: string; score: number }) => {
    let colorClass = "bg-green-100 text-green-800";
    if (score <= 2) colorClass = "bg-red-100 text-red-800";
    else if (score === 3) colorClass = "bg-yellow-100 text-yellow-800";

    return (
      <div className="flex flex-col items-center p-2 bg-gray-50 rounded border border-gray-100">
        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</span>
        <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
          {score} / 5
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-hidden relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-900">{review.month} Review</h4>
              <p className="text-xs text-gray-500 mt-1">
                Submitted on {review.timestamp ? format(new Date(review.timestamp), "MMM d, yyyy 'at' h:mm a") : 'Unknown Date'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              By Manager
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <ScoreBadge label="Output" score={review.outputQuality} />
            <ScoreBadge label="Attendance" score={review.attendance} />
            <ScoreBadge label="Teamwork" score={review.teamwork} />
          </div>

          <div>
            <h5 className="text-xs font-semibold tracking-wide text-gray-900 uppercase mb-2">Manager Feedback</h5>
            <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap border-l-4 border-blue-400">
              {review.comment}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
