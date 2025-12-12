import React, { useState } from "react";
import api from "../api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Props {
  users: User[];
  onClose: () => void;
  onCreated: () => void;
}

const CreateTicketForm: React.FC<Props> = ({ users, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");

  const agentUsers = users.filter((u) => u.role === "Agent");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      await api.post("/tickets", {
        title,
        description,
        status,
        priority,
        category,
      });

      onCreated(); // refresh tickets
      onClose(); // close modal
    } catch (err) {
      console.error("Create ticket error:", err);
      setError("Failed to create ticket");
    }
  };

  return (
    <div>
      <h3>Create Ticket</h3>

      <form onSubmit={handleSubmit}>
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
          rows={3}
          style={{ width: "200px" }}
        />
        <br />

        <label>Status: </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
        <br />

        <label>Priority: </label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <br />

        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Billing">Billing</option>
          <option value="Technical">Technical</option>
          <option value="General">General</option>
        </select>
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

export default CreateTicketForm;
