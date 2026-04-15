import React, { useEffect, useState } from "react";
import { getImagePath } from '../utils/imageUtils.js';



export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = products;

    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [category, search, products]);

  if (loading) return <p style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>Loading...</p>;

  return (
    <div style={{ display: "flex", width: "100%" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "220px",
        padding: "20px",
        color: "#fff"
      }}>
        <h3>Filters</h3>

        {["All", "Fruit", "Vegetables", "Dairy", "Meat", "Fish", "Local Produce"].map(cat => (
          <p
            key={cat}
            style={{
              cursor: "pointer",
              color: category === cat ? "#00b4d8" : "#fff"
            }}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </p>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1 }}>

        <h2 style={{ textAlign: "center", color: "#00b4d8" }}>
          Available Products
        </h2>

        {/* SEARCH */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "250px",
              borderRadius: "5px",
              border: "none"
            }}
          />
        </div>

        {/* PRODUCTS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          width: "90%",
          margin: "0 auto"
        }}>
          {filtered.map(product => (
            <div key={product.id} style={{
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              color: "#fff"
            }}>
<h3>{product.name}</h3>
<img 
src={getImagePath(product.name, product?.image)} 
                alt={product.name}
                style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px'}}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />

              <p>{product.category}</p>
              <p>Producer: {product.producer}</p>
              <p>£{product.price.toFixed(2)}</p>
              <p>Stock: {product.stock}</p>

              <button
  onClick={() => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    localStorage.setItem("previousPage", "home");   // ✅ force return
    localStorage.setItem("currentPage", "details");
    window.location.reload();
  }}
                style={{
                  background: "#00b4d8",
                  border: "none",
                  padding: "10px",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}