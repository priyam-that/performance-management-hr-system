"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  PlusCircle,
} from "lucide-react";
import { Review } from "@/lib/types";

interface LowScorer {
  employeeEmail: string;
  month: string;
  outputQuality: number;
  attendance: number;
  teamwork: number;
  comment: string;
  weakAreas: string[];
}

const SCORE_LABELS: Record<string, string> = {
  outputQuality: "Output Quality",
  attendance: "Attendance",
  teamwork: "Teamwork",
};

const SCORE_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-blue-100 text-blue-700",
  5: "bg-green-100 text-green-700",
};

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${SCORE_COLORS[value] ?? "bg-gray-100 text-gray-600"}`}
    >
      {label}: {value}/5
    </span>
  );
}

export default function LowScorersPanel() {
  const [lowScorers, setLowScorers] = useState<LowScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Per-employee state
  const [plans, setPlans] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const fetchLowScorers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load reviews");

      const reviews: Review[] = data.reviews ?? [];

      // Keep only the most recent review per employee
      const latestByEmployee: Record<string, Review> = {};
      for (const r of reviews) {
        const existing = latestByEmployee[r.employeeEmail];
        if (!existing || r.timestamp > existing.timestamp) {
          latestByEmployee[r.employeeEmail] = r;
        }
      }

      // Filter those with any score ≤ 2
      const scorers: LowScorer[] = Object.values(latestByEmployee)
        .filter(
          (r) => r.outputQuality <= 2 || r.attendance <= 2 || r.teamwork <= 2
        )
        .map((r) => ({
          employeeEmail: r.employeeEmail,
          month: r.month,
          outputQuality: r.outputQuality,
          attendance: r.attendance,
          teamwork: r.teamwork,
          comment: r.comment,
          weakAreas: [
            r.outputQuality <= 2 ? "Output Quality" : "",
            r.attendance <= 2 ? "Attendance" : "",
            r.teamwork <= 2 ? "Teamwork" : "",
          ].filter(Boolean),
        }));

      setLowScorers(scorers);
    } catch (err: any) {
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowScorers();
  }, [fetchLowScorers]);

  const handleGeneratePlan = async (scorer: LowScorer) => {
    const key = scorer.employeeEmail;
    setGenerating((prev) => ({ ...prev, [key]: true }));
    setExpanded((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await fetch("/api/ai/improvement-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: {
            outputQuality: scorer.outputQuality,
            attendance: scorer.attendance,
            teamwork: scorer.teamwork,
          },
          comment: scorer.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate plan");
      setPlans((prev) => ({ ...prev, [key]: data.plan }));
    } catch (err: any) {
      setPlans((prev) => ({ ...prev, [key]: `⚠️ ${err.message}` }));
    } finally {
      setGenerating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCopy = async (email: string) => {
    const text = plans[email];
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAddToComment = (email: string) => {
    const text = plans[email];
    if (!text) return;
    window.dispatchEvent(
      new CustomEvent("review-append-plan", { detail: { plan: text } })
    );
    // Scroll up so the manager can see the comment box
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAdded(email);
    setTimeout(() => setAdded(null), 2500);
  };

  return (
    <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h3 className="text-base font-semibold text-amber-900">
            Low Score Action Plans
          </h3>
        </div>
        <button
          type="button"
          onClick={fetchLowScorers}
          title="Refresh"
          disabled={loading}
          className="text-amber-500 hover:text-amber-700 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Body */}
      <div className="divide-y divide-gray-100">
        {loading && (
          <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading reviews…
          </div>
        )}

        {!loading && error && (
          <div className="px-6 py-4 text-sm text-red-600">{error}</div>
        )}

        {!loading && !error && lowScorers.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            <ClipboardCheck className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="font-medium text-gray-700">All clear!</p>
            <p className="text-xs mt-1">No employees have low scores right now.</p>
          </div>
        )}

        {!loading &&
          lowScorers.map((scorer) => {
            const key = scorer.employeeEmail;
            const isExpanded = expanded[key];
            const plan = plans[key];
            const isGenerating = generating[key];

            return (
              <div key={key} className="p-5">
                {/* Employee info row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {scorer.employeeEmail}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Latest review: {scorer.month}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <ScoreBadge label="Output" value={scorer.outputQuality} />
                      <ScoreBadge label="Attendance" value={scorer.attendance} />
                      <ScoreBadge label="Teamwork" value={scorer.teamwork} />
                    </div>
                    {scorer.weakAreas.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1.5 font-medium">
                        ⚠ Weak: {scorer.weakAreas.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Generate Plan button */}
                  <button
                    type="button"
                    onClick={() =>
                      plan
                        ? setExpanded((prev) => ({ ...prev, [key]: !isExpanded }))
                        : handleGeneratePlan(scorer)
                    }
                    disabled={isGenerating}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 transition-colors shadow-sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating…
                      </>
                    ) : plan ? (
                      <>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                        {isExpanded ? "Hide Plan" : "View Plan"}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Plan
                      </>
                    )}
                  </button>
                </div>

                {/* Plan output */}
                {isExpanded && plan && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-amber-900">
                        📋 30-Day Improvement Plan
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopy(key)}
                        className="text-xs text-amber-700 hover:text-amber-900 font-medium transition-colors"
                      >
                        {copied === key ? "✓ Copied!" : "Copy"}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {plan}
                    </p>
                    <div className="mt-3 flex items-center gap-3 border-t border-amber-100 pt-3">
                      {/* ← NEW: inject plan into the comment box above */}
                      <button
                        type="button"
                        onClick={() => handleAddToComment(key)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        {added === key ? "✓ Added to Comment!" : "Add to Comment Box"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleGeneratePlan(scorer)}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 font-medium disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
