// frontend/src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"], // ensure WebSocket connection
});

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const usernameRef = useRef(`User-${Math.floor(Math.random() * 1000)}`);

  useEffect(() => {
    // Receive messages from server
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Receive live stats (optional)
    socket.on("statsUpdate", (stats) => {
      console.log("📊 Stats:", stats);
    });

    return () => {
      socket.off("chatMessage");
      socket.off("statsUpdate");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chatMessage", {
        username: usernameRef.current,
        message: input,
      });
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #74ABE2, #5563DE)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#fff",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "15px",
          background: "rgba(0,0,0,0.2)",
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          letterSpacing: "1px",
        }}
      >
        💬 Bitcoin Chat
      </header>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              alignSelf: msg.id === socket.id ? "flex-end" : "flex-start",
              background:
                msg.id === "bot"
                  ? "rgba(255, 255, 255, 0.2)"
                  : msg.id === socket.id
                  ? "rgba(0, 255, 150, 0.3)"
                  : "rgba(255, 255, 255, 0.1)",
              padding: "8px 12px",
              margin: "5px",
              borderRadius: "12px",
              maxWidth: "75%",
              wordBreak: "break-word",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            <strong style={{ color: "#FFD700" }}>{msg.username}:</strong>{" "}
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            outline: "none",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 16px",
            marginLeft: "8px",
            border: "none",
            borderRadius: "20px",
            background: "#FFD700",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
          onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
        >
          Send
        </button>
      </div>
    </div>
  );
}
