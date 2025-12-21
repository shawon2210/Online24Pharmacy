import { useState, useRef, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SUGGESTIONS = [
  "What is this medicine used for?",
  "Common side effects of paracetamol",
  "Can I take cetirizine at night?",
  "Which medicines for gastric issues?",
];

export default function AIChatbot({ language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions] = useState(SUGGESTIONS);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);
    const prompt = inputMessage;
    setInputMessage("");

    fetch(`${API_URL}/api/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt, language }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Service unavailable");
        }
        return res.json();
      })
      .then((json) => {
        const botMessage = {
          text: json.answer,
          sender: "bot",
          timestamp: new Date(),
          citations: json.citations || [],
          caution: json.caution,
        };
        setMessages((prev) => [...prev, botMessage]);
      })
      .catch((err) => {
        const botMessage = {
          text:
            err.message ||
            "I couldn't answer safely. Please consult a licensed clinician.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      })
      .finally(() => setIsTyping(false));
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleReset = () => {
    setMessages([
      {
        text: "Hello! I can answer questions about medicines, uses, side effects, and safety. Not medical advice.",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (messages.length === 0) {
              setMessages([
                {
                  text: "Hello! I can answer questions about medicines, uses, side effects, and safety. Not medical advice.",
                  sender: "bot",
                  timestamp: new Date(),
                },
              ]);
            }
          }}
          className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-110 transition-all duration-300 group"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7" />
          <SparklesIcon className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />

          {/* Pulse Ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping"></div>

          {/* AI Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
            AI
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatBoxRef}
          className="fixed bottom-24 right-6 z-[9999] bg-white rounded-2xl shadow-2xl w-[440px] h-[700px] flex flex-col overflow-hidden border-2 border-emerald-100"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3 flex justify-between items-center overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-200 rounded-full blur-3xl animate-pulse delay-75"></div>
            </div>

            <div className="flex items-center gap-2 relative z-10">
              <div className="relative">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  AI Pharmacy
                  <span className="text-[9px] bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                    SMART
                  </span>
                </h3>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                  Deep Learning AI
                </p>
              </div>
            </div>

            <div className="flex gap-1 relative z-10">
              <button
                onClick={handleReset}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200"
                title="Reset"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gradient-to-b from-emerald-50/30 via-white to-teal-50/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <div
                  className={`max-w-[82%] p-2.5 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-none shadow-lg"
                      : "bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-100"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-1 mb-1 pb-1 border-b border-gray-100">
                      <SparklesIcon className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-semibold text-emerald-600">
                        AI
                      </span>
                      <span className="text-[9px] text-amber-700 font-semibold bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
                        Not medical advice
                      </span>
                      {msg.caution ? (
                        <span className="text-[9px] text-rose-700 font-semibold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full">
                          Safety caution
                        </span>
                      ) : null}
                    </div>
                  )}
                  <p className="text-[13px] whitespace-pre-line leading-snug">
                    {msg.text}
                  </p>
                  {msg.citations?.length ? (
                    <div className="mt-2 space-y-1 text-[11px] text-emerald-700">
                      <p className="font-semibold">Sources</p>
                      {msg.citations.map((c, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-emerald-500">•</span>
                          <a
                            href={c.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-emerald-800"
                          >
                            {c.title || c.source || c.url || "Source"}
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p
                    className={`text-[9px] mt-1 ${
                      msg.sender === "user"
                        ? "text-emerald-100"
                        : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white p-2 rounded-2xl rounded-bl-none shadow-md border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-[10px] text-gray-500">typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {suggestions.length > 0 && !isTyping && (
            <div className="px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100">
              <div className="flex items-center gap-1 mb-0.5">
                <LightBulbIcon className="w-3 h-3 text-amber-500 flex-shrink-0" />
                <span className="text-[9px] font-semibold text-gray-600">
                  {language === "bn" ? "সাজেশন" : "Quick"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[9px] bg-white hover:bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200 hover:border-emerald-400 transition-all shadow-sm whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200">
            <div className="flex items-start gap-1">
              <svg
                className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[9px] text-amber-900 leading-tight">
                {language === "bn"
                  ? "সাধারণ তথ্য মাত্র। চিকিৎসার জন্য ডাক্তারের পরামর্শ নিন।"
                  : "General info only. Consult a doctor for medical advice."}
              </p>
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 bg-white border-t-2 border-gray-100"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === "bn"
                    ? "প্রশ্ন লিখুন..."
                    : "Ask about medicines..."
                }
                className="flex-1 px-3 py-2 text-[13px] border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-500 text-center">
              AI assistance is not medical advice. Always consult a licensed
              clinician.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
