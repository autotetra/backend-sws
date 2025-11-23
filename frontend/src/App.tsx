import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import InternalDashboard from "./pages/InternalDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setRole] = useState("");
  const [userName, setName] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (userRole: string, userName: string) => {
    setLoggedIn(true);
    setRole(userRole);
    setName(userName);

    console.log("Logged in as:", userRole, userName);
  };

  return (
    <div>
      {loggedIn ? (
        <>
          {userRole === "user" && <UserDashboard name={userName} />}
          {userRole === "internal" && <InternalDashboard name={userName} />}
          {userRole === "admin" && <AdminDashboard name={userName} />}

          <button onClick={() => setLoggedIn(false)}>Logout</button>
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
