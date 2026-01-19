const express = require("express");
const router = express.Router();
const shopifyController = require("../controllers/shopifyController");

// Products
router.get("/products", shopifyController.getProducts);
router.get("/products/count", shopifyController.getProductCount);
router.get("/products/:id", shopifyController.getProduct);

// Orders
router.get("/orders", shopifyController.getOrders);
router.get("/orders/count", shopifyController.getOrderCount);
router.get("/orders/:id", shopifyController.getOrder);

// Customers
router.get("/customers", shopifyController.getCustomers);
router.get("/customers/count", shopifyController.getCustomerCount);

// Locations
router.get("/locations", shopifyController.getLocations);

// Shop
router.get("/shop", shopifyController.getShopInfo);

module.exports = router;
