export default function InternalDashboard({ name }: { name: string }) {
  return (
    <div>
      <h2>Internal Dashboard</h2>
      <p>Welcome, {name}!</p>

      <ul>
        <li>All Tickets</li>
      </ul>
    </div>
  );
}
