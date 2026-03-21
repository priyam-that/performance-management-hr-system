"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";

export default function HrAssistant() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "ai", text: string}[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setChatHistory(prev => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setIsAsking(true);

    try {
      const res = await fetch("/api/ai/hr-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get answer");

      setChatHistory(prev => [...prev, { role: "ai", text: data.answer }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { role: "ai", text: `Error: ${err.message}` }]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col h-[750px] border border-gray-100">
      <div className="flex items-center space-x-2 border-b border-gray-100 pb-3 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900">HR Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {chatHistory.length === 0 ? (
          <div className="text-sm text-gray-500 text-center mt-10">
             <p>Hi! Ask me questions about your team's existing reviews.</p>
             <p className="mt-2 text-xs italic bg-gray-50 p-3 rounded text-left border border-gray-100">
                Examples:<br/>
                - "Who hasn't been reviewed yet?"<br/>
                - "Who has the highest output quality?"<br/>
                - "Summarize feedback for Priyam Manna."
             </p>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`text-sm py-2 px-3 lg:max-w-[90%] max-w-[85%] ${
                msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-l-lg rounded-tr-lg" 
                  : "bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg whitespace-pre-wrap"
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isAsking && (
          <div className="flex justify-start">
             <div className="text-sm py-2 px-3 bg-gray-100 text-gray-500 rounded-r-lg rounded-tl-lg flex items-center">
               <Loader2 className="w-4 h-4 animate-spin mr-2" /> Thinking...
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="relative mt-auto">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          disabled={isAsking}
        />
        <button
          type="submit"
          disabled={isAsking || !question.trim()}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
