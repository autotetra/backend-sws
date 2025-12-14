import { useState } from "react";
import api from "../api";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Props {
  users: User[];
  onClose: () => void;
  onCreated: () => void;
}

type Status = "Open" | "In Progress" | "Closed";
type Priority = "Low" | "Medium" | "High";
type Category = "Billing" | "Technical" | "General";

const CreateTicketForm: React.FC<Props> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("Open");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState<Category>("General");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/tickets", {
        title,
        description,
        category,
        // status & priority intentionally omitted (server defaults)
      });

      onCreated();
      onClose();
    } catch {
      setError("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Create Ticket</h3>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: "200px" }}
        />
        <br />

        <label>Status: </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status)}
          disabled
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
        <br />

        <label>Priority: </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          disabled
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <br />

        <label>Category: </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          <option value="Billing">Billing</option>
          <option value="Technical">Technical</option>
          <option value="General">General</option>
        </select>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>

        <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default CreateTicketForm;
