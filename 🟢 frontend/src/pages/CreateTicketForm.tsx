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
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("general");
  const [createdBy, setCreatedBy] = useState("");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState("");

  const agentUsers = users.filter((u) => u.role === "agent");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!createdBy) {
      setError("Created By is required");
      return;
    }

    try {
      await api.post("/admin/tickets", {
        title,
        description,
        status,
        priority,
        category,
        createdBy,
        assignee: assignee || null,
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
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="closed">closed</option>
        </select>
        <br />

        <label>Priority: </label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <br />

        <label>Category: </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="billing">billing</option>
          <option value="technical">technical</option>
          <option value="general">general</option>
        </select>
        <br />

        <label>Created By: </label>
        <select
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
        >
          <option value="">-- select --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>
        <br />

        <label>Assignee: </label>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">-- none --</option>
          {agentUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
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
