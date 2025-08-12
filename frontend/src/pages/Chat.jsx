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
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>💬 Bitcoin Chat</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              background:
                msg.id === "bot" ? "#f1f1f1" : msg.id === socket.id ? "#d1f7c4" : "#fff",
              padding: "5px",
              margin: "5px 0",
              borderRadius: "5px",
            }}
          >
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        style={{ padding: "5px", width: "80%" }}
      />
      <button onClick={sendMessage} style={{ padding: "5px 10px" }}>
        Send
      </button>
    </div>
  );
}
