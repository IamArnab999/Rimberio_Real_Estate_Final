
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { NotificationProvider } from "./components/NotificationContext.jsx";
import { UserProvider } from "./components/UserContext.jsx";

createRoot(document.getElementById("root")).render(
  <Router>
    <NotificationProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </NotificationProvider>
  </Router>
);
