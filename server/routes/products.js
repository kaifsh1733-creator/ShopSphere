
import express from "express";

const router = express.Router();

// Demo products — IDs frontend ke saath match hain
let products = [
  {
    id: "demo-1",
    name: "Classic Sneakers",
    price: 1499,
    category: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    description: "Comfortable everyday sneakers",
  },
  {
    id: "demo-2",
    name: "Wireless Headphones",
    price: 1999,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    description: "Wireless headphones for everyday use",
  },
  {
    id: "demo-3",
    name: "Classic Watch",
    price: 2499,
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    description: "A stylish everyday watch",
  },
  {
    id: "demo-4",
    name: "Travel Backpack",
    price: 1299,
    category: "Bags",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    description: "A practical backpack for everyday travel",
  },
];

let nextId = 5;

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  res.json(products);
});

// GET ONE PRODUCT
router.get("/:id", (req, res) => {
  const product = products.find(
    (item) => String(item.id) === String(req.params.id)
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json(product);
});

// ADD PRODUCT
router.post("/", (req, res) => {
  const { name, price, category, image, description } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    price === "" ||
    price === undefined ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: "Enter a valid product name and price",
    });
  }

  const product = {
    id: String(nextId++),
    name: name.trim(),
    price: Number(price),
    category: category || "General",
    image: image || "",
    description: description || "",
  };

  products.push(product);

  res.status(201).json({
    message: "Product added successfully",
    product,
  });
});

// UPDATE PRODUCT
router.put("/:id", (req, res) => {
  const id = String(req.params.id);

  const index = products.findIndex(
    (item) => String(item.id) === id
  );

  if (index === -1) {
    return res.status(404).json({
      message: `Product not found: ${id}`,
    });
  }

  const { name, price, category, image, description } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    price === "" ||
    price === undefined ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      message: "Enter a valid product name and price",
    });
  }

  const updatedProduct = {
    ...products[index],
    name: name.trim(),
    price: Number(price),
    category: category || "General",
    image: image || "",
    description: description || "",
  };

  products[index] = updatedProduct;

  res.json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// DELETE PRODUCT
router.delete("/:id", (req, res) => {
  const id = String(req.params.id);

  const exists = products.some(
    (item) => String(item.id) === id
  );

  if (!exists) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  products = products.filter(
    (item) => String(item.id) !== id
  );

  res.json({
    message: "Product deleted successfully",
  });
});

export default router;
