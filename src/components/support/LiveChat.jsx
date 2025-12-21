/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function LiveChat({ language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "agent",
      text:
        language === "en"
          ? "Hello! How can I help you today?"
          : "হ্যালো! আমি কিভাবে সাহায্য করতে পারি?",
    },
  ]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleSidebarToggle = (e) => setSidebarOpen(e.detail.isOpen);
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { type: "user", text: input },
      {
        type: "agent",
        text:
          language === "en"
            ? "Thank you for your message. Our support team will respond shortly."
            : "আপনার বার্তার জন্য ধন্যবাদ। আমাদের সাপোর্ট টিম শীঘ্রই উত্তর দেবে।",
      },
    ]);
    setInput("");
  };

  const whatsappNumber = "8801234567890";
  const phoneNumber = "+880-1234-567890";
  const email = "support@online24pharmacy.com";

  return (
    <>
      {/* Live Chat FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-md flex items-center justify-center transition-all duration-300"
      >
        <PhoneIcon className="w-6 h-6 text-white" />
      </button>

      {/* Live Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 max-w-[calc(100vw-3rem)] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-emerald-600 text-white rounded-t-2xl">
            <div>
              <h3 className="font-semibold">
                {language === "en" ? "Customer Support" : "গ্রাহক সহায়তা"}
              </h3>
              <p className="text-xs text-emerald-100">
                {language === "en"
                  ? "We're here to help"
                  : "আমরা সাহায্য করতে এখানে আছি"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-emerald-700 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Options */}
          <div className="p-4 bg-gray-50 border-b space-y-2">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <span className="text-xl">📱</span>
              <div className="flex-1">
                <p className="font-medium text-sm">WhatsApp</p>
                <p className="text-xs opacity-90">
                  {language === "en" ? "Chat instantly" : "তাৎক্ষণিক চ্যাট"}
                </p>
              </div>
            </a>

            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center space-x-3 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              <PhoneIcon className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{phoneNumber}</p>
                <p className="text-xs opacity-90">
                  {language === "en" ? "Call us now" : "এখনই কল করুন"}
                </p>
              </div>
            </a>

            <a
              href={`mailto:${email}`}
              className="flex items-center space-x-3 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <EnvelopeIcon className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{email}</p>
                <p className="text-xs opacity-90">
                  {language === "en" ? "Email support" : "ইমেইল সাপোর্ট"}
                </p>
              </div>
            </a>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.type === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  language === "en"
                    ? "Type your message..."
                    : "আপনার বার্তা লিখুন..."
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={handleSend}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
