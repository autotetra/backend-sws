import React, { useEffect, useState } from "react";
import api from "../api";
import CreateUserForm from "./CreateUserForm";
import CreateTicketForm from "./CreateTicketForm";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departments: string[];
  createdAt: string;
}

interface Ticket {
  _id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdBy?: { firstName: string; lastName: string };
  assignee?: { firstName: string; lastName: string } | null;
  createdAt: string;
}

interface Props {
  name: string;
}

const AdminDashboard: React.FC<Props> = ({ name }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get<Ticket[]>("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTickets();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete user error", err);
      alert("Failed to delete user");
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm("Delete this ticket?")) return;

    try {
      await api.delete(`/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete ticket error", err);
      alert("Failed to delete ticket");
    }
  };

  return (
    <div>
      <h2>Welcome, Admin {name}</h2>

      {/* USER MANAGEMENT */}
      <h3>User Management</h3>
      <button onClick={() => setShowCreateUser(true)}>Create New User</button>

      {showCreateUser && (
        <div>
          <CreateUserForm
            onClose={() => setShowCreateUser(false)}
            onCreated={fetchUsers}
          />
        </div>
      )}

      {loadingUsers ? (
        <p>Loading users...</p>
      ) : (
        <table border={1} cellPadding={4}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Departments</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  {u.firstName} {u.lastName}
                </td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.departments.join(", ")}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDeleteUser(u._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* TICKET MANAGEMENT */}
      <h3>All Tickets</h3>

      <button onClick={() => setShowCreateTicket(true)}>
        Create New Ticket
      </button>

      {showCreateTicket && (
        <div>
          <CreateTicketForm
            users={users}
            onClose={() => setShowCreateTicket(false)}
            onCreated={fetchTickets}
          />
        </div>
      )}

      {loadingTickets ? (
        <p>Loading tickets...</p>
      ) : (
        <table border={1} cellPadding={4}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Created By</th>
              <th>Assignee</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr key={t._id}>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td>{t.priority}</td>
                <td>{t.category}</td>
                <td>
                  {t.createdBy
                    ? `${t.createdBy.firstName} ${t.createdBy.lastName}`
                    : "-"}
                </td>
                <td>
                  {t.assignee
                    ? `${t.assignee.firstName} ${t.assignee.lastName}`
                    : "-"}
                </td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleDeleteTicket(t._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
