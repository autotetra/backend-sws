import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

type UserRole = "User" | "Agent" | "Admin" | "";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("");
  const [userName, setUserName] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (role: Exclude<UserRole, "">, name: string) => {
    setLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole("");
    setUserName("");
    setShowRegister(false);
  };

  return (
    <div>
      {loggedIn ? (
        <>
          {userRole === "User" && <UserDashboard name={userName} />}
          {userRole === "Agent" && <AgentDashboard name={userName} />}
          {userRole === "Admin" && <AdminDashboard name={userName} />}

          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : showRegister ? (
        <Register onBackToLogin={() => setShowRegister(false)} />
      ) : (
        <>
          <Login onLogin={handleLogin} />
          <button onClick={() => setShowRegister(true)}>New User</button>
        </>
      )}
    </div>
  );
}

export default App;
