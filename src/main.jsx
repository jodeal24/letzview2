// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import "./index.css";

const path = window.location.pathname;
const Root = path.startsWith("/admin") ? <Admin /> : <App />;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{Root}</React.StrictMode>
);
