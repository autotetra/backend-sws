export default function AdminDashboard({ name }: { name: string }) {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {name}!</p>

      <ul>
        <li>All Tickets</li>
        <li>Manage Users (future)</li>
      </ul>
    </div>
  );
}
