import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';  // Add this line
import './Registration.css';

const Registration = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFullName = () => {
    setFullName(`${firstName} ${middleName} ${lastName}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Password and Confirm Password do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          fullName,
          mobileNumber,
          email,
          username,
          password,
        }),
      });

      setIsLoading(false);

      if (response.ok) {
        const data = await response.json();
        alert('Registration successful!');
        navigate('/'); // Redirect to login page after registration
      } else {
        const error = await response.text();
        alert(`Registration failed: ${error}`);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Registration failed:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="registration-container">
     <h1>Registration Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={handleFullName}
            required
          />
        </div>
        <div>
          <label>Middle Name:</label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            onBlur={handleFullName}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={handleFullName}
            required
          />
        </div>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            value={fullName}
            disabled
          />
        </div>
        <div>
          <label>Mobile Number:</label>
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
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
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="sign-in-prompt">
        <p>Already have an account? <Link to="/">Login</Link></p>
      </div>
    </div>
  );
};

export default Registration;
