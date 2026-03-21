import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";
import ReviewTimeline from "./ReviewTimeline"; // We will create this
import TrendSummary from "./TrendSummary"; // We will create this

export default async function EmployeeDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "employee") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Performance Reviews
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View your historical scores and feedback.
            </p>
          </div>
        </div>

        {/* AI Section at the top */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                ✨
              </span>
            </div>
            <div className="ml-4 w-full">
              <h3 className="text-lg font-medium text-blue-900 mb-2">AI Performance Trend</h3>
              <TrendSummary employeeEmail={user.email} />
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Past Reviews</h3>
          <ReviewTimeline employeeEmail={user.email} />
        </section>
      </main>
    </div>
  );
}
