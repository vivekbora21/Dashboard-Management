import React, { useState } from "react";
import Signup from "./components/SignupForm.jsx";
import Login from "./components/LoginForm.jsx";
import "./components/AppStyle.css";

function App() {
  const [currentView, setCurrentView] = useState('Login')
  return (
    <div className="app">
      {currentView === 'Login' ? (
        <Login onSwitchToSignup={() => setCurrentView('Signup')} />
      ) : (
        <Signup onSwitchToLogin={() => setCurrentView('Login')} />
      )}
    </div>
  );
}

export default App;
