import React, { useState, useEffect } from "react";
import api from "../api";

type Ticket = {
  _id: string;
  title: string;
  description?: string;
  category: "billing" | "technical" | "general";
  status: string;
  priority: string;
  createdBy: string;
  assignee?: string | null;
  createdAt: string;
};

const UserDashboard: React.FC<{ name: string }> = ({ name }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/tickets", {
        title,
        description,
        category,
      });

      setMessage("Ticket created successfully!");
      setTitle("");
      setDescription("");
      setCategory("");

      fetchTickets();
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to create ticket.");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      setMyTickets(res.data);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  };
  const deleteTicket = async (id: string) => {
    try {
      await api.delete(`/tickets/${id}`);

      // Immediately update UI
      setMyTickets((prev) => prev.filter((t) => t._id !== id));

      // Close panel if this ticket was open
      if (selectedTicket?._id === id) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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

      <h3>My Tickets</h3>

      {myTickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        <ul>
          {myTickets.map((t) => (
            <li
              key={t._id}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedTicket(t)}
            >
              {t.title}
            </li>
          ))}
        </ul>
      )}
      {selectedTicket && (
        <div style={{ marginTop: "20px" }}>
          <h3>Ticket Details</h3>
          <p>
            <strong>Title:</strong> {selectedTicket.title}
          </p>
          <p>
            <strong>Description:</strong> {selectedTicket.description}
          </p>
          <p>
            <strong>Category:</strong> {selectedTicket.category}
          </p>
          <p>
            <strong>Status:</strong> {selectedTicket.status}
          </p>
          <p>
            <strong>Priority:</strong> {selectedTicket.priority}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(selectedTicket.createdAt).toLocaleString()}
          </p>

          <button
            onClick={() => deleteTicket(selectedTicket._id)}
            style={{ marginRight: "10px", color: "red" }}
          >
            Delete Ticket
          </button>

          <button onClick={() => setSelectedTicket(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
