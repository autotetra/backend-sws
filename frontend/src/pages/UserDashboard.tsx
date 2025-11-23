import React, { useState } from "react";
import api from "../api";

const UserDashboard: React.FC<{ name: string }> = ({ name }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/tickets", {
        title,
        description,
        category,
      });
      setMessage("Ticket created successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to create ticket.");
    }
  };

  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome, {name}!</p>

      <h3>Create Ticket</h3>

      <form onSubmit={handleCreateTicket}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="general">General</option>
        </select>

        <button type="submit">Create Ticket</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UserDashboard;
