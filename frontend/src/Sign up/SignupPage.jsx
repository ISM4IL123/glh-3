import React from "react";
import SignupForm from "../components/SignupForm";

export default function SignupPage({ goToLogin }) {
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
            <SignupForm onSwitch={goToLogin}
            />
            <p style={{ textAlign: "center"}}>
                Already have an account?{" "}
                <span style={{ cursor: "pointer", color: "#00b4d8"}} onClick={goToLogin}>
                    Login
                </span>
            </p>
        </div>
    );
}