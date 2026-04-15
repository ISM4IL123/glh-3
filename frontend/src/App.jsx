import React, { useEffect, useState } from "react";
import './App.css';
import TopBar from "./components/TopBar";
import LoginPage from "./Login/LoginPage";
import SignupPage from "./Sign up/SignupPage";
import HomePage from "./components/HomePage";
import CartPage from "./components/CartPage";
import ProfilePage from "./components/ProfilePage";
import DetailsPage from "./components/DetailsPage";
import CheckoutPage from "./components/CheckoutPage";
import ProducerDashboard from "./components/ProducerDashboard";
import AdminApplications from "./components/AdminApplications";
import OrderHistory from "./components/OrderHistory";
import AccessibilitySettings from "./components/AccessibilitySettings";

export default function App() {
  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem("currentPage") || "login"
  );
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userStatus, setUserStatus] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.status || null;
  });

  useEffect(() => {
  const updateAuth = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    setIsLoggedIn(!!token);
    setUserStatus(user?.status || null);
  };

  updateAuth();

  window.addEventListener("login", updateAuth);
  window.addEventListener("logout", updateAuth);

  return () => {
    window.removeEventListener("login", updateAuth);
    window.removeEventListener("logout", updateAuth);
  };
}, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserStatus(user?.status || null);
    };
    
    // Listen to custom login/logout events
    window.addEventListener("login", handleStorageChange);
    window.addEventListener("logout", handleStorageChange);
    
    // Also listen to storage changes from other tabs
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("login", handleStorageChange);
      window.removeEventListener("logout", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const goToLogin = () => setCurrentPage("login");
  const goToSignup = () => setCurrentPage("signup");
  const goToHome = () => setCurrentPage("home");
const handleLogout = () => {
    goToLogin(); // redirect to login
  };
  const goToOrderHistory = () => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("orderhistory");
  };

  // Global accessibility settings - load on mount + listen for changes
  useEffect(() => {
    const getSetting = (key) => !!JSON.parse(localStorage.getItem(key) || 'false');
    
    const applyGlobalAccessibility = () => {
      try {
        const lightMode = getSetting('lightMode');
        const reducedMotion = getSetting('reducedMotion');
        const largeText = getSetting('largeText');
        
        document.body.classList.remove('light-mode', 'reduced-motion', 'large-text');
        document.body.classList.toggle('light-mode', lightMode);
        document.body.classList.toggle('reduced-motion', reducedMotion);
        document.body.classList.toggle('large-text', largeText);
        
        console.log('Global accessibility applied:', { lightMode, reducedMotion, largeText });
      } catch (error) {
        console.warn('Could not load accessibility settings:', error);
      }
    };

    applyGlobalAccessibility();

    // Re-apply when localStorage changes (other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key && ['lightMode', 'reducedMotion', 'largeText'].includes(e.key)) {
        applyGlobalAccessibility();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const goBack = () => {
    setCurrentPage(localStorage.getItem("previousPage") || "home");
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header role="banner">
        <TopBar 
  isLoggedIn={isLoggedIn}
  userStatus={userStatus}
  onLogout={handleLogout}
  goToLogin={goToLogin}
  goToHome={() => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("home");
  }}
  goToCart={() => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("cart");
  }}
  goToProfile={() => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("profile");
  }}
  goToOrderHistory={goToOrderHistory}
  goToAdmin={() => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("admin");
  }}
goToProducer={() => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("producer");
  }}
  goToAccessibility={() => {
    localStorage.setItem("previousPage", currentPage);
    setCurrentPage("accessibility");
  }}
/>
      </header>
      <main id="main-content" role="main" tabIndex="-1"
        style={{
          minHeight: "calc(100vh - 80px)",
          width: "100%",
          paddingTop: "80px",
          background: "linear-gradient(135deg, #19106d, #03011d)",
        }}
      >
      {currentPage === "login" && (
        <LoginPage onLoginSuccess={goToHome} goToSignup={goToSignup} />
      )}
      {currentPage === "signup" && <SignupPage goToLogin={goToLogin} />}  
      {currentPage === "home" && <HomePage />}
      {currentPage === "cart" && <CartPage />}
      {currentPage === "profile" && <ProfilePage onNavigate={setCurrentPage} />}
      {currentPage === "checkout" && (
  <CheckoutPage goBack={goBack} />
)}
      {currentPage === "details" && (
  <DetailsPage
    product={JSON.parse(localStorage.getItem("selectedProduct"))}
    goBack={goBack}
  />
)}
      {currentPage === "producer" && userStatus === "producer" && <ProducerDashboard />}
      {currentPage === "producer" && userStatus !== "producer" && (
        <div style={{ color: "#fff", padding: "60px", textAlign: "center" }}>
          <h2>Forbidden</h2>
          <p>You need a producer account to view this page.</p>
        </div>
      )}
      {currentPage === "admin" && userStatus === "admin" && <AdminApplications />}
      {currentPage === "admin" && userStatus !== "admin" && (
        <div style={{ color: "#fff", padding: "60px", textAlign: "center" }}>
          <h2>Forbidden</h2>
          <p>You need an admin account to view this page.</p>
        </div>
      )}
      {currentPage === "orderhistory" && <OrderHistory />}
      {currentPage === "accessibility" && <AccessibilitySettings />}
      </main>
    </>
  );
}
