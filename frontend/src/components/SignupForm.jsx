import React, { useState } from "react";
import "./form.css";

export default function SignupForm({ onSwitch }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // Password rules
    const passwordValid =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        // Validation
        if (!passwordValid) {
            setIsError(true);
            setMessage("Password must be 8+ chars, include a number and uppercase letter.");
            return;
        }

        if (password !== confirmPassword) {
            setIsError(true);
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email: email.toLowerCase(),
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsError(false);
                setMessage("Account created successfully!");
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                setTimeout(() => onSwitch(), 2000);
            } else {
                setIsError(true);
                setMessage(data.message);
            }
        } catch {
            setIsError(true);
            setMessage("Server error. Try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sign Up</h2>

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
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
            />

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

            {/* Password requirements UI */}
            <div style={{ fontSize: "0.8rem", marginBottom: "10px" }}>
                <p style={{ color: password.length >= 8 ? "lightgreen" : "red" }}>
                    • At least 8 characters
                </p>
                <p style={{ color: /[A-Z]/.test(password) ? "lightgreen" : "red" }}>
                    • One uppercase letter
                </p>
                <p style={{ color: /[0-9]/.test(password) ? "lightgreen" : "red" }}>
                    • One number
                </p>
            </div>

            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
            />

            <button type="submit" className="form-submit">
                Create Account
            </button>
        </form>
    );
}