import React, { useState } from "react";

import VideoCall from "../calling/VideoCall";

import "./landing.css";



function LandingPage() {
  const [user, setUser] = useState("");
  const [peer, setPeer] = useState("");
  const [start, setStart] = useState(false);

  if (!start) {
    return (
      <div className="landing-container">
        <h1 className="landing-title">Smart Video Call</h1>
      <div className="landing-box">
        <h2>Join Video Call</h2>
        <input
          type="text"
          placeholder="Your username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="landing-input"
        />
        <input
          type="text"
          placeholder="Peer username"
          value={peer}
          onChange={(e) => setPeer(e.target.value)}
          className="landing-input"
        />
        <button
          onClick={() => setStart(true)}
          className="landing-btn"
        >
          Join
        </button>
      </div>
      </div>
    );
  }

  return <VideoCall username={user} peer={peer} />;
}




export default LandingPage;
