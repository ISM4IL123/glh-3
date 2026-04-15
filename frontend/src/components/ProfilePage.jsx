import React, { useState, useEffect } from "react";

export default function ProfilePage({ onNavigate }) {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Current user:", user);

    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [loadingPoints, setLoadingPoints] = useState(true);
    const [showProducerForm, setShowProducerForm] = useState(false);
    const [businessName, setBusinessName] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch loyalty points on mount
    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token || !user?.id) {
                    setLoadingPoints(false);
                    return;
                }

                const response = await fetch("http://localhost:5000/api/producers/points", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLoyaltyPoints(data.loyaltyPoints || 0);
                }
            } catch (err) {
                console.error("Error fetching points:", err);
            } finally {
                setLoadingPoints(false);
            }
        };

        fetchPoints();
    }, [user?.id]);

    // If not logged in, show auth prompt (after hooks to keep order stable)
    if (!user) {
        return (
            <div style={{ 
                color: "#fff", 
                padding: "60px", 
                maxWidth: "500px", 
                margin: "0 auto",
                textAlign: "center"
            }}>
                <h2 style={{ marginBottom: "30px" }}>Account</h2>
                <p style={{ 
                    fontSize: "1.1rem", 
                    lineHeight: "1.6",
                    marginBottom: "40px",
                    background: "rgba(255,255,255,0.1)",
                    padding: "20px",
                    borderRadius: "10px"
                }}>
                    Sign up or log in to view your profile and order history. 
                    Note: Account is not required to checkout!
                </p>
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        style={{
                            padding: "15px 30px",
                            background: "#00b894",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            boxShadow: "0 4px 15px rgba(0,184,148,0.4)",
                            transition: "all 0.3s"
                        }}
                        onClick={() => {
                            localStorage.setItem("previousPage", "profile");
                            if (onNavigate) onNavigate("login");
                        }}
                        onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                        onMouseOut={(e) => e.target.style.transform = "none"}
                    >
                        Log In
                    </button>
                    <button
                        style={{
                            padding: "15px 30px",
                            background: "#6c5ce7",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            boxShadow: "0 4px 15px rgba(108,92,231,0.4)",
                            transition: "all 0.3s"
                        }}
                        onClick={() => {
                            localStorage.setItem("previousPage", "profile");
                            if (onNavigate) onNavigate("signup");
                        }}
                        onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                        onMouseOut={(e) => e.target.style.transform = "none"}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        );
    }

    const handleProducerSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsSubmitting(true);

        try {
            const response = await fetch("http://localhost:5000/api/producers/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    userId: user?.id,
                    businessName,
                    businessType,
                    description
                }),
            });

            const data = await response.json();
            console.log("Producer application response:", data);

            if (response.ok && data.success) {
                setIsError(false);
                setMessage("Application submitted successfully! We'll review it soon.");
                setBusinessName("");
                setBusinessType("");
                setDescription("");
                setTimeout(() => setShowProducerForm(false), 1500);
            } else {
                setIsError(true);
                setMessage(data.message || "Error submitting application");
            }
        } catch (err) {
            console.error("Producer application error:", err);
            setIsError(true);
            setMessage("Server error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ color: "#fff", padding: "60px" }}>
            <h2>Profile</h2>
            <p>Name: {user?.name || 'N/A'}</p>
            <p>Email: {user?.email || 'N/A'}</p>
            <p>Loyalty Points: {loadingPoints ? "Loading..." : loyaltyPoints}</p>

            <button
                style={{
                    marginTop: "30px",
                    padding: "10px 20px",
                    background: "#00b894",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    marginBottom: "20px"
                }}
                onClick={() => {
                    if (onNavigate) onNavigate("orderhistory");
                }}
            >
                View Order History
            </button>

            {user?.status !== "producer" && (
                <>
                    <button
                        style={{
                            marginTop: "30px",
                            padding: "10px 20px",
                            background: "#6c5ce7",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "1rem"
                        }}
                        onClick={() => setShowProducerForm(!showProducerForm)}
                    >
                        {showProducerForm ? "Cancel" : "Apply to be a Producer"}
                    </button>

                    {showProducerForm && (
                        <form
                            onSubmit={handleProducerSubmit}
                            style={{
                                marginTop: "30px",
                                padding: "20px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "10px",
                                maxWidth: "500px"
                            }}
                        >
                            <h3>Producer Application</h3>

                            {message && (
                                <div id="producer-message" role="alert" aria-live="polite" style={{
                                    padding: "10px",
                                    marginBottom: "15px",
                                    borderRadius: "5px",
                                    background: isError ? "#ffebee" : "#e8f5e9",
                                    color: isError ? "#c62828" : "#2e7d32"
                                }}>
                                    {message}
                                </div>
                            )}

                            <div style={{ marginBottom: "15px" }}>
                                <label htmlFor="business-name" style={{ display: "block", marginBottom: "5px" }}>
                                    Business Name
                                </label>
                                <input
                                    id="business-name"
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Your business name"
                                    required
                                    aria-required="true"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        background: "rgba(255,255,255,0.2)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        borderRadius: "5px",
                                        color: "#fff",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label htmlFor="business-type" style={{ display: "block", marginBottom: "5px" }}>
                                    Type of Products
                                </label>
                                <input
                                    id="business-type"
                                    type="text"
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value)}
                                    placeholder="e.g. Organic Vegetables, Dairy Products"
                                    required
                                    aria-required="true"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        background: "rgba(255,255,255,0.2)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        borderRadius: "5px",
                                        color: "#fff",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label htmlFor="business-description" style={{ display: "block", marginBottom: "5px" }}>
                                    Business Description
                                </label>
                                <textarea
                                    id="business-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell us about your business..."
                                    required
                                    rows="4"
                                    aria-required="true"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        background: "rgba(255,255,255,0.2)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        borderRadius: "5px",
                                        color: "#fff",
                                        boxSizing: "border-box",
                                        fontFamily: "inherit"
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: isSubmitting ? "#999" : "#00b894",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: isSubmitting ? "not-allowed" : "pointer",
                                    fontSize: "1rem"
                                }}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}
