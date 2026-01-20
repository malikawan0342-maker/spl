const express = require('express');
const cors = require('cors');
const path = require('path'); // Added to fix ReferenceError: path is not defined
const app = express();
const db = require('./db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve images and CSS from current folder

// --- 1. Routing for Frontend ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- 2. Task 5a: Product Catalog Table ---
app.get('/get_all_products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        let tableRows = rows.map(p => `
            <tr>
                <td>${p.product_name}</td>
                <td>${p.product_id}</td>
                <td>$${p.unit_price}</td>
                <td>${p.unit_type}</td>
                <td>${p.category}</td>
            </tr>`).join('');
        res.send(`<html><head><style>table{width:80%; border-collapse:collapse; margin:20px auto; font-family:sans-serif;} th,td{border:1px solid #ddd; padding:10px;} th{background:#2d5a27; color:white;}</style></head>
        <body><h2 style="text-align:center;">Task 5a: Products (ID: 1077023)</h2>
        <table><thead><tr><th>Name</th><th>Product ID</th><th>Price</th><th>Unit</th><th>Category</th></tr></thead><tbody>${tableRows}</tbody></table>
        <p style="text-align:center;"><a href="/">Back to Dashboard</a></p></body></html>`);
    });
});

// --- 3. Task 5b: Purchase History Table (JOIN Logic) ---
app.get('/get_all_purchases', (req, res) => {
    const sql = `SELECT pur.*, prod.name as producer_name, prod.address 
                 FROM purchases pur 
                 JOIN producers prod ON pur.producer_id = prod.producer_id`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        let tableRows = rows.map(pur => `
            <tr>
                <td>${pur.purchase_date}</td>
                <td>${pur.producer_name}</td>
                <td>${pur.address}</td>
                <td>${pur.product_id}</td>
                <td>${pur.delivery_method}</td>
            </tr>`).join('');
        res.send(`<html><head><style>table{width:90%; border-collapse:collapse; margin:20px auto; font-family:sans-serif;} th,td{border:1px solid #ddd; padding:10px;} th{background:#2d5a27; color:white;}</style></head>
        <body><h2 style="text-align:center;">Task 5b: Purchases (JOIN Proof)</h2>
        <table><thead><tr><th>Date</th><th>Producer</th><th>Address</th><th>Product ID</th><th>Method</th></tr></thead><tbody>${tableRows}</tbody></table>
        <p style="text-align:center;"><a href="/">Back to Dashboard</a></p></body></html>`);
    });
});

// --- 4. Producer Registry Table ---
app.get('/get_all_producers', (req, res) => {
    db.all("SELECT * FROM producers", [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        let tableRows = rows.map(p => `
            <tr>
                <td>${p.producer_id}</td>
                <td>${p.name}</td>
                <td>${p.address}</td>
                <td>${p.top_categories}</td>
                <td>$${p.revenue_5yrs}</td>
            </tr>`).join('');
        res.send(`<html><head><style>table{width:80%; border-collapse:collapse; margin:20px auto; font-family:sans-serif;} th,td{border:1px solid #ddd; padding:12px; text-align:left;} th{background-color:#2d5a27; color:white;}</style></head>
        <body><h2 style="text-align:center;">Registered Producers Registry</h2>
        <table><thead><tr><th>ID</th><th>Farm Name</th><th>Address</th><th>Categories</th><th>Revenue</th></tr></thead><tbody>${tableRows}</tbody></table>
        <p style="text-align:center;"><a href="/">Back to Dashboard</a></p></body></html>`);
    });
});

// --- 5. Data Retrieval for Frontend Dashboard ---
app.get('/get_products_json', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add this to server.js so the dashboard history table can load
app.get('/get_purchases_json', (req, res) => {
    const sql = `SELECT pur.*, prod.name as producer_name, prod.address 
                 FROM purchases pur 
                 JOIN producers prod ON pur.producer_id = prod.producer_id`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- 6. Form Submission: Register New Producer ---
app.post('/add_producer', (req, res) => {
    const { name, address, revenue, category } = req.body;
    const sql = `INSERT INTO producers (name, address, revenue_5yrs, top_categories) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, address, revenue, category], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Producer Added", id: this.lastID });
    });
});

// --- 7. Transaction: Place Order ---
app.post('/place_order', (req, res) => {
    const { product_id, price, delivery_method, producer_id } = req.body;
    db.run(`INSERT INTO purchases (purchase_date, producer_id, product_id, quantity, price_at_purchase, delivery_method) 
            VALUES (date('now'), ?, ?, 1, ?, ?)`, 
    [producer_id, product_id, price, delivery_method], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Order placed successfully", id: this.lastID });
    });
});

// --- 8. Start the Server (ONLY ONCE) ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});