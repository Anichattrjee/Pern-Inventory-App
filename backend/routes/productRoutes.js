import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from "../controllers/productController.js";

const productRouter=express.Router();

productRouter.get("/",getAllProducts);
productRouter.post("/",createProduct);
productRouter.get("/:id",getProduct);
productRouter.put("/:id",updateProduct);
productRouter.delete("/:id",deleteProduct);

export default productRouter;