
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

const demoProducts = [
  { id: 1, name: "Everyday Sneakers", category: "Footwear", price: 2499, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
  { id: 2, name: "Studio Headphones", category: "Electronics", price: 3299, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { id: 3, name: "Daily Backpack", category: "Accessories", price: 1899, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Minimal Watch", category: "Accessories", price: 2799, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" },
  { id: 5, name: "Classic Sunglasses", category: "Fashion", price: 1199, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80" },
  { id: 6, name: "Water Bottle", category: "Lifestyle", price: 799, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80" },
];

function App() {
  const [products, setProducts] = useState(demoProducts);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopsphere_user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("shopsphere_token") || ""
  );

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("Fashion");
  const [editingId, setEditingId] = useState(null);
  const [productMessage, setProductMessage] = useState("");

  useEffect(() => {
    axios.get(`${API}/api/products`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length) {
          setProducts(res.data);
        }
      })
      .catch(() => console.log("Showing demo products"));
  }, []);

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");

    try {
      const endpoint =
        authMode === "admin" ? "admin-login" :
        authMode === "login" ? "login" : "signup";

      const payload = { email, password };
      if (authMode === "signup") payload.name = name;

      const res = await axios.post(`${API}/api/auth/${endpoint}`, payload);

      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem("shopsphere_token", res.data.token);
      localStorage.setItem("shopsphere_user", JSON.stringify(res.data.user));
      setShowAuth(false);
      setName("");
      setEmail("");
      setPassword("");
      setMessage(`Welcome, ${res.data.user.name}!`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not connect to backend.");
    }
  }

  function logout() {
    localStorage.removeItem("shopsphere_token");
    localStorage.removeItem("shopsphere_user");
    setToken("");
    setUser(null);
    setMessage("Logged out successfully.");
  }

  function addToCart(product) {
    setCart((old) => {
      const found = old.find((item) => item.id === product.id);
      if (found) {
        return old.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...old, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, amount) {
    setCart((old) =>
      old.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + amount } : item
      ).filter((item) => item.quantity > 0)
    );
  }

  async function saveProduct(event) {
    event.preventDefault();
    setProductMessage("");

    if (user?.role !== "admin" || !token) {
      setProductMessage("Please login as admin.");
      return;
    }

    const payload = {
      name: productName.trim(),
      price: Number(productPrice),
      category: productCategory,
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingId !== null) {
        const res = await axios.put(`${API}/api/products/${editingId}`, payload, config);
        setProducts((old) => old.map((p) => p.id === editingId ? res.data : p));
        setProductMessage("Product updated.");
      } else {
        const res = await axios.post(`${API}/api/products`, payload, config);
        setProducts((old) => [...old, res.data]);
        setProductMessage("Product added.");
      }

      setProductName("");
      setProductPrice("");
      setEditingId(null);
    } catch (error) {
      setProductMessage(error.response?.data?.message || "Product save failed.");
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductCategory(product.category || "Fashion");
    document.getElementById("admin")?.scrollIntoView({ behavior: "smooth" });
  }

  async function deleteProduct(id) {
    if (user?.role !== "admin" || !token) {
      setProductMessage("Please login as admin.");
      return;
    }

    try {
      await axios.delete(`${API}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((old) => old.filter((p) => p.id !== id));
      setCart((old) => old.filter((p) => p.id !== id));
      setProductMessage("Product deleted.");
    } catch (error) {
      setProductMessage(error.response?.data?.message || "Product delete failed.");
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || p.category === category)
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="shop">
      <div className="announcement">
        <span>SHOPSPHERE — YOUR EVERYDAY STORE</span>
        <span>Free shipping on orders over ₹1,999</span>
      </div>

      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">S</span> Shop<span>Sphere</span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#products">Shop</a>
          <a href="#admin">Admin</a>
          <a href="#cart">Cart ({cartCount})</a>
        </nav>

        <div className="nav-actions">
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {user ? (
            <>
              <span>{user.name} ({user.role})</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="cart-button" onClick={() => {
              setAuthMode("login");
              setShowAuth(true);
              setMessage("");
            }}>
              Login / Signup
            </button>
          )}
        </div>
      </header>

      {message && <p className="empty">{message}</p>}

      {showAuth && (
        <section className="cart-section">
          <button type="button" onClick={() => setShowAuth(false)}>Close ✕</button>
          <h2>
            {authMode === "admin" ? "Admin Login" :
             authMode === "login" ? "Welcome back" : "Create account"}
          </h2>

          <form className="auth-form" onSubmit={handleAuth}>
            {authMode === "signup" && (
              <input required placeholder="Your name" value={name}
                onChange={(e) => setName(e.target.value)} />
            )}
            <input required type="email" placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <input required type="password" minLength={6}
              placeholder="Password (minimum 6 characters)"
              value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="primary-button" type="submit">
              {authMode === "admin" ? "Login as Admin" :
               authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>

          <p>{message}</p>

          <div className="auth-options">
            <button type="button" onClick={() => { setAuthMode("login"); setMessage(""); }}>
              User Login
            </button>
            <button type="button" onClick={() => { setAuthMode("signup"); setMessage(""); }}>
              Sign Up
            </button>
            <button type="button" onClick={() => { setAuthMode("admin"); setMessage(""); }}>
              Admin Login
            </button>
          </div>
        </section>
      )}

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">DISCOVER YOUR EVERYDAY</p>
            <h1>Good things.<br /><em>Better living.</em></h1>
            <p className="hero-description">
              Discover fashion, accessories and everyday essentials.
              Your next favourite thing is waiting here.
            </p>
            <a className="primary-button" href="#products">Explore collection ↗</a>
            <p className="trust-note">★ 4.8/5 · Made for everyday shopping</p>
          </div>
          <div className="hero-photo">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=85" alt="Fashion collection" />
            <div className="photo-caption">THE EVERYDAY COLLECTION</div>
          </div>
        </section>

        <section className="benefits">
          <div><strong>🚚 Free shipping</strong><span>On orders ₹1,999+</span></div>
          <div><strong>🔒 Secure shopping</strong><span>Demo store</span></div>
          <div><strong>↩ Easy returns</strong><span>Simple return process</span></div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE SHOP</p>
              <h2>Find your <em>everyday.</em></h2>
              <p>Useful things. Great design. Everyday prices.</p>
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["All", "Fashion", "Footwear", "Electronics", "Accessories", "Lifestyle"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image || "https://placehold.co/600x400?text=ShopSphere"} alt={product.name} />
                  <button className="add-button" onClick={() => addToCart(product)}>+ Add to cart</button>
                </div>
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <div className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</div>
              </article>
            ))}
          </div>
          {filteredProducts.length === 0 && <p className="empty">No products found.</p>}
        </section>

        <section className="cart-section" id="cart">
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>Your shopping <em>bag.</em></h2>
          {cart.length === 0 ? <p>Your bag is empty.</p> : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span>{item.name}</span>
                  <button onClick={() => changeQuantity(item.id, -1)}>−</button>
                  <strong>{item.quantity}</strong>
                  <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                  <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                  <button onClick={() => setCart((old) => old.filter((p) => p.id !== item.id))}>Remove</button>
                </div>
              ))}
              <h3>Total: ₹{cartTotal.toLocaleString("en-IN")}</h3>
            </>
          )}
        </section>

        <section className="cart-section" id="admin">
          <p className="eyebrow">PRODUCT MANAGEMENT</p>
          <h2>Admin <em>panel.</em></h2>

          {user?.role === "admin" ? (
            <>
              <form className="auth-form" onSubmit={saveProduct}>
                <input required placeholder="Product name" value={productName}
                  onChange={(e) => setProductName(e.target.value)} />
                <input required type="number" min="0" placeholder="Price"
                  value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}>
                  {["Fashion", "Footwear", "Electronics", "Accessories", "Lifestyle"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <button className="primary-button" type="submit">
                  {editingId !== null ? "Update product" : "Add product"}
                </button>
                {editingId !== null && (
                  <button type="button" onClick={() => {
                    setEditingId(null);
                    setProductName("");
                    setProductPrice("");
                  }}>Cancel edit</button>
                )}
              </form>

              {products.map((product) => (
                <div className="cart-item" key={product.id}>
                  <span>{product.name} — ₹{product.price}</span>
                  <button type="button" onClick={() => editProduct(product)}>Edit</button>
                  <button type="button" onClick={() => deleteProduct(product.id)}>Delete</button>
                </div>
              ))}
              {productMessage && <p>{productMessage}</p>}
            </>
          ) : (
            <p>Login with Admin Login to manage products. Customers can browse and shop.</p>
          )}
        </section>
      </main>

      <footer id="footer">
        <strong>ShopSphere</strong>
        <p>Thoughtful finds for everyday life.</p>
        <small>Student MERN e-commerce project · Demo version</small>
      </footer>
    </div>
  );
}

export default App;
