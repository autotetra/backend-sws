import React, { useEffect, useState } from "react";
import api from "../api";
import io from "socket.io-client";

type Ticket = {
  _id: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "closed";
  category: "billing" | "technical" | "general";
  priority: "low" | "medium" | "high";
  createdBy: any;
  assignee: any;
  createdAt: string;
};

interface AgentDashboardProps {
  name: string;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ name }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );
  const [editStatus, setEditStatus] = useState<
    "open" | "in_progress" | "closed"
  >("open");

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
  const handleSelectTicket = (t: Ticket) => {
    setSelectedTicket(t);
    setEditPriority(t.priority);
    setEditStatus(t.status);
  };

  // 5. Save changes
  const handleUpdate = async () => {
    if (!selectedTicket) return;

    try {
      await api.patch(`/tickets/${selectedTicket._id}`, {
        priority: editPriority,
        status: editStatus,
      });

      setSelectedTicket(null);
    } catch (err: any) {
      console.error("Failed to update ticket:", err);
      alert("Failed to update ticket");
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
                setEditPriority(e.target.value as "low" | "medium" | "high")
              }
              style={{ marginLeft: "10px" }}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </p>

          <p>
            <strong>Status:</strong>
            <select
              value={editStatus}
              onChange={(e) =>
                setEditStatus(
                  e.target.value as "open" | "in_progress" | "closed"
                )
              }
              style={{ marginLeft: "10px" }}
            >
              <option value="open">open</option>
              <option value="in_progress">in progress</option>
              <option value="closed">closed</option>
            </select>
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {new Date(selectedTicket.createdAt).toLocaleString()}
          </p>

          <button onClick={handleUpdate} style={{ marginRight: "10px" }}>
            Save Changes
          </button>
          <button onClick={() => setSelectedTicket(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
