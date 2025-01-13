import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [captcha, setCaptcha] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return captcha;
  };

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []); // Run once to set the CAPTCHA when the component loads

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate CAPTCHA
    if (inputCaptcha !== captcha) {
      alert('Invalid CAPTCHA');
      setCaptcha(generateCaptcha()); // Generate new CAPTCHA on failure
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/login-mysql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      setIsLoading(false);

      if (response.ok) {
        const data = await response.json();
        alert('Login successful!');
        localStorage.setItem('token', data.token);
        navigate('/admission');
      } else {
        const error = await response.text();
        alert(`Login failed: ${error}`);
        setCaptcha(generateCaptcha()); // Generate new CAPTCHA on failure
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login failed:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Handle new user button click
  const handleNewUserClick = () => {
    navigate('/register'); // Navigate to the registration page
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="captcha-container">
        <label>CAPTCHA:</label> 
        <label className="captcha-text"><strong><b>{captcha}</b></strong></label>
        <br></br>
      <input
        type="text" 
        value={inputCaptcha}
        onChange={(e) => setInputCaptcha(e.target.value)}
        className="captcha-input"
        required
      />
    </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button onClick={handleNewUserClick}>New to Application?</button>
    </div>
  );
};

export default Login;
