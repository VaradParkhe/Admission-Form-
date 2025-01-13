import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login/Login';
import AdmissionForm from './Front/Admission';
import Records from './Record/Record';
import Registration from './Registration/Registration';
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'; // Import the ProtectedRoute component

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on initial load
  useEffect(() => {
    const token = localStorage.getItem('token'); // Check for token in localStorage
    if (token) {
      setIsLoggedIn(true); // If token exists, the user is logged in
    } else {
      setIsLoggedIn(false); // No token means not logged in
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('token', 'your-secure-token'); // Store token in localStorage
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token'); // Remove token from localStorage on logout
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<Login handleLogin={handleLogin} />} />

          {/* Registration route */}
          <Route path="/register" element={<Registration />} />

          {/* Protected routes */}
          <Route
            path="/admission"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <AdmissionForm handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/records"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Records handleLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
