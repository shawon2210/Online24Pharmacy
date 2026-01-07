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

    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    const headers = {
      "Content-Type": "application/json",
    };
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    fetch(`${API_URL}/api/chatbot`, {
      method: "POST",
      headers,
      credentials: "include",
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
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-9999 group"
        >
          <div className="relative">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl opacity-60 blur-md group-hover:opacity-80 transition-opacity"></div>

            {/* Main Button */}
            <div className="relative bg-linear-to-br from-emerald-600 to-teal-600 p-3 sm:p-3.5 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200">
              <ChatBubbleLeftRightIcon className="w-6 h-6 sm:w-7 sm:h-7 text-background" />

              {/* AI Badge */}
              <div className="absolute -top-1 -right-1 bg-linear-to-r from-purple-600 to-pink-600 text-background text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
                <SparklesIcon className="w-2.5 h-2.5" />
                AI
              </div>

              {/* Status Dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background shadow-md">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatBoxRef}
          className="fixed bottom-20 right-2 sm:bottom-28 sm:right-6 z-9999 bg-background rounded-2xl shadow-2xl w-[calc(100vw-3rem)] sm:w-95 h-130 flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="relative bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 text-background p-3 sm:p-4 flex justify-between items-center overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-background rounded-full blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-0 right-0 w-32 h-32 bg-teal-200 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 w-24 h-24 bg-cyan-200 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 relative z-10">
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background shadow-md">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                  AI Pharmacy
                  <span className="text-[8px] sm:text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md font-semibold">
                    SMART
                  </span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-emerald-100 font-medium">
                  Deep Learning AI
                </p>
              </div>
            </div>

            <div className="flex gap-1 sm:gap-1.5 relative z-10">
              <button
                onClick={handleReset}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-all"
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
                className="hover:bg-white/20 p-1.5 rounded-lg transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3 bg-background">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-2.5 sm:p-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-linear-to-br from-emerald-500 to-teal-500 text-background rounded-br-sm shadow-md"
                      : "bg-background text-foreground rounded-bl-sm shadow-sm border border-border"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border">
                      <SparklesIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-500" />
                      <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600">
                        AI Assistant
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded-md">
                        Not medical advice
                      </span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {msg.text}
                  </p>
                  {msg.citations?.length ? (
                    <div className="mt-2 pt-2 border-t border-border space-y-1 text-[11px] sm:text-xs text-emerald-700">
                      <p className="font-semibold">Sources:</p>
                      {msg.citations.map((c, i) => (
                        <a
                          key={i}
                          href={c.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="block hover:text-emerald-800 underline"
                        >
                          {c.title || c.source || "Source"}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <p
                    className={`text-[9px] sm:text-[10px] mt-1.5 ${
                      msg.sender === "user"
                        ? "text-emerald-100"
                        : "text-muted-foreground"
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
              <div className="flex justify-start">
                <div className="bg-background p-2.5 sm:p-3 rounded-2xl rounded-bl-sm shadow-sm border border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-background0">
                      AI is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {suggestions.length > 0 && !isTyping && (
            <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-background border-t border-border">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                <LightBulbIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-500" />
                <span className="text-[10px] sm:text-xs font-semibold text-foreground">
                  Quick Questions
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-[10px] sm:text-xs bg-background hover:bg-emerald-50 text-foreground hover:text-emerald-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-border hover:border-emerald-300 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-50 border-t border-amber-200">
            <div className="flex items-start gap-1 sm:gap-1.5">
              <svg
                className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-600 shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-[9px] sm:text-[10px] text-amber-900 leading-relaxed">
                General info only. Consult a doctor for medical advice.
              </p>
            </div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-3 bg-background border-t border-border"
          >
            <div className="flex gap-1.5 sm:gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about medicines..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-background hover:bg-background transition-colors"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-linear-to-br from-emerald-500 to-teal-500 text-background p-2 sm:p-2.5 rounded-xl hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-background0 text-center leading-relaxed">
              AI assistance is not medical advice. Always consult a licensed
              clinician.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
