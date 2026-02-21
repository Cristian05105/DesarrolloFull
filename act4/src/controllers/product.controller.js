const Product = require("../models/Product");

async function createProduct(req, res) {
  const { name, price, stock, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: "name y price son requeridos" });
  }

  const product = await Product.create({ name, price, stock, description });
  return res.status(201).json(product);
}

async function listProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 });
  return res.json(products);
}

async function getProduct(req, res) {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "producto no encontrado" });
  return res.json(product);
}

async function updateProduct(req, res) {
  const { id } = req.params;

  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updated) return res.status(404).json({ message: "producto no encontrado" });
  return res.json(updated);
}

async function deleteProduct(req, res) {
  const { id } = req.params;
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "producto no encontrado" });

  return res.status(204).send();
}

module.exports = { createProduct, listProducts, getProduct, updateProduct, deleteProduct };
