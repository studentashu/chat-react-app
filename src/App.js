import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
    };
  }, []);

  const handleLogin = () => {
    if (username.trim()) {
      socket.emit("join", username, (response) => {
        if (response.success) {
          setIsLoggedIn(true);
        } else {
          setError(response.message);
        }
      });
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const data = { user: username, text: message };
      socket.emit("sendMessage", data);
      setMessage("");
    }
  };

  return (
    <div className="container">
      {!isLoggedIn ? (
        <div className="login">
          <h2>Join Chat</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name..."
          />
          <button onClick={handleLogin}>Join</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <div className="chat-container">
          <div className="sidebar">
            <h3>Online Users</h3>
            <ul>
              {onlineUsers.map((user, idx) => (
                <li key={idx}>{user}</li>
              ))}
            </ul>
          </div>
          <div className="chat">
            <div className="messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.user === username ? "own" : ""}`}
                >
                  <strong>{msg.user}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <div className="input-box">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
