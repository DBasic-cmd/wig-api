import express from "express";
import Product from "../models/product.js";
import { protect } from "../middleware/auth.js";
import { isAdmin } from "../middleware/admin.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/new", protect, isAdmin, async (req, res) => {
    try {
        const { name, price, image, description, category} = req.body;
        const quantity = req.body.quantity ?? 0; // ensures 0 if undefined

        const product = await Product.create({
            name,
            price,
            image,
            description,
            category,
            quantity,
        });

        res.status(201).json({ message: "Product created", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().populate("category", "name slug");
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name slug");
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE PRODUCT
router.put("/:id", protect, isAdmin, async (req, res) => {
    try {
        const { name, price, image, description, category, quantity } = req.body;
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (name !== undefined) product.name = name;
        if (price !== undefined) product.price = price;
        if (image !== undefined) product.image = image;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (quantity !== undefined) product.quantity = quantity;

        product = await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE PRODUCT
router.delete("/:id", protect, isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully", product });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// DECREMENT QUANTITY (SELL)
router.post("/:id/sell", protect, isAdmin, async (req, res) => {
    try {
        const { amount = 1 } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        if (product.quantity < amount) {
            return res.status(400).json({ message: "Not enough stock" });
        }

        product.quantity -= amount;
        await product.save();

        res.json({ message: "Stock updated", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// **RESTOCK PRODUCT** (INCREMENT QUANTITY)
router.post("/:id/restock", protect, isAdmin, async (req, res) => {
    try {
        const { amount = 1 } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.quantity += amount;
        await product.save();

        res.json({ message: "Stock restocked", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// **FILTER PRODUCTS BY STOCK STATUS**
router.get("/status/:status", async (req, res) => {
    try {
        const { status } = req.params;
        if (!["in stock", "low stock", "out of stock"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const products = await Product.find({ status }).populate("category", "name slug");
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
