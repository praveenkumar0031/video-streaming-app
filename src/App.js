import React, { useState } from "react";
import VideoCall from "./components/calling/VideoCall";
import './styles.css';

function App() {
  const [user, setUser] = useState("");
  const [peer, setPeer] = useState("");
  const [start, setStart] = useState(false);

  if (!start) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Join Video Call</h1>
        <input
          type="text"
          placeholder="Your username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Peer username"
          value={peer}
          onChange={(e) => setPeer(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={() => setStart(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Join
        </button>
      </div>
    );
  }

  return <VideoCall username={user} peer={peer} />;
}

export default App;
