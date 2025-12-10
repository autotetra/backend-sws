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
type TicketWithComments = Ticket & {
  comments?: Comment[];
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

  const [commentText, setCommentText] = useState("");

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // 1. Create socket connection
  useEffect(() => {
    const s = io("http://localhost:5050", {
      withCredentials: true,
    } as any);

    setSocket(s);

    return () => {
      // important: return void, not Socket
      s.disconnect();
    };
  }, []);

  // 2. Fetch assigned tickets
  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  // 3. Subscribe to socket updates
  useEffect(() => {
    fetchTickets();
    if (!socket) return;

    socket.on("ticketUpdated", fetchTickets);
    socket.on("ticketCreated", fetchTickets);

    return () => {
      socket.off("ticketUpdated", fetchTickets);
      socket.off("ticketCreated", fetchTickets);
    };
  }, [socket]);

  // 4. When user clicks a ticket, sync the editable fields
  const handleSelectTicket = async (t: Ticket) => {
    try {
      const res = await api.get(`/tickets/${t._id}`);
      const fullTicket = res.data as Ticket & { comments?: any[] };

      setSelectedTicket(fullTicket);
      setComments(fullTicket.comments || []);

      setEditPriority(fullTicket.priority);
      setEditStatus(fullTicket.status);
    } catch (err) {
      console.error("Failed to load ticket details:", err);
      alert("Failed to load ticket details");
    }
  };

  // 5. Save changes
  const handleUpdate = async () => {
    if (!selectedTicket) return;

    try {
      const res = await api.patch(`/tickets/${selectedTicket._id}`, {
        priority: editPriority,
        status: editStatus,
      });

      // 1. Update tickets array
      setTickets((prev: Ticket[]) =>
        prev.map((t: Ticket) =>
          t._id === (res.data as Ticket)._id ? (res.data as Ticket) : t
        )
      );

      // 2. Update selected ticket
      setSelectedTicket(null);
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Failed to update ticket");
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    try {
      const res = await api.post(`/tickets/${selectedTicket._id}/comments`, {
        body: newComment,
      });

      const updated = res.data as TicketWithComments;

      setComments(updated.comments || []);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    }
  };

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
              onChange={(e) =>
                setEditPriority(e.target.value as "Low" | "Medium" | "High")
              }
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
              onChange={(e) =>
                setEditStatus(
                  e.target.value as "Open" | "In Progress" | "Closed"
                )
              }
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

          <button onClick={handleUpdate} style={{ marginRight: "10px" }}>
            Save Changes
          </button>
          {/* COMMENTS */}
          <h3>Comments</h3>

          <ul>
            {comments.map((c, i) => (
              <li key={i} style={{ marginBottom: "10px" }}>
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
