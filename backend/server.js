import express from "express";
import initializeDbAndServer, { db } from "./config/db.js";
const app = express();
import cors from "cors";
import upload from "./config/multer.js";
import client from "./config/imagekit.js";
import { Parser } from "json2csv";
import { Readable } from "stream";
import csv from "csv-parser";

app.use(cors());
app.use(express.json());

initializeDbAndServer()
  .then(async () => {
    try {
      await db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        price INTEGER NOT NULL,
        stock INTEGER NOT NULL,
        image TEXT
      )`);

      await db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        old_quantity INTEGER,
        new_quantity INTEGER,
        change_date TEXT,
        user_info TEXT,
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

      const port = process.env.PORT || 3000;
      app.listen(port, () => {
        console.log(`Server Running At http://localhost:${port}`);
      });
    } catch (e) {
      console.error("Failed to create products table:", e.message || e);
    }
  })
  .catch((e) => {
    console.error("Failed to initialize DB and server:", e.message || e);
  });

app.get("/", (req, res) => {
  res.send("Server is Running...");
});

app.get("/api/products", async (req, res) => {
  try {
    const query = `SELECT * FROM products`;

    const data = await db.all(query);

    if (!data) {
      return res.status(404).json({ error: "Product not Fetch" });
    }

    res.status(200).json({ productData: data });
  } catch (error) {
    console.error("Failed to update product:", e.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

app.put("/api/product/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, brand, stock, price } = req.body;
  try {
    // Get existing product to record old stock
    const existing = await db.get(`SELECT * FROM products WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const oldStock = existing.stock;

    const query = `UPDATE products SET name = ?, category = ?, brand = ?, stock = ?, price = ? WHERE id = ?`;
    const params = [name, category, brand, Number(stock), Number(price), id];

    const result = await db.run(query, params);

    if (!result || result.changes === 0) {
      return res
        .status(400)
        .json({ error: "Product not updated or no change made" });
    }

    try {
      if (oldStock !== Number(stock)) {
        const changeDate = new Date().toISOString();
        const userInfo = "Admin";
        const insertHistory = `INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, user_info) VALUES (?, ?, ?, ?, ?)`;
        await db.run(insertHistory, [
          id,
          oldStock,
          Number(stock),
          changeDate,
          userInfo,
        ]);
      }
    } catch (histErr) {
      console.error(
        "Failed to record inventory history:",
        histErr.message || histErr
      );
      // don't block the update response if history logging fails
    }

    const updated = await db.get(`SELECT * FROM products WHERE id = ?`, [id]);
    return res.status(200).json({ updated });
  } catch (e) {
    console.error("Failed to update product:", e.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// Get inventory history for a product
app.get("/api/product/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.all(
      `SELECT id, product_id, old_quantity, new_quantity, change_date, user_info FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC`,
      [id]
    );

    return res.status(200).json({ history: rows });
  } catch (err) {
    console.error("Failed to fetch product history:", err.message || err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.delete("/api/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = `DELETE FROM products WHERE id = ?`;

    const result = await db.run(query, [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Deleted successfully", id: id });
  } catch (error) {
    console.error("Failed to update product:", e.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

app.post("/api/product", upload.single("image"), async (req, res) => {
  try {
    const { name, category, brand, stock, price } = req.body;
    if (!name || !category || !price) {
      return res
        .status(400)
        .json({ error: "Name, Category, and Price are required" });
    }

    let imageUrl =
      "https://t3.ftcdn.net/jpg/05/42/85/06/360_F_542850615_1B16r8qsUa5oR8zq4td8wqi911uczewS.jpg";

    if (req.file) {
      const ikResponse = await client.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/products",
      });

      imageUrl = ikResponse.url;
    }

    const query = `INSERT INTO products (name, category, brand, stock, price, image) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      name,
      category,
      brand,
      Number(stock),
      Number(price),
      imageUrl,
    ];

    const result = await db.run(query, params);

    if (!result || !result.lastID) {
      return res.status(500).json({ error: "Failed to add product" });
    }
    const newProduct = await db.get(`SELECT * FROM products WHERE id = ?`, [
      result.lastID,
    ]);

    res.status(201).json({ product: newProduct });
  } catch (e) {
    console.error("Failed to add product:", e.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

app.get("/api/export", async (req, res) => {
  try {
    const products = await db.all("SELECT * from products");

    if (!products || products.length === 0) {
      return res.status(404).send("No data found.");
    }
    const fields = [
      "id",
      "name",
      "category",
      "brand",
      "price",
      "stock",
      "image",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(products);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product-export.csv"
    );

    res.status(200).end(csv);
  } catch (e) {
    console.error("Failed to export data:", e.message || e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

app.post("/api/import", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];

  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on("error", (err) => {
      console.error("Stream Error:", err);
      return res.status(500).json({ error: "Error reading CSV file" });
    })
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      let addedCount = 0;
      let skippedCount = 0;
      let duplicates = [];
      let errors = [];

      try {
        for (const row of results) {
          if (
            !row.name ||
            !row.category ||
            !row.brand ||
            !row.price ||
            !row.stock
          ) {
            errors.push({
              row: row,
              reason:
                "Missing required fields (name, category, brand, price, or stock)",
            });
            continue;
          }
          const productName = row.name.trim();

          let cleanImage = row.image
            ? row.image.replace(/["']/g, "").trim()
            : "";

          if (!cleanImage) {
            cleanImage =
              "https://t3.ftcdn.net/jpg/05/42/85/06/360_F_542850615_1B16r8qsUa5oR8zq4td8wqi911uczewS.jpg";
          }

          const existing = await db.get(
            "SELECT id FROM products WHERE name = ?",
            [productName]
          );

          if (existing) {
            skippedCount++;
            duplicates.push(productName);
          } else {
            const sql = `
                                INSERT INTO products (name, category, brand, price, stock, image) 
                                VALUES (?, ?, ?, ?, ?, ?)
                            `;

            const params = [
              row.name,
              row.category,
              row.brand,
              row.price,
              row.stock,
              cleanImage,
            ];

            await db.run(sql, params);
            addedCount++;
          }
        }

        res.status(200).json({
          message: "Import process finished.",
          added: addedCount,
          skipped: skippedCount,
          duplicates: duplicates,
          errors: errors,
        });
      } catch (error) {
        console.error("Critical Import Error:", error);
        res.status(500).json({ error: "Server error during import." });
      }
    });
});
