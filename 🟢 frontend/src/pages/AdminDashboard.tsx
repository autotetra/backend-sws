import React, { useEffect, useState } from "react";
import api from "../api";
import CreateUserForm from "./CreateUserForm";
import CreateTicketForm from "./CreateTicketForm";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Admin" | "Agent" | "User";
  departments: string[];
  createdAt: string;
}

interface TicketUserRef {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Ticket {
  _id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdBy?: TicketUserRef;
  assignee?: TicketUserRef | null;
  createdAt: string;
}

interface Props {
  name: string;
}

// You can move these to a separate config file later if you want
const DEPARTMENT_OPTIONS = ["Technical", "Billing", "General"];
const STATUS_OPTIONS = ["Open", "In Progress", "Closed"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const CATEGORY_OPTIONS = ["Technical", "Billing", "General"];

const AdminDashboard: React.FC<Props> = ({ name }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  // ---- editing state: USERS ----
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userEdits, setUserEdits] = useState<Partial<User>>({});

  // ---- editing state: TICKETS ----
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketEdits, setTicketEdits] = useState<
    Partial<Ticket> & { assigneeId?: string | null }
  >({});

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

  // ---- helpers ----
  const agents = users.filter((u) => u.role === "Agent");
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const isLastAdmin = (u: User) => u.role === "Admin" && adminCount === 1;

  // =======================
  // USER ACTIONS
  // =======================

  const handleDeleteUser = async (id: string) => {
    const target = users.find((u) => u._id === id);
    if (!target) return;

    if (isLastAdmin(target)) {
      alert("You cannot delete the last Admin user.");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete user error", err);
      alert("Failed to delete user");
    }
  };

  const startEditUser = (u: User) => {
    setEditingUserId(u._id);
    setUserEdits({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      departments: [...u.departments],
    });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setUserEdits({});
  };

  const handleUserFieldChange = (field: keyof User, value: any) => {
    setUserEdits((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserDepartmentsChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    handleUserFieldChange("departments", selected);
  };

  const saveUser = async () => {
    if (!editingUserId) return;

    const payload: Partial<User> = {
      firstName: userEdits.firstName,
      lastName: userEdits.lastName,
      email: userEdits.email,
      role: userEdits.role,
      // if role is Agent, keep selected departments; else clear them
      departments:
        userEdits.role === "Agent"
          ? (userEdits.departments as string[]) || []
          : [],
    };

    try {
      const res = await api.patch<User>(`/users/${editingUserId}`, payload);
      const updated = res.data;
      setUsers((prev) =>
        prev.map((u) => (u._id === updated._id ? updated : u))
      );
      setEditingUserId(null);
      setUserEdits({});
    } catch (err) {
      console.error("Update user error", err);
      alert("Failed to update user");
    }
  };

  // =======================
  // TICKET ACTIONS
  // =======================

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

  const startEditTicket = (t: Ticket) => {
    setEditingTicketId(t._id);
    setTicketEdits({
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      assigneeId: t.assignee?._id || "",
    });
  };

  const cancelEditTicket = () => {
    setEditingTicketId(null);
    setTicketEdits({});
  };

  const handleTicketFieldChange = (
    field: keyof Ticket,
    value: string | null
  ) => {
    setTicketEdits((prev) => ({ ...prev, [field]: value as any }));
  };

  const saveTicket = async () => {
    if (!editingTicketId) return;

    const payload: any = {
      title: ticketEdits.title,
      status: ticketEdits.status,
      priority: ticketEdits.priority,
      category: ticketEdits.category,
      assignee: ticketEdits.assigneeId || null,
    };

    try {
      const res = await api.patch<Ticket>(
        `/tickets/${editingTicketId}`,
        payload
      );
      const updated = res.data;
      setTickets((prev) =>
        prev.map((t) => (t._id === updated._id ? updated : t))
      );
      setEditingTicketId(null);
      setTicketEdits({});
    } catch (err) {
      console.error("Update ticket error", err);
      alert("Failed to update ticket");
    }
  };

  // =======================
  // RENDER
  // =======================

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
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Departments</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => {
              const isEditing = editingUserId === u._id;
              const isLast = isLastAdmin(u);

              return (
                <tr key={u._id}>
                  {/* FIRST NAME */}
                  <td>
                    {isEditing ? (
                      <input
                        value={userEdits.firstName ?? ""}
                        onChange={(e) =>
                          handleUserFieldChange("firstName", e.target.value)
                        }
                      />
                    ) : (
                      u.firstName
                    )}
                  </td>

                  {/* LAST NAME */}
                  <td>
                    {isEditing ? (
                      <input
                        value={userEdits.lastName ?? ""}
                        onChange={(e) =>
                          handleUserFieldChange("lastName", e.target.value)
                        }
                      />
                    ) : (
                      u.lastName
                    )}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {isEditing ? (
                      <input
                        value={userEdits.email ?? ""}
                        onChange={(e) =>
                          handleUserFieldChange("email", e.target.value)
                        }
                      />
                    ) : (
                      u.email
                    )}
                  </td>

                  {/* ROLE */}
                  <td>
                    {isEditing ? (
                      <select
                        value={userEdits.role ?? u.role}
                        onChange={(e) =>
                          handleUserFieldChange(
                            "role",
                            e.target.value as User["role"]
                          )
                        }
                      >
                        <option value="Admin">Admin</option>
                        <option value="Agent">Agent</option>
                        <option value="User">User</option>
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>

                  {/* DEPARTMENTS (multi-select when Agent) */}
                  <td>
                    {isEditing ? (
                      userEdits.role === "Agent" ? (
                        <select
                          multiple
                          value={(userEdits.departments as string[]) || []}
                          onChange={handleUserDepartmentsChange}
                          style={{ minWidth: "120px" }}
                        >
                          {DEPARTMENT_OPTIONS.map((dep) => (
                            <option key={dep} value={dep}>
                              {dep}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>-</span>
                      )
                    ) : u.departments.length ? (
                      u.departments.join(", ")
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* CREATED AT */}
                  <td>{new Date(u.createdAt).toLocaleString()}</td>

                  {/* ACTIONS */}
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={saveUser} style={{ marginRight: 4 }}>
                          Save
                        </button>
                        <button onClick={cancelEditUser}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditUser(u)}
                          style={{ marginRight: 4 }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={isLast}
                          title={
                            isLast
                              ? "You cannot delete the last Admin."
                              : undefined
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
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
            {tickets.map((t) => {
              const isEditing = editingTicketId === t._id;

              return (
                <tr key={t._id}>
                  {/* TITLE */}
                  <td>
                    {isEditing ? (
                      <input
                        value={ticketEdits.title ?? t.title}
                        onChange={(e) =>
                          handleTicketFieldChange("title", e.target.value)
                        }
                      />
                    ) : (
                      t.title
                    )}
                  </td>

                  {/* STATUS */}
                  <td>
                    {isEditing ? (
                      <select
                        value={ticketEdits.status ?? t.status}
                        onChange={(e) =>
                          handleTicketFieldChange("status", e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      t.status
                    )}
                  </td>

                  {/* PRIORITY */}
                  <td>
                    {isEditing ? (
                      <select
                        value={ticketEdits.priority ?? t.priority}
                        onChange={(e) =>
                          handleTicketFieldChange("priority", e.target.value)
                        }
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      t.priority
                    )}
                  </td>

                  {/* CATEGORY */}
                  <td>
                    {isEditing ? (
                      <select
                        value={ticketEdits.category ?? t.category}
                        onChange={(e) =>
                          handleTicketFieldChange("category", e.target.value)
                        }
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      t.category
                    )}
                  </td>

                  {/* CREATED BY */}
                  <td>
                    {t.createdBy
                      ? `${t.createdBy.firstName} ${t.createdBy.lastName}`
                      : "-"}
                  </td>

                  {/* ASSIGNEE */}
                  <td>
                    {isEditing ? (
                      <select
                        value={ticketEdits.assigneeId ?? t.assignee?._id ?? ""}
                        onChange={(e) =>
                          setTicketEdits((prev) => ({
                            ...prev,
                            assigneeId: e.target.value || "",
                          }))
                        }
                      >
                        <option value="">None</option>
                        {agents.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.firstName} {a.lastName}
                          </option>
                        ))}
                      </select>
                    ) : t.assignee ? (
                      `${t.assignee.firstName} ${t.assignee.lastName}`
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* CREATED AT */}
                  <td>{new Date(t.createdAt).toLocaleString()}</td>

                  {/* ACTIONS */}
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={saveTicket} style={{ marginRight: 4 }}>
                          Save
                        </button>
                        <button onClick={cancelEditTicket}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditTicket(t)}
                          style={{ marginRight: 4 }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteTicket(t._id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
