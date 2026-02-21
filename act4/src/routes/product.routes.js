const express = require("express");
const { requireAuth } = require("../middleware/authJwt");

const {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

const router = express.Router();

// Todo lo que esté debajo requiere token
router.use(requireAuth);

router.get("/", listProducts);
router.post("/", createProduct);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
