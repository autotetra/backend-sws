import React, { useEffect, useState } from "react";
import api from "../api";
import io from "socket.io-client";

type Comment = {
  _id: string;
  body: string;
  createdAt: string;
  author?: {
    email?: string;
  } | null;
};

type Ticket = {
  _id: string;
  title: string;
  description?: string;
  status: "Open" | "In Progress" | "Closed";
  category: "Billing" | "Technical" | "General";
  priority: "Low" | "Medium" | "High";
  createdBy: any;
  assignee: any;
  createdAt: string;
  comments?: Comment[];
};

interface AgentDashboardProps {
  name: string;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ name }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [editPriority, setEditPriority] = useState<"Low" | "Medium" | "High">(
    "Medium"
  );
  const [editStatus, setEditStatus] = useState<
    "Open" | "In Progress" | "Closed"
  >("Open");

  const [newComment, setNewComment] = useState("");

  // ---------------------------------------------------
  // SOCKET CONNECTION
  // ---------------------------------------------------
  useEffect(() => {
    const s = io("http://localhost:5050", { withCredentials: true } as any);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // ---------------------------------------------------
  // FETCH TICKETS (list)
  // ---------------------------------------------------
  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  // ---------------------------------------------------
  // FETCH FULL POPULATED TICKET
  // ---------------------------------------------------
  const fetchFullTicket = async (id: string) => {
    try {
      const res = await api.get<Ticket>(`/tickets/${id}`);
      setSelectedTicket(res.data);
    } catch (err) {
      console.error("Failed to load full ticket:", err);
    }
  };

  // ---------------------------------------------------
  // SOCKET LISTENERS (no stale selectedTicket!)
  // ---------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    const refreshList = () => fetchTickets();

    const handleSocketUpdate = (updated: Ticket) => {
      fetchTickets();

      setSelectedTicket((prev) => {
        if (!prev) return prev;

        // 🔥 If this ticket was open BUT is no longer assigned → CLOSE IT
        if (prev._id === updated._id && !updated.assignee) {
          return null;
        }

        // Otherwise update it in place
        if (prev._id === updated._id) {
          return updated;
        }

        return prev;
      });

      // 🔥 Only sync edit state if this ticket is still open
      if (
        selectedTicket &&
        selectedTicket._id === updated._id &&
        updated.assignee
      ) {
        setEditPriority(updated.priority);
        setEditStatus(updated.status);
      }
    };

    const handleDelete = (ticketId: string) => {
      fetchTickets();

      setSelectedTicket((prev) =>
        prev && prev._id === ticketId ? null : prev
      );
    };

    socket.on("ticketCreated", refreshList);
    socket.on("ticketUpdated", handleSocketUpdate);
    socket.on("ticketDeleted", handleDelete);

    return () => {
      socket.off("ticketCreated", refreshList);
      socket.off("ticketUpdated", handleSocketUpdate);
      socket.off("ticketDeleted", handleDelete);
    };
  }, [socket]);

  // Initial load
  useEffect(() => {
    fetchTickets();
  }, []);

  // ---------------------------------------------------
  // SELECT TICKET
  // ---------------------------------------------------
  const handleSelectTicket = async (t: Ticket) => {
    await fetchFullTicket(t._id);

    setEditPriority(t.priority);
    setEditStatus(t.status);
    setNewComment("");
  };

  // ---------------------------------------------------
  // SAVE CHANGES (no closing modal)
  // ---------------------------------------------------
  const handleSave = async () => {
    if (!selectedTicket) return;

    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, {
        priority: editPriority,
        status: editStatus,
      });

      const updated = res.data as Ticket;

      // Update list
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );

      // Keep modal open, update contents
      setSelectedTicket(updated);
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Failed to update ticket");
    }
  };

  // ---------------------------------------------------
  // ADD COMMENT
  // ---------------------------------------------------
  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/comments`, {
        body: newComment,
      });

      const updated = res.data as Ticket;

      // Update selected ticket immediately
      setSelectedTicket(updated);

      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    }
  };

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------
  return (
    <div>
      <h2>Agent Dashboard</h2>
      <p>Welcome, {name}!</p>

      <h3>Assigned Tickets</h3>

      {tickets.length === 0 ? (
        <p>No assigned tickets.</p>
      ) : (
        <ul>
          {tickets.map((t) => (
            <li
              key={t._id}
              style={{ cursor: "pointer" }}
              onClick={() => handleSelectTicket(t)}
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
            <strong>Priority:</strong>
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
              style={{ marginLeft: "10px" }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </p>

          <p>
            <strong>Status:</strong>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as any)}
              style={{ marginLeft: "10px" }}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {new Date(selectedTicket.createdAt).toLocaleString()}
          </p>

          <button onClick={handleSave} style={{ marginRight: "10px" }}>
            Save Changes
          </button>

          {/* COMMENTS */}
          <h3>Comments</h3>

          <ul>
            {selectedTicket.comments?.map((c) => (
              <li key={c._id} style={{ marginBottom: "10px" }}>
                <strong>{c.author?.email || "Unknown user"}:</strong>
                <br />
                {c.body}
                <br />
                <small>{new Date(c.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>

          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ width: "300px", height: "80px" }}
          />

          <br />

          <button onClick={handleAddComment}>Add Comment</button>
          <button onClick={() => setSelectedTicket(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
