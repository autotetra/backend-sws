import React, { useEffect, useState } from "react";
import api from "../api";
import CreateUserForm from "../pages/CreateUserForm";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departments: string[];
  createdAt: string;
}

interface Props {
  name: string;
}

const AdminDashboard: React.FC<Props> = ({ name }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Welcome, Admin {name}</h2>
      <h3>User Management</h3>
      <button onClick={() => setShowCreateForm(true)}>Create New User</button>
      {showCreateForm && (
        <div
          style={{ border: "1px solid black", padding: "10px", width: "300px" }}
        >
          <CreateUserForm
            onClose={() => setShowCreateForm(false)}
            onCreated={fetchUsers}
          />
        </div>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table border={1} cellPadding={8} style={{ marginTop: "15px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Departments</th>
              <th>Created</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
