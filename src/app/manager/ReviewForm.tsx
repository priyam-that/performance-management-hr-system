"use client";

import { useState } from "react";
import { USERS, User } from "@/lib/auth";
import { Sparkles, Send, Loader2, CheckCircle2, Star } from "lucide-react";

const EMPLOYEES = USERS.filter((user) => user.role === "employee");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ReviewForm() {
  const currentMonth = `${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;
  
  const [employeeEmail, setEmployeeEmail] = useState(EMPLOYEES[0]?.email || "");
  const [month, setMonth] = useState(currentMonth);
  const [outputQuality, setOutputQuality] = useState(3);
  const [attendance, setAttendance] = useState(3);
  const [teamwork, setTeamwork] = useState(3);
  const [comment, setComment] = useState("");

  const [isImproving, setIsImproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  const [improvementPlan, setImprovementPlan] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  const hasLowScore = outputQuality <= 2 || attendance <= 2 || teamwork <= 2;

  const handleImproveFeedback = async () => {
    if (!comment.trim()) {
      setError("Please write a draft comment first before improving.");
      return;
    }

    setIsImproving(true);
    setError("");

    try {
      const res = await fetch("/api/ai/improve-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftComment: comment,
          scores: { outputQuality, attendance, teamwork },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to improve feedback");

      setComment(data.improvedComment);
    } catch (err: any) {
      setError(err.message || "An error occurred while calling Claude API.");
    } finally {
      setIsImproving(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    setError("");
    try {
      const res = await fetch("/api/ai/improvement-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: { outputQuality, attendance, teamwork },
          comment
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");
      setImprovementPlan(data.plan);
    } catch (err: any) {
      setError(err.message || "Failed to generate plan");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeEmail || !month || !comment.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail,
          month,
          outputQuality,
          attendance,
          teamwork,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setSuccessMessage("Review submitted successfully!");
      // Reset form slightly for next review
      setComment("");
      setOutputQuality(3);
      setAttendance(3);
      setTeamwork(3);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to submit. Check network and console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreSelector = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{value} / 5</span>
      </div>
      <div className="flex items-center space-x-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 focus:outline-none transition-colors ${
              value >= star ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Star className="w-8 h-8" fill={value >= star ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1 w-48">
        <span>Needs Work</span>
        <span>Exceptional</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm border border-green-200 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
          >
            {EMPLOYEES.map((emp) => (
              <option key={emp.email} value={emp.email}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Review Month</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            placeholder="e.g. March 2026"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Performance Scores</h4>
        <ScoreSelector label="Output Quality" value={outputQuality} onChange={setOutputQuality} />
        <ScoreSelector label="Attendance & Reliability" value={attendance} onChange={setAttendance} />
        <ScoreSelector label="Teamwork & Collaboration" value={teamwork} onChange={setTeamwork} />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-end mb-2">
          <label className="block text-sm font-medium text-gray-700">Manager Comments</label>
          <button
            type="button"
            onClick={handleImproveFeedback}
            disabled={isImproving || !comment.trim()}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            {isImproving ? (
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Improving...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1.5" /> Improve with AI</>
            )}
          </button>
        </div>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-3"
          placeholder="Write your constructive feedback here..."
        />
        <p className="mt-2 text-sm text-gray-500">
          Tip: Write a quick draft, then use the "Improve with AI" button to make it more professional.
        </p>

        {hasLowScore && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-medium text-yellow-800">Low Score Detected</h5>
                <p className="text-xs text-yellow-700 mt-1">A score of 2 or below suggests the employee needs an action plan.</p>
              </div>
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-yellow-400 transition-colors"
              >
                {isGeneratingPlan ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                Generate Plan
              </button>
            </div>
            {improvementPlan && (
              <div className="mt-3 bg-white p-3 rounded border border-yellow-200 text-sm text-gray-700 whitespace-pre-wrap">
                <strong className="block mb-2 text-gray-900">Suggested Action Plan:</strong>
                {improvementPlan}
                <button
                  type="button"
                  onClick={() => {
                    setComment(prev => prev ? `${prev}\n\nAction Plan:\n${improvementPlan}` : `Action Plan:\n${improvementPlan}`);
                    setImprovementPlan("");
                  }}
                  className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  + Append to my comments
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 w-full md:w-auto"
        >
          {isSubmitting ? (
             <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4 mr-2" /> Submit Review</>
          )}
        </button>
      </div>
    </form>
  );
}
