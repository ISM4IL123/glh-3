import React, {useState} from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthWrapper() {
    const [isLogin, setIsLogin] = useState(true);

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
            {isLogin ? (
                <LoginForm onSwitch={() => setIsLogin(false)} />
            ) : (
                <SignupForm onSwitch={() => setIsLogin(true)} />
            )}
        </div>
    )
}