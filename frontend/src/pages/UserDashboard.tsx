export default function UserDashboard({ name }: { name: string }) {
  return (
    <div>
      <h2>User Dashboard</h2>
      <p>Welcome, {name}!</p>

      <ul>
        <li>Create Ticket</li>
        <li>My Tickets</li>
      </ul>
    </div>
  );
}
