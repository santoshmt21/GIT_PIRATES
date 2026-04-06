import React, { useState, useEffect, useRef } from "react";
import { Send, X, Clock, User, MessageCircle } from "lucide-react";

const CHUNK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export default function ConsultationChat({ consultation, onClose, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  // We keep a ref to track messages that haven't been sent in the current 10-min block
  const unsentMessagesRef = useRef([]);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send chunks every 10 minutes
  useEffect(() => {
    const sendChunkToBackend = async () => {
      const chunk = unsentMessagesRef.current;
      if (chunk.length === 0) return; // Nothing to save

      console.log(`Sending a chunk of ${chunk.length} messages to backend...`);
      try {
        const response = await fetch("http://127.0.0.1:8000/chat/save_chunk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultation_id: String(consultation.id || "unknown"),
            doctor_name: String(consultation.doctor || "Unknown Doctor"),
            email: String(userEmail || "anonymous"),
            timestamp: new Date().toISOString(),
            messages: chunk,
          }),
        });
        if (response.ok) {
          console.log("Chat chunk saved successfully!");
          // Clear the unsent ref only after successful send
          unsentMessagesRef.current = [];
        } else {
          console.error("Failed to save chat chunk:", response.status);
        }
      } catch (err) {
        console.error("Error sending chat chunk:", err);
      }
    };

    const intervalId = setInterval(sendChunkToBackend, CHUNK_INTERVAL_MS);
    return () => {
      // Upon unmount, try to send any remaining ones immediately so we don't lose data
      if (unsentMessagesRef.current.length > 0) {
        sendChunkToBackend();
      }
      clearInterval(intervalId);
    };
  }, [consultation, userEmail]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "patient",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    unsentMessagesRef.current.push(newMessage);
    setInputText("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Dr. {consultation?.doctor}</h2>
              <p className="text-teal-100 text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> {consultation?.consult_reason || "Consultation"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-teal-50 px-4 py-2 border-b border-teal-100 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-teal-600" />
          <p className="text-xs text-teal-800 font-medium">
            This chat is monitored and securely saved every 10 minutes.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-sm font-medium">No messages yet.</p>
              <p className="text-gray-400 text-xs mt-1">Send a message to start consulting.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="self-end flex flex-col items-end max-w-[80%]">
                <div className="bg-teal-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm group relative">
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
                  {msg.time}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-100 rounded-full p-1 border border-gray-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal-500 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
