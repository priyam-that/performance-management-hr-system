import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";
import ReviewForm from "./ReviewForm"; // We will create this

export default async function ManagerDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "manager") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Submit Monthly Performance Review
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Evaluate your team members on core dimensions and provide constructive feedback.
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <ReviewForm />
        </div>
      </main>
    </div>
  );
}
