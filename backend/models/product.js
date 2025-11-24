import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    description: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        default: "General"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent OverwriteModelError
const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
