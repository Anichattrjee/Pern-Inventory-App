import { sql } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await sql`
            SELECT * FROM products ORDER BY created_at DESC
        `;

    res.status(200).json({ message: "Products Fetched.", data: products });
  } catch (error) {
    console.log("Error in getAllProducts controller: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await sql`
            SELECT * FROM products WHERE id=${id}
        `;

    if (!product) {
      return res
        .status(404)
        .json({ message: "Couldn't find the product you are looking for." });
    }

    res.status(200).json({ data: product[0] });
  } catch (error) {
    console.log("Error in getProduct controller. ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newProduct = await sql`
            INSERT INTO  products (name,image,price)
            VALUES (${name}, ${image}, ${price}) RETURNING *
        `;

    res
      .status(200)
      .json({ message: "Product Created Successfully.", product: newProduct });
  } catch (error) {
    console.log("Error in createProduct controller. ", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, image } = req.body;
    
    try {
      // Get the current product
      const currentProduct = await sql`SELECT * FROM products WHERE id = ${id}`;
      if (currentProduct.length === 0) {
        return res.status(404).json({ message: "Product not found." });
      }
      
      //optional fields
      const updatedProduct = await sql`
        UPDATE products
        SET 
          name = ${name ?? currentProduct[0].name},
          price = ${price ?? currentProduct[0].price},
          image = ${image ?? currentProduct[0].image}
        WHERE id = ${id}
        RETURNING *;
      `;
    
      res.status(200).json({ message: "Product updated Successfully.", data: updatedProduct });
    } catch (error) {
      console.error("Error in updateProduct controller:", error.message);
      res.status(500).json({ message: error.message });
    }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await sql`
            DELETE FROM products WHERE id=${id} RETURNING *
        `;

    return res
      .status(200)
      .json({
        message: "product deleted successfully.",
        data: deleteProduct[0],
      });
  } catch (error) {
    console.log("Error in deleteProduct controller. ", error.message);
    return res.status(500).json({ message: error.message });
  }
};
