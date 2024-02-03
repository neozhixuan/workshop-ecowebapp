import "./App.css";
import React from "react";
import LandingPage from "./LandingPage";
import { AuthProvider } from "./AuthProvider";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <LandingPage />
      </div>
    </AuthProvider>
  );
}

export default App;
