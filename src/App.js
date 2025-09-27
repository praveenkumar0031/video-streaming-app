import React, { useState } from "react";
import VideoCall from "./components/calling/VideoCall";
import "./styles.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/Landpage/LandingPage";

function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/login" element={<LandingPage />} />
        <Route path="/video-calling" element={<VideoCall />} />
        
        
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </Router>

  );
}
export default App;