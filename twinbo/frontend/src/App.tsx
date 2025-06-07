import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./store";
import "./App.css";

function App() {
  // Initialize dark mode on app start
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode");
    const isDark = darkMode !== null ? JSON.parse(darkMode) : true;

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  return (
    <Provider store={store}>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              style: {
                background: "#10b981",
              },
            },
            error: {
              duration: 4000,
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
        <Outlet />
      </div>
    </Provider>
  );
}

export default App;
