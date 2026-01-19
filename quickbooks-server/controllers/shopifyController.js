const axios = require("axios");

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-01";

const shopifyClient = axios.create({
    baseURL: `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`,
    headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN,
    },
});

const getProducts = async (req, res) => {
    try {
        const response = await shopifyClient.get("/products.json", {
            params: req.query,
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await shopifyClient.get(`/products/${id}.json`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const response = await shopifyClient.get("/orders.json", {
            params: { ...req.query, status: "any" },
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await shopifyClient.get(`/orders/${id}.json`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching order:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const response = await shopifyClient.get("/customers.json", {
            params: req.query,
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching customers:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getLocations = async (req, res) => {
    try {
        const response = await shopifyClient.get("/locations.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching locations:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getShopInfo = async (req, res) => {
    try {
        const response = await shopifyClient.get("/shop.json");
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching shop info:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

// Counts
const getProductCount = async (req, res) => {
    try {
        const response = await shopifyClient.get("/products/count.json", {
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching product count:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getOrderCount = async (req, res) => {
    try {
        const response = await shopifyClient.get("/orders/count.json", {
            params: { ...req.query, status: "any" }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching order count:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};

const getCustomerCount = async (req, res) => {
    try {
        const response = await shopifyClient.get("/customers/count.json", {
            params: req.query
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching customer count:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
};


module.exports = {
    getProducts,
    getProduct,
    getOrders,
    getOrder,
    getCustomers,
    getLocations,
    getShopInfo,
    getProductCount,
    getOrderCount,
    getCustomerCount,
};
