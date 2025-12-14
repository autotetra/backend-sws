import { useState } from "react";
import api from "../api";

interface CreateUserFormProps {
  onClose: () => void;
  onCreated: () => void;
}

type Role = "User" | "Agent" | "Admin";

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onClose,
  onCreated,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload =
        role === "Agent"
          ? {
              firstName,
              lastName,
              email,
              password,
              role,
              departments: [department],
            }
          : {
              firstName,
              lastName,
              email,
              password,
              role,
            };

      await api.post("/users", payload);

      onCreated();
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Failed to create user. Maybe email already exists?";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Create User</h3>

      <form onSubmit={handleCreate}>
        <input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <br />

        <label>Role: </label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="User">User</option>
          <option value="Agent">Agent</option>
          <option value="Admin">Admin</option>
        </select>

        <br />
        <br />

        {role === "Agent" && (
          <div>
            <label>Department: </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select department</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="General">General</option>
            </select>
          </div>
        )}

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>

        <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
        <br />
        <br />
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateUserForm;
