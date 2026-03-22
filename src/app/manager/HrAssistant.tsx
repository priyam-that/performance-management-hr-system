"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type ChatEntry = { role: "user" | "ai"; text: string };

const EXAMPLE_QUESTIONS = [
  "Who has the lowest teamwork score?",
  "Summarize feedback for any employee this month.",
  "Which employees haven't been reviewed yet?",
  "Who has perfect attendance?",
];

export default function HrAssistant() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAsking]);

  const buildApiHistory = (entries: ChatEntry[]) =>
    entries.map((e) => ({
      role: e.role === "user" ? "user" : "assistant",
      content: e.text,
    }));

  const handleAsk = async (e?: React.FormEvent, overrideQuestion?: string) => {
    e?.preventDefault();
    const userQuestion = (overrideQuestion ?? question).trim();
    if (!userQuestion) return;

    const updatedHistory: ChatEntry[] = [
      ...chatHistory,
      { role: "user", text: userQuestion },
    ];
    setChatHistory(updatedHistory);
    setQuestion("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/ai/hr-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          // Send prior turns (exclude the one we just added) as history
          history: buildApiHistory(chatHistory),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");

      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "ai", text: `⚠️ ${err.message}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleReset = () => {
    setChatHistory([]);
    setQuestion("");
  };

  return (
    <div className="bg-white shadow rounded-lg flex flex-col h-[750px] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">HR Assistant</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
            AI · Multi-turn
          </span>
        </div>
        {chatHistory.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            title="Clear conversation"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {chatHistory.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-8 space-y-3">
            <Sparkles className="w-8 h-8 text-indigo-300 mx-auto" />
            <p className="font-medium text-gray-700">
              Ask anything about your team&apos;s reviews
            </p>
            <div className="grid grid-cols-1 gap-2 mt-4 text-left max-w-xs mx-auto">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAsk(undefined, q)}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md px-3 py-2 text-left transition-colors border border-indigo-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`text-sm py-2.5 px-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm whitespace-pre-wrap"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isAsking && (
          <div className="flex justify-start">
            <div className="text-sm py-2.5 px-3.5 bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm flex items-center space-x-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100">
        <form onSubmit={handleAsk} className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your team…"
            className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow"
            disabled={isAsking}
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="absolute inset-y-0 right-0 px-3.5 flex items-center text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5 pl-1">
          The assistant remembers your conversation — ask follow-up questions freely.
        </p>
      </div>
    </div>
  );
}
