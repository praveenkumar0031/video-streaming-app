import React, { useState } from "react";
import axios from "axios";
import VideoCall from "../calling/VideoCall";

import './landing.css';
const LandingPage = () => {
  const [username, setUsername] = useState("");
  const [peer, setPeer] = useState("");
  const [inCall, setInCall] = useState(false);
  const [queueMessage, setQueueMessage] = useState("");

  const handleJoin = async () => {
    if (!username || !peer) {
      alert("Enter both username and peer!");
      return;
    }

    try {
      const allowed = await axios.post(
        `http://localhost:8080/call/request/${username}`
      );
      if (allowed.data === true) {
        setInCall(true);
      } else {
        setQueueMessage(
          "⚠️ Someone is already in a call. You are placed in the queue. Please wait..."
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnd = async () => {
    await axios.post(`http://localhost:8080/call/end/${username}`);
    setInCall(false);
    setQueueMessage("");
  };

  return (
    <div className="landing-container">
        <h1 className="landing-title">Smart Video Call</h1>
  <p className="landing-subtitle">Enter your username to join or queue for a call</p>
      {!inCall ? (
        
        <div className="landing-box">
          
          <h2>
            Join Video Call
          </h2>

          <input
            type="text"
            placeholder="Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="landing-input"
          />
          <input
            type="text"
            placeholder="frnd Username"
            value={peer}
            onChange={(e) => setPeer(e.target.value)}
            className="landing-input"
          />

          <button
            onClick={handleJoin}
            className="landing-btn"
          >
            Join Call
          </button>

          {queueMessage && (
            <p className="queue-msg">{queueMessage}</p>
          )}
        </div>
      ) : (
        <VideoCall username={username} peer={peer} onEnd={handleEnd} />
      )}
    </div>
  );
};

export default LandingPage;
