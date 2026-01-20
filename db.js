const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./localroots.db');

db.serialize(() => {
    // 1. Reset everything to ensure clean schema
    db.run("DROP TABLE IF EXISTS purchases");
    db.run("DROP TABLE IF EXISTS products");
    db.run("DROP TABLE IF EXISTS producers");

    // 2. Create Producers Table
    db.run(`CREATE TABLE producers (
        producer_id INTEGER PRIMARY KEY,
        name TEXT, address TEXT, revenue_5yrs REAL, top_categories TEXT
    )`);

    // 3. Create Products Table (7 Columns total)
    db.run(`CREATE TABLE products (
        product_id TEXT PRIMARY KEY, product_name TEXT, category TEXT,
        unit_type TEXT, unit_price REAL, image_url TEXT, producer_id INTEGER,
        FOREIGN KEY (producer_id) REFERENCES producers(producer_id)
    )`);

    // 4. Create Purchases Table
    db.run(`CREATE TABLE purchases (
        purchase_id INTEGER PRIMARY KEY AUTOINCREMENT, purchase_date TEXT NOT NULL,
        producer_id INTEGER NOT NULL, product_id TEXT NOT NULL, quantity INTEGER NOT NULL,
        price_at_purchase REAL NOT NULL, delivery_method TEXT NOT NULL,
        FOREIGN KEY (producer_id) REFERENCES producers(producer_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )`);

    // 5. Insert 3 Seed Producers
    db.run(`INSERT INTO producers VALUES (1, 'Bavarian Farm', '123 Academic St, Rosenheim', 125000, 'Vegetables')`);
    db.run(`INSERT INTO producers VALUES (2, 'Alpine Dairy', '456 Milk Ln, Rosenheim', 250000, 'Dairy')`);
    db.run(`INSERT INTO producers VALUES (3, 'Orchard Hills', '789 Apple St, Rosenheim', 180000, 'Fruits')`);

    // 6. Insert 3 Seed Products (Matching Matriculation ID 1077023)
    db.run(`INSERT INTO products VALUES ('product_01_id1077023', 'Organic Tomatoes', 'Vegetables', 'kg', 4.50, 'http://localhost:3000/images/tomatoes.jpg', 1)`);
    db.run(`INSERT INTO products VALUES ('product_02_id1077023', 'Fresh Carrots', 'Vegetables', 'kg', 3.00, 'http://localhost:3000/images/carrots.jpg', 3)`);
    db.run(`INSERT INTO products VALUES ('product_03_id1077023', 'Farm Eggs', 'Dairy', 'pieces', 0.50, 'http://localhost:3000/images/eggs.jpg', 2)`);
});

module.exports = db;