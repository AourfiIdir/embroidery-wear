import express from "express";
import sqlite3 from "sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import { Roleauth, Userauth } from "./auths.js";
import { ROLE } from "./Roles.js";
dotenv.config();
const jwt_key = process.env.JWT_KEY;
const codeAdmin = process.env.AdminCode;
const app = express();
app.use(cors()); // Add this before your routes

app.use(express.json());

app.set("view engine", "ejs");

const db = new sqlite3.Database("BACKEND/DataBase/projectDB.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the project database.");
});
//DATA BASE CREATION



// Create tables and insert initial data
db.serialize(() => {
  db.run(

    `CREATE TABLE IF NOT EXISTS Customer (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'customer',
        shipping_address TEXT,
        shipping_city TEXT,
        shipping_state TEXT,
        shipping_zip_code INTEGER
    )`,
    (err) => {
      if (err) {
        console.error("PROBLEM IN CREATING THE CUSTOMER TABLE:", err.message);
      } else {
        console.log("Customer table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS \`Order\` (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_price DECIMAL(10,2) NOT NULL,
        Customer_customer INTEGER NOT NULL,
        payment_method TEXT DEFAULT 'Livraison',
        payment_status TEXT DEFAULT 'En attente',
        payment_date DATETIME, 
        FOREIGN KEY (Customer_customer) REFERENCES Customer(customer_id)
    )`,
    (err) => {
      if (err) {
        console.error("PROBLEM IN CREATING THE ORDER TABLE:", err.message);
      } else {
        console.log("Order table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Category (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
    )`,
    (err) => {
      if (err) {
        console.error("PROBLEM IN CREATING THE CATEGORY TABLE:", err.message);
      } else {
        console.log("Category table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Order_item (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        size TEXT,
        color TEXT,
        name TEXT,
        Order_order_id INTEGER,
        product_id INTEGER NOT NULL,
        FOREIGN KEY (Order_order_id) REFERENCES \`Order\`(order_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id)
    )`,
    (err) => {
      if (err) {
        console.error("PROBLEM IN CREATING THE ORDER_ITEM TABLE:", err.message);
      } else {
        console.log("Order_item table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Product (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        SKU TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        Category_category INTEGER NOT NULL,
        promo INTEGER DEFAULT 0, 
        img_path TEXT,
        FOREIGN KEY (Category_category) REFERENCES Category(category_id)
    )`,
    (err) => {
      if (err) {
        console.error("PROBLEM IN CREATING THE PRODUCT TABLE:", err.message);
      } else {
        console.log("Product table created");
      }
    }
  );
});

//END POINTS

app.post("/register", async (req, res) => {
  const {
    // User details
    first_name,
    last_name,
    email,
    password,
    AdminCode,
    // Shipping details
    address,
    city,
    state,
    zip_code
  } = req.body;

  // Validate all required fields
  if (!first_name || !last_name || !email || !password || !address || !city || !state || !zip_code) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Role assignment (same as before)
  let role = ROLE.USER;
  if (AdminCode) {
    if (AdminCode != codeAdmin) return res.status(400).json({ error: "Invalid admin code" });
    role = ROLE.ADMIN;
  }

  try {
    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into database (user + shipping in one query)
    db.run(
      `INSERT INTO Customer (
        first_name, last_name, email, password, role,
        shipping_address, shipping_city, shipping_state,shipping_zip_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hash, role, address, city, state, zip_code],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ error: "Email already exists" });
          }
          throw err;
        }


        // Success response
        res.status(201).json({
          message: "User and shipping address saved successfully",
          userId: this.lastID,
        });
      }
    );
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // 1. First find user by email only
  db.get(
    `SELECT * FROM Customer WHERE email = ?`,
    [email],
    (err, user) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (!user) {
        // Don't reveal if user exists or not
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // 2. Compare provided password with stored hash
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!isMatch) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // 3. If match, generate JWT
        const payload = {
          id: user.customer_id,
          role: user.role
        };

        const token = jwt.sign(payload, jwt_key);

        // 4. Return token (omit sensitive data)
        res.status(200).json({
          token,
          userid: user.customer_id,
          role: user.role
        });
      });
    }
  );
});




// Get products by category name
app.get("/category/:name", (req, res) => {
  const categoryName = req.params.name; // Use params for GET requests

  if (!categoryName) {
    return res.status(400).json({ error: "Category name is required" });
  }

  db.all(
    `
        SELECT p.product_id, p.SKU, p.price,p.img_path,p.description,p.stock,p.promo
        FROM Product p
        JOIN Category c ON p.Category_category = c.category_id
        WHERE c.name = ?
    `,
    [categoryName],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const processedPorducts = rows.map((product) => {
        if (product.promo && product.promo != 0) {
          return {
            ...product,
            original_price: product.price,
            promo_price: (
              (product.price * (100 - product.promo)) /
              100
            ).toFixed(2),
            has_promo: true,
          };
        }
        return {
          ...product,
          original_price: product.price,
          has_promo: false,
        };
      });
      // Render the template with the products and category name
      //res.render("category", {
      //  products: processedPorducts,
      //  category: categoryName,
      //});
      res.status(200).json(processedPorducts);
    }
  );
});

// Filter products by price range
app.get("/category/:name/filter", (req, res) => {
  const categoryname = req.params.name; // Category name from route parameter
  const { minprice, maxprice } = req.query; // Min and max price from query parameters

  if (!categoryname) {
    return res.status(400).json({ error: "Category name is required" });
  }

  // Convert minPrice and maxPrice to numbers
  const min = parseFloat(minprice) || 0;
  const max = parseFloat(maxprice) || Number.MAX_VALUE;

  db.all(
    `
        SELECT p.product_id, p.SKU,p.price,p.img_path,p.description,p.stock
        FROM Product p
        JOIN Category c ON p.Category_category = c.category_id
        WHERE c.name = ? AND p.price >= ? AND p.price <= ?
    `,
    [categoryname, min, max],
    (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Render the template with the filtered products
      res.render("category", { products: rows, category: categoryname });
    }
  );
});

//user when he click in a product a "product page will apear where he can buy , order , and vue the product

app.get("/product/:id", (req, res) => {
  const productId = req.params.id; // Use params for GET requests

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  db.get(
    `
        SELECT p.product_id, p.SKU, p.description, p.price, p.stock,p.img_path,p.promo
        FROM Product p
        WHERE p.product_id = ?
    `,
    [productId],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Render the template with the product details
      //res.render("product", { product: row });
      res.status(200).json({ product: row });
    }
  );
});

app.post("/addToCart", Userauth, async (req, res) => {
  const { product_id, quantity, color, size, uniPrice } = req.body;
  const clientId = req.user.id;
  // Validation des données
  if (!product_id || !quantity || !color || !size || !uniPrice) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
      required_fields: ["product_id", "quantity", "color", "size", "uniPrice"]
    });
  }

  try {
    // Convertir les types
    const quantityInt = parseInt(quantity);
    const uniPriceFloat = parseFloat(uniPrice);

    if (isNaN(quantityInt)) throw new Error("Invalid quantity");
    if (isNaN(uniPriceFloat)) throw new Error("Invalid price");

    // Vérifier le stock
    const product = await new Promise((resolve, reject) => {
      db.get(
        `SELECT stock, SKU FROM Product WHERE product_id = ?`,
        [product_id],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    if (product.stock < quantityInt) {
      return res.status(400).json({
        success: false,
        error: "Not enough stock",
        available: product.stock,
        requested: quantityInt
      });
    }

    // Ajouter au panier
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Order_item 
               (quantity, price, size, color, name,product_id , Order_order_id) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [quantityInt, uniPriceFloat, size, color, product.SKU, product_id, clientId],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Réponse de succès
    res.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem: {
        product_id,
        name: product.SKU,
        quantity: quantityInt,
        price: uniPriceFloat,
        size,
        color
      }
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
//end point to get the cart items

app.get("/getCartItems", Userauth, (req, res) => {
  const clientId = req.user.id;
  db.all(`SELECT * FROM Order_item WHERE Order_order_id = ?`, [clientId], (err, rows) => {
    if (err) {
      console.error("error in getting the order items");
      return res.status(500).json({ error: "Internal Server Error" });
    }
    //we need to change it to ejs render page
    res.status(200).json({ items: rows });
  });
});


//end point to delete an item from the cart
app.delete("/deleteItem/:id", (req, res) => {
  const itemId = req.params.id;
  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }
  db.run(`DELETE FROM Order_item WHERE order_item_id = ?`, [itemId], (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  });
});

//end point to create an order
//!!!! check the user authentification" in the front end we need to pass the token and check if the user is logged in or not
app.post("/createOrder", Userauth, Roleauth([ROLE.USER]), async (req, res) => {
  const clientId = req.user.id;

  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 1. Get all cart items that aren't associated with any order yet
    const cartItems = await new Promise((resolve, reject) => {
      db.all(
        `SELECT oi.order_item_id, oi.product_id, oi.quantity, oi.price
         FROM Order_item oi   WHERE Order_order_id = ?`, // Link through the Order table
        [clientId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    if (!cartItems || cartItems.length === 0) {
      await new Promise((resolve) => db.run("ROLLBACK", () => resolve()));
      return res.status(400).json({ error: "No items in the cart" });
    }

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Get customer shipping info
    const customer = await new Promise((resolve, reject) => {
      db.get(
        `SELECT shipping_address, shipping_city, shipping_state, shipping_zip_code
         FROM Customer WHERE customer_id = ?`,
        [clientId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!customer?.shipping_address) {
      await new Promise((resolve) => db.run("ROLLBACK", () => resolve()));
      return res.status(400).json({ error: "Shipping address required" });
    }

    // 3. Create the order
    const orderId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO \`Order\` (order_date, total_price, Customer_customer, payment_method, payment_status)
         VALUES (datetime('now'), ?, ?, 'Livraison', 'En attente')`,
        [totalPrice, clientId],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    // 4. Associate cart items with the new order
    const updatePromises = cartItems.map(item => {
      return new Promise((resolve, reject) => {
        db.run(
          `UPDATE Order_item SET Order_order_id = ? WHERE order_item_id = ?`,
          [orderId, item.order_item_id],
          function (err) {
            if (err) return reject(err);
            if (this.changes !== 1) reject(new Error("Failed to update order item"));
            resolve();
          }
        );
      });
    });

    await Promise.all(updatePromises);

    // 5. Update product stock
    for (const item of cartItems) {
      const updated = await new Promise((resolve, reject) => {
        db.run(
          `UPDATE Product SET stock = stock - ? 
           WHERE product_id = ? AND stock >= ?`,
          [item.quantity, item.product_id, item.quantity],
          function (err) {
            if (err) return reject(err);
            resolve(this.changes === 1);
          }
        );
      });

      if (!updated) {
        await new Promise((resolve) => db.run("ROLLBACK", () => resolve()));
        return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
      }
    }

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(201).json({
      message: "Order created successfully",
      orderId,
      total: totalPrice,
      shippingAddress: {
        address: customer.shipping_address,
        city: customer.shipping_city,
        state: customer.shipping_state,
        zip: customer.shipping_zip_code
      }
    });

  } catch (err) {
    await new Promise((resolve) => db.run("ROLLBACK", () => resolve()));
    console.error("Order creation error:", err);
    res.status(500).json({
      error: "Failed to create order",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
// Helper function for async db.all
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// GET all orders for a customer
app.get("/getOrders", Userauth, Roleauth(ROLE.USER), async (req, res) => {
  try {
    const clientId = req.user.id;

    // 1. Get all orders for this customer
    const orders = await dbAll(
      `SELECT * FROM \`Order\` 
       WHERE Customer_customer = ? 
       ORDER BY order_date DESC`,
      [clientId]
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    // 2. Get customer info (once since it's the same for all orders)
    const [customer] = await dbAll(
      `SELECT first_name, last_name, email, shipping_address, shipping_city, shipping_state, shipping_zip_code 
       FROM Customer WHERE customer_id = ?`,
      [clientId]
    );

    // 3. Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await dbAll(
          `SELECT oi.*, p.SKU, p.description, p.img_path
           FROM Order_item oi
           JOIN Product p ON oi.product_id = p.product_id
           WHERE oi.Order_order_id = ?`,
          [order.order_id]
        );
        
        return {
          ...order,
          items: items || []
        };
      })
    );

    // 4. Format response
    res.json({
      orders: ordersWithItems,
      customer: customer || null
    });

  } catch (err) {
    console.error("Error in /getOrders:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});



//end point to get all the product with the promo
app.get("/promo", (req, res) => {
  db.all(`SELECT * FROM Product WHERE promo !=0`, [], (err, rows) => {
    if (err) {
      res.status(401).json({ error: err });
    }
    res.status(200).json({ products: rows });
  })
})

//search endpoint
app.get("/search", (req, res) => {
  let items = req.query.item;
  console.log(items);
  db.all(`SELECT SKU FROM Product WHERE description LIKE ? OR SKU LIKE  ? LIMIT 5`, [`%${items}%`, `%${items}%`], (err, rows) => {
    if (err) {
      res.status(401).json({ error: err });
    }
    res.json(rows);
  })
});
// Full search endpoint
app.get('/search/full', (req, res) => {
  const term = req.query.term;

  db.all(
    `SELECT * FROM Product WHERE SKU LIKE ? OR description LIKE ?`,
    [`%${term}%`, `%${term}%`],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});





app.get("/isAdmin", Userauth, (req, res) => {
  const clientId = req.user.id; // Changed from 'user.id' to 'req.user.id'
  
  db.get(`SELECT role FROM Customer WHERE customer_id = ?`, [clientId], (err, row) => { // Changed from db.all to db.get since we expect a single row
    if (err) {
      return res.status(500).json({ error: err.message }); // Added return to prevent double responses
    }
    
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (row.role === ROLE.ADMIN) {
      res.status(200).json({ isAdmin: true });
    } else {
      res.status(200).json({ isAdmin: false });
    }
  });
});

// Admin endpoint - permission required
app.post('/addProduct', Userauth, Roleauth(ROLE.ADMIN), (req, res) => {
  const { productName, description, price, quantity, promo, image_path, categoryName } = req.body;

  // Validate all required fields
  if (!productName || !description || !price || !quantity || !promo || !image_path || !categoryName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Start transaction
  db.serialize(() => {
    db.get(`SELECT category_id FROM Category WHERE name = ?`, [categoryName], (err, category) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err.message });
      }

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      db.run(
        `INSERT INTO Product (SKU, description, price, stock, promo, img_path, Category_category) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [productName, description, price, quantity, promo, image_path, category.category_id],
        function(err) {
          if (err) {
            return res.status(500).json({ error: "Failed to add product", details: err.message });
          }

          res.status(201).json({
            success: true,
            message: "Product added successfully",
            productId: this.lastID
          });
        }
      );
    });
  });
});

app.delete('/deleteProduct', Userauth, Roleauth(ROLE.ADMIN), (req, res) => {
  const { productName } = req.body;
  
  if (!productName) {
    return res.status(400).json({ error: "Please enter a valid product name" }); // Added return
  }
  
  db.get(`SELECT 1 FROM Product WHERE SKU = ?`, [productName], (err, product) => { // Changed from db.all to db.get
    if (err) {
      return res.status(500).json({ error: err.message }); // Changed status to 500 and added return
    }
    
    if (!product) {
      return res.status(404).json({ error: "The product was not found" }); // Added return
    }
    
    db.run(`DELETE FROM Product WHERE SKU = ?`, [productName], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message }); // Added return
      }
      res.status(200).json({ success: true, message: "Product deleted successfully" });
    });
  });
});

// Server listening
app.listen(5000, () => {
  console.log("Server is running on port 5000"); // Fixed port number (was 3000 in message)
});

// Close the database connection when the server shuts down
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Database connection closed");
    }
    process.exit(0);
  });
});