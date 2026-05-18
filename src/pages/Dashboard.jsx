import { useState } from "react";

import { signOut } from "firebase/auth";

import { auth } from "../firebase/config";

import UploadPanel from "../components/UploadPanel";
import ResultsPanel from "../components/ResultsPanel";
import IntelligencePanel from "../components/IntelligencePanel";
import PastScreenings from "../pages/PastScreenings";

import "../styles/dashboard.css";


const NAV_ITEMS = [

  { id: "screen", icon: "⚡", label: "Screen Resumes" },

  { id: "history", icon: "📋", label: "Past Screenings" },

  { id: "settings", icon: "⚙", label: "Settings" },
];


export default function Dashboard({ user }) {

  const [active, setActive] = useState("screen");

  const [results, setResults] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);


  const logout = () => signOut(auth);


  const initials = (user.displayName || user.email || "U")

    .split(" ")

    .map((w) => w[0])

    .join("")

    .toUpperCase()

    .slice(0, 2);


  return (

    <div
      className={`dash-root ${
        sidebarOpen
          ? "sidebar-open"
          : "sidebar-closed"
      }`}
    >

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND + TOGGLE */}
        <div className="sidebar-top">

          <div className="sidebar-brand">

            <div className="brand-icon-sm">
              SR
            </div>

            <span className="brand-text">
              ScreenerAI
            </span>

          </div>

          <button
            className="sidebar-toggle"

            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          >

            {sidebarOpen ? "←" : "→"}

          </button>

        </div>


        {/* NAVIGATION */}
        <nav className="sidebar-nav">

          {NAV_ITEMS.map((item) => (

            <button
              key={item.id}

              className={`nav-item ${
                active === item.id
                  ? "nav-active"
                  : ""
              }`}

              onClick={() =>
                setActive(item.id)
              }
            >

              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-label">
                {item.label}
              </span>

            </button>
          ))}

        </nav>


        {/* USER SECTION */}
        <div className="sidebar-bottom">

          <div className="user-chip">

            <div className="user-avatar">

              {initials}

            </div>

            <div className="user-info">

              <span className="user-name">

                {user.displayName || "Recruiter"}

              </span>

              <span className="user-email">

                {user.email}

              </span>

              {/* LOGOUT BUTTON */}
              <button
                className="logout-btn"

                onClick={logout}
              >

                ⎋ Logout

              </button>

            </div>

          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}
      <main className="dash-main">

        {/* HEADER */}
        <header className="dash-header">

          <div className="header-left">

            <h1 className="page-title">

              {active === "screen" &&
                "Resume Screening"}

              {active === "history" &&
                "Screening History"}

              {active === "settings" &&
                "Settings"}

            </h1>

            <span className="page-badge">
              AI-Powered
            </span>

          </div>

          <div className="header-right">

            <div className="status-dot" />

            <span className="status-text">

              System Online

            </span>

          </div>

        </header>


        {/* PAGE CONTENT */}
        <div className="dash-content">

          {/* SCREEN PAGE */}
          {active === "screen" && (

            <div className="screen-layout">

              {/* TOP PANELS */}
              <div className="top-section">

                <div className="upload-area">

                  <UploadPanel
                    onResults={setResults}
                  />

                </div>

                <div className="ai-area">

                  <IntelligencePanel
                    results={results}
                  />

                </div>

              </div>

              {/* RESULTS */}
              <div className="results-section">

                <ResultsPanel
                  results={results}
                />

              </div>

            </div>
          )}


          {/* HISTORY PAGE */}
          {active === "history" && (

            <PastScreenings />

          )}


          {/* SETTINGS PAGE */}
          {active === "settings" && (

            <div className="placeholder-panel">

              <div className="placeholder-icon">
                ⚙
              </div>

              <h3>Settings</h3>

              <p>

                Configure your screening
                preferences and API
                connections.

              </p>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}