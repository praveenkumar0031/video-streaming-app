import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./call.css"; // external CSS

const VideoCall = ({ username, peer }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const stompClientRef = useRef(null);
  const pendingCandidates = useRef([]);

  const [connected, setConnected] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [busy, setBusy] = useState(false);
  const [remotePeerName, setRemotePeerName] = useState("");

  useEffect(() => {
    // Initialize WebSocket STOMP
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to signaling server");
        setConnected(true);

        // Subscribe to user topic
        stompClient.subscribe(`/topic/${username}`, (message) => {
          const data = JSON.parse(message.body);
          handleSignal(data);
        });
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      endCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, peer]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: "candidate",
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
          from: username,
          to: peer,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const sendSignal = (message) => {
    if (stompClientRef.current) {
      stompClientRef.current.publish({
        destination: "/app/signal",
        body: JSON.stringify(message),
      });
    }
  };

  const handleSignal = async (message) => {
    console.log("📩 Incoming signal:", message);
    if (!pcRef.current) return;
    const pc = pcRef.current;

    switch (message.type) {
      case "offer":
        setRemotePeerName(message.from);
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({
          type: "answer",
          answer: { type: answer.type, sdp: answer.sdp },
          from: username,
          to: message.from,
        });
        flushCandidates(pc);
        setInCall(true);
        break;

      case "answer":
        await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
        flushCandidates(pc);
        setInCall(true);
        break;

      case "candidate":
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          } catch (err) {
            console.error("❌ Error adding candidate", err);
          }
        } else {
          console.log("⏳ Queuing candidate...");
          pendingCandidates.current.push(message.candidate);
        }
        break;

      default:
        console.warn("⚠️ Unknown message type:", message.type);
        break;
    }
  };

  const flushCandidates = async (pc) => {
    for (const c of pendingCandidates.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.error("Error flushing candidate", err);
      }
    }
    pendingCandidates.current = [];
  };

  const startCall = async () => {
    const pc = createPeerConnection();
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({
      type: "offer",
      offer: { type: offer.type, sdp: offer.sdp },
      from: username,
      to: peer,
    });

    setInCall(true);
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setInCall(false);
  };

  return (
    <div className="video-call-container">
      <h1 className="video-call-title">
        Video Call: <span className="highlight">{username}</span>
      </h1>

      <div className="video-wrapper">
        <div className="video-box">
          <video ref={localVideoRef} autoPlay playsInline muted className="video" />
          <p className="video-label">{username}</p>
        </div>
        <div className="video-box">
          <video ref={remoteVideoRef} autoPlay playsInline className="video" />
          <p className="video-label">{remotePeerName || "Peer"}</p>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={startCall}
          disabled={!connected || inCall}
          className={`btn start-btn ${connected && !inCall ? "" : "disabled"}`}
        >
          📞 Start Call
        </button>
        <button
          onClick={endCall}
          disabled={!inCall}
          className={`btn end-btn ${inCall ? "" : "disabled"}`}
        >
          ❌ End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
