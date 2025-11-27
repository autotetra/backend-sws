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
};

interface InternalDashboardProps {
  name: string;
}

const InternalDashboard: React.FC<InternalDashboardProps> = ({ name }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socket = io("http://localhost:5050", {
      transports: ["websocket"],
      withCredentials: true,
    } as any);

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (!socket) return;

    socket.on("ticketUpdated", fetchTickets);
    socket.on("ticketCreated", fetchTickets);

    return () => {
      socket.off("ticketUpdated");
      socket.off("ticketCreated");
    };
  }, [socket]);

  return (
    <div>
      <h1>Internal Dashboard</h1>
      <p>Welcome, {name}!</p>

      <h2>Assigned Tickets</h2>
      <ul>
        {tickets.map((t) => (
          <li key={t._id}>
            <strong>{t.title}</strong> — {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InternalDashboard;
