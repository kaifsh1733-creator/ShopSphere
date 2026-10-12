
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.send("ShopSphere backend is running!");
});

app.listen(PORT, () => {
  console.log(`ShopSphere server running on http://localhost:${PORT}`);
});
