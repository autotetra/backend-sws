import React, { useState } from "react";
import api from "../api";

const Register: React.FC<{ onBackToLogin: () => void }> = ({
  onBackToLogin,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });
      alert("Registration successful! You can now log in.");
      onBackToLogin();
    } catch (err: any) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Registration failed.");
    }
  };

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <br />
        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Register</button>
      </form>

      <button onClick={onBackToLogin}>Back to Login</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Register;
