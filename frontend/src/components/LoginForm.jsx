import React, { useState } from "react";
import "./form.css";

export default function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsError(false);
                setMessage("Login successful!");
            
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                // Set status flags based on user status
                if (data.user?.status === "admin") {
                    localStorage.setItem("isAdmin", "true");
                    localStorage.removeItem("isProducer");
                } else if (data.user?.status === "producer") {
                    localStorage.setItem("isProducer", "true");
                    localStorage.removeItem("isAdmin");
                } else {
                    localStorage.removeItem("isAdmin");
                    localStorage.removeItem("isProducer");
                }
                
                // Dispatch custom event to update login state
                window.dispatchEvent(new Event("login"));

                setTimeout(() => onLoginSuccess(), 500);
            } else {
                setIsError(true);
                setMessage(data.message);
            }
        } catch {
            setIsError(true);
            setMessage("Server error.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {message && (
                <div style={{
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    background: isError ? "#ffebee" : "#e8f5e9",
                    color: isError ? "#c62828" : "#2e7d32"
                }}>
                    {message}
                </div>
            )}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
            />

            <button type="submit" className="form-submit">
                Login
            </button>
        </form>
    );
}