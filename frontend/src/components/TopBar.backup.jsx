import React from "react";
import "./form.css";

export default function TopBar({
  isLoggedIn,
  userStatus,
  onLogout,
  goToLogin,
  goToHome,
  goToCart,
  goToProfile,
  goToProducer,
  goToAdmin
}) {
  const showAdminButton = isLoggedIn && userStatus === "admin";
  const showProducerButton = isLoggedIn && userStatus === "producer";

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("logout"));
    if (onLogout) onLogout();
  };

  const handleKeyDown = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <nav role="navigation" aria-label="Main navigation"
      style={{
        width: "100%",
        padding: "15px 30px",
        background: "rgba(0,0,0,0.45)",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        backdropFilter: "blur(6px)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
        zIndex: 10,
      }}
    >
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <button
          onClick={goToHome}
          onKeyDown={(e) => handleKeyDown(e, goToHome, 'Go to home page')}
          aria-label="Go to home page"
          style={{ fontSize: "1.5rem", fontWeight: "700", cursor: "pointer", background: "none", border: "none", color: "#fff" }}
        >
          LOGO
        </button>

        {showAdminButton && (
          <button
            onClick={goToAdmin}
            onKeyDown={(e) => handleKeyDown(e, goToAdmin, 'Go to admin dashboard')}
            aria-label="Go to admin dashboard"
            style={{
              cursor: "pointer",
              color: "#e74c3c",
              fontWeight: "bold",
              background: "none",
              border: "none",
              fontSize: "inherit"
            }}
          >
            Admin
          </button>
        )}
        {showProducerButton && (
          <button
            onClick={goToProducer}
            onKeyDown={(e) => handleKeyDown(e, goToProducer, 'Go to producer dashboard')}
            aria-label="Go to producer dashboard"
            style={{
              cursor: "pointer",
              color: "#00b894",
              fontWeight: "bold",
              background: "none",
              border: "none",
              fontSize: "inherit"
            }}
          >
            Producer
          </button>
        )}
      </div>

      {/* RIGHT */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          fontSize: "1.1rem",
          marginRight: "20px",
        }}
      >
        <button
          onClick={() => {
            const settingsPanel = document.getElementById('accessibility-panel');
            if (settingsPanel) {
              settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
            }
          }}
          aria-expanded={false}
          aria-controls="accessibility-panel"
          aria-label="Toggle accessibility settings"
          style={{ 
            cursor: "pointer", 
            background: "none", 
            border: "none", 
            color: "#fff", 
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "8px 12px",
            borderRadius: "4px"
          }}
          title="Accessibility Settings"
        >
          Accessibility
        </button>
        <button
          onClick={goToHome}
          onKeyDown={(e) => handleKeyDown(e, goToHome, 'Go to home page')}
          aria-label="Go to home page"
          style={{ cursor: "pointer", background: "none", border: "none", color: "#fff", fontSize: "inherit" }}
        >
          Home
        </button>

        <button
          onClick={goToCart}
          onKeyDown={(e) => handleKeyDown(e, goToCart, 'Go to cart')}
          aria-label="Go to cart"
          style={{ cursor: "pointer", background: "none", border: "none", color: "#fff", fontSize: "inherit" }}
        >
          Cart
        </button>

        <button
          onClick={goToProfile}
          onKeyDown={(e) => handleKeyDown(e, goToProfile, 'Go to account')}
          aria-label="Go to account"
          style={{ cursor: "pointer", background: "none", border: "none", color: "#fff", fontSize: "inherit" }}
        >
          Account
        </button>

{isLoggedIn && (
          <button
            onClick={() => {
              localStorage.setItem("previousPage", localStorage.getItem("currentPage") || "home");
              localStorage.setItem("currentPage", "orderhistory");
              window.location.reload();
            }}
            onKeyDown={(e) => handleKeyDown(e, () => {
              localStorage.setItem("previousPage", localStorage.getItem("currentPage") || "home");
              localStorage.setItem("currentPage", "orderhistory");
              window.location.reload();
            }, 'Go to order history')}
            aria-label="Go to order history"
            style={{ cursor: "pointer", background: "none", border: "none", color: "#fff", fontSize: "inherit" }}
          >
            Order History
          </button>
        )}

        <button
          className="form-submit"
          style={{ width: "auto", padding: "8px 15px" }}
          onClick={isLoggedIn ? handleLogout : goToLogin}
          aria-label={isLoggedIn ? "Log out" : "Log in"}
        >
          {isLoggedIn ? "Logout" : "Log In"}
        </button>
      </div>
    </nav>
  );
}