import React, { useState } from "react";
import api from "../api";

interface CreateUserFormProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onClose,
  onCreated,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "agent" | "admin">("user");

  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      onCreated();
      onClose();
    } catch (err: any) {
      console.error("Create user failed:", err);
      setError("Failed to create user. Maybe email already exists?");
    }
  };

  return (
    <div>
      <h3>Create User</h3>
      <form onSubmit={handleCreate}>
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <br />

        <label>Role: </label>
        <select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="user">User</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>

        <br />
        <br />

        <button type="submit">Create</button>
        <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateUserForm;
