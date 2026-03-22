import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";
import ReviewForm from "./ReviewForm";
import HrAssistant from "./HrAssistant";
import LowScorersPanel from "./LowScorersPanel";

export default async function ManagerDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "manager") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Manager Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Submit monthly performance reviews and ask the HR Assistant questions.
            </p>
          </div>
        </div>


        {/* Review form + HR Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">New Review</h3>
            <ReviewForm />
          </div>
          <div className="lg:col-span-1">
            <HrAssistant />
          </div>
        </div>

        {/* Low Scorers Action Plans — full width */}
        <div className="mt-8">
          <LowScorersPanel />
        </div>
      </main>
    </div>
  );
}

