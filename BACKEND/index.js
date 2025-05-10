import express from "express";
import sqlite3 from "sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import { Roleauth,Userauth } from "./auths.js";
import {ROLE} from "./Roles.js";
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
        Order_order_id INTEGER NOT NULL,
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
  if (!first_name || !last_name || !email || !password || !address || !city || !state ||!zip_code) {
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
      [first_name, last_name, email, hash, role, address, city, state,zip_code],
      function(err) {
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
    (err,row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Render the template with the product details
      //res.render("product", { product: row });
      res.status(200).json({product:row});
    }
  );
});

//the addToCart end point order_item
app.post("/addToCart", (req, res) => {
  const { product_id, quantity, color, size, uniPrice } = req.body; //use body params for POST requests
  if (!product_id || !quantity || !color || !size || !uniPrice) {
    return res.status(400).json({ error: "All fields are required" });
  }
  //here we gonna add the price per unit after the promo
  const quantityInt = parseInt(quantity);
  const uniPriceInt = parseInt(uniPrice);
  //before we insert we check if we got left in the stock
  let name = '';
  db.all(
    `SELECT stock AND SKU FROM Product WHERE product_id = ?`,
    [product_id],
    (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
      }
      if (row[0].stock < quantityInt) {
        return res.status(400).json({ error: "Not enough stock" });
      }
        name = row[0].SKU;
      db.run(
        `
            INSERT INTO Order_item (quantity, price, size, color,name, Product_prod, Order_order_id)
            VALUES (?, ?, ?, ?,?, ?, ?)
        `,
        [quantityInt, uniPrice, size, color, name, product_id, null],
        (err) => {
          //null because we didnt pass a order yet

          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          // Success response
          console.log("Product added to cart successfully");
          res
            .status(201)
            .json({ message: "Product added to cart successfully" });
        }
      );
    }
  );
});

//end point to get the cart items

app.get("/getCartItems", (req, res) => {
  db.all(`SELECT * FROM Order_item`, [], (err, rows) => {
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
  try {
    const clientId = req.user.id; // Get from auth token

    // Start transaction
    await new Promise((resolve, reject) => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // 1. Verify cart has items and get total price in one query
    const cartItems = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) AS itemCount,
          SUM(oi.price * oi.quantity) AS total_price
         FROM Order_item oi
         WHERE oi.Order_order_id IS NULL`,
        [],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!cartItems || cartItems.itemCount === 0) {
      return res.status(400).json({ error: "No items in the cart" });
    }

    // 2. Get customer shipping info (from Customer table now)
    const customer = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          shipping_address, shipping_city, 
          shipping_state, shipping_zip_code
         FROM Customer 
         WHERE customer_id = ?`,
        [clientId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });

    if (!customer || !customer.shipping_address) {
      return res.status(400).json({ error: "No shipping address found for customer" });
    }

    // 3. Create the order (with shipping info)
    const orderDate = new Date().toISOString();
    const orderId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO \`Order\` (
          order_date, total_price, Customer_customer,
          shipping_address, shipping_city, shipping_state, shipping_zip_code,
          payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderDate, 
          cartItems.total_price, 
          clientId,
          customer.shipping_address,
          customer.shipping_city,
          customer.shipping_state,
          customer.shipping_zip_code
        ],
        function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    // 4. Update order items
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE Order_item 
         SET Order_order_id = ?
         WHERE Order_order_id IS NULL`,
        [orderId],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
      total: cartItems.total_price,
      shippingAddress: {
        address: customer.shipping_address,
        city: customer.shipping_city,
        state: customer.shipping_state,
        zip: customer.shipping_zip_code
      }
    });

  } catch (err) {
    // Rollback on error
    await new Promise((resolve) => {
      db.run("ROLLBACK", () => resolve());
    });
    
    console.error("Order creation error:", err);
    res.status(500).json({ 
      error: "Failed to create order",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});
// Helper function
const dbAll = (query, params) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
});
app.get("/getOrder/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;

    // 1. Get order info
    const orderRows = await dbAll(
      `SELECT * FROM \`Order\` WHERE order_id = ?`, 
      [orderId]
    );

    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderRows[0];
    const { Shipment_shipment, Customer_customer, Payment_payments } = order;

    // 2. Run all parallel queries
    const [items, shipment, customer, payment] = await Promise.all([
      // Items query
      dbAll(
        `SELECT quantity, color, size FROM Order_item WHERE Order_order_id = ?`,
        [orderId]
      ),
      
      // Shipment query
      dbAll(
        `SELECT address, city, state, country, zip_code FROM shipment WHERE shipment_id = ?`,
        [Shipment_shipment]
      ),
      
      // Customer query
      dbAll(
        `SELECT first_name, last_name FROM Customer WHERE customer_id = ?`,
        [Customer_customer]
      ),
      
      // Payment query (optional)
      Payment_payments ? 
        dbAll(`SELECT * FROM Payment WHERE payment_id = ?`, [Payment_payments]) 
        : Promise.resolve([])
    ]);

    // 3. Format response
    res.json({
      order,
      items,
      shipment: shipment[0] || null,
      customer: customer[0] || null,
      payment: payment[0] || null
    });

  } catch (err) {
    console.error("Error in /getOrder:", err);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});



//end point to get all the product with the promo
app.get("/promo",(req,res)=>{
  db.all(`SELECT * FROM Product WHERE promo !=0`,[],(err,rows)=>{
    if(err){
      res.status(401).json({error:err});
    }
    res.status(200).json({products:rows});
  })
})

//search endpoint
app.get("/search",(req,res)=>{
    let items= req.query.item;
    console.log(items);
    db.all(`SELECT SKU FROM Product WHERE description LIKE ? OR SKU LIKE  ? LIMIT 5`,[`%${items}%`,`%${items}%`],(err,rows)=>{
      if(err){
        res.status(401).json({error:err});
      }
      res.json(rows);
    })});
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

app.delete('/deleteProduct',Userauth,Roleauth(ROLE.ADMIN),(req,res)=>{
    const {productName} = req.body;
    if(!productName){
        res.status(400).json({ error: "Please enter a valid product name" });
    }
    db.all(`SELECT 1 FROM Product WHERE SKU = ?`,[productName],(err,product)=>{
        if(err){
            res.status(401).json({"error":err});
        }
        if(product.length ===0){
          res.status(404).json({"error":"the product not found"});
        }
        db.run(`DELETE FROM Product WHERE SKU = ?`,[productName],(err,row)=>{
          if(err){
              res.status(401).json({error:err});
          }
          res.status(200).json({"product is deleted successfully": true});
      })
    })
    
})

app.post('/addCategory',Userauth,Roleauth(ROLE.ADMIN),(req,res)=>{
  const {SKU,description} = req.body;
  if(!SKU,!description){
    res.status(401).json({"enter a category":false});
  }
  db.run(`INSERT INTO Category (name,description) VALUES (?,?)`,[SKU , description],(err,rows)=>{
    if(err){
      res.status(401).json({"cant insert into the category table":false});
    }
    res.status(201).json({"table insered succussfully":true});
  })
})
app.delete('/deleteCategory',Userauth,Roleauth(ROLE.ADMIN),(req,res)=>{
  const categId = req.params.categoryId;
  if(!categId){
      res.status(400).json({ error: "Please enter a valid category id name" });
  }
  db.run(`DELETE FROM Category WHERE category_id = ?`,[categId],(err,row)=>{
      if(err){
          res.status(401).json({error:err});
      }
      res.status(200).json({"product is deleted successfully": true});
  })
})



//server listening
// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 3000");
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
