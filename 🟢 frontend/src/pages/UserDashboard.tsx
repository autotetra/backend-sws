import React, { useState, useEffect } from "react";
import api from "../api";

type Ticket = {
  _id: string;
  title: string;
  description?: string;
  category: "Billing" | "Technical" | "General";
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
  const [error, setError] = useState("");

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
      const msg = err?.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      setMyTickets(res.data);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to fetch tickets";
      setError(msg);
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      await api.delete(`/tickets/${id}`);

      setMyTickets((prev) => prev.filter((t) => t._id !== id));

      if (selectedTicket?._id === id) {
        setSelectedTicket(null);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to delete ticket";
      setError(msg);
    }
  };

  // Save TITLE only
  const saveTitle = async () => {
    if (!selectedTicket) return;

    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, {
        title: editTitle,
      });

      const updated = res.data as Ticket;

      setMyTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );

      setSelectedTicket(updated);
      setIsEditingTitle(false);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to update title";
      setError(msg);
    }
  };

  // Save DESCRIPTION only
  const saveDescription = async () => {
    if (!selectedTicket) return;

    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, {
        description: editDescription,
      });

      const updated = res.data as Ticket;

      setMyTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );

      setSelectedTicket(updated);
      setIsEditingDescription(false);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Failed to update description";
      setError(msg);
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
          <option value="Technical">Technical</option>
          <option value="Billing">Billing</option>
          <option value="General">General</option>
        </select>

        <button type="submit">Create Ticket</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && !error && <p>{message}</p>}

      <h3>My Tickets</h3>

      {myTickets.length === 0 ? (
        <p>No tickets yet.</p>
      ) : (
        <ul>
          {myTickets.map((t) => (
            <li
              key={t._id}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedTicket(t);
                setEditTitle(t.title);
                setEditDescription(t.description || "");
                setIsEditingTitle(false);
                setIsEditingDescription(false);
              }}
            >
              {t.title}
            </li>
          ))}
        </ul>
      )}

      {selectedTicket && (
        <div style={{ marginTop: "20px" }}>
          <h3>Ticket Details</h3>

          {/* TITLE */}
          <p>
            <strong>Title:</strong>{" "}
            {!isEditingTitle ? (
              <>
                {selectedTicket.title}
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setIsEditingTitle(true)}
                >
                  Edit
                </button>
              </>
            ) : (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "300px" }}
                />
                <button style={{ marginLeft: "10px" }} onClick={saveTitle}>
                  Save
                </button>
                <button
                  style={{ marginLeft: "5px" }}
                  onClick={() => {
                    setEditTitle(selectedTicket.title);
                    setIsEditingTitle(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </p>

          {/* DESCRIPTION */}
          <p>
            <strong>Description:</strong>{" "}
            {!isEditingDescription ? (
              <>
                {selectedTicket.description}
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setIsEditingDescription(true)}
                >
                  Edit
                </button>
              </>
            ) : (
              <>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  style={{ width: "300px" }}
                />
                <button
                  style={{ marginLeft: "10px" }}
                  onClick={saveDescription}
                >
                  Save
                </button>
                <button
                  style={{ marginLeft: "5px" }}
                  onClick={() => {
                    setEditDescription(selectedTicket.description || "");
                    setIsEditingDescription(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
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
