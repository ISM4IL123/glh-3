import React from "react";
import LoginForm from "../components/LoginForm";

export default function LoginPage({onLoginSuccess, goToSignup}) {
    return (
        <div style={{
            maxWidth: "400px",
            margin: "50px auto",
            padding: "2rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            backdropFilter: "blur(6px)"
        }}>
            <LoginForm onLoginSuccess={onLoginSuccess}
            />
            <p style={{ textAlign: "center"}}>
                Don't have an account?{" "}
                <span style={{ cursor: "pointer", color: "#00b4d8"}} onClick={goToSignup}>
                    Sign up
                </span>
            </p>
        </div>
    );
}