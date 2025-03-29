import express from "express";
import sqlite3 from "sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const jwt_key = process.env.JWT_KEY;

const app = express();
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
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        shipping_address INTEGER,
        FOREIGN KEY (shipping_address) REFERENCES Shipment(shipment_id)
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
    `CREATE TABLE IF NOT EXISTS Shipment (
        shipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        zip_code TEXT,
        Customer_custom INTEGER,
        FOREIGN KEY (Customer_custom) REFERENCES Customer(customer_id)
    )`,
    (err) => {
      if (err) {
        console.error("PROBLEM IN CREATING THE SHIPMENT TABLE:", err.message);
      } else {
        console.log("Shipment table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Payment (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_date DATETIME,
        payment_method TEXT,
        Customer_customer INTEGER UNIQUE,
        order_id INTEGER unique,
        FOREIGN KEY (order_id) REFERENCES \`Order\`(order_id),
        FOREIGN KEY (Customer_customer) REFERENCES Customer(customer_id)
    )`,
    (err) => {
      if (err) {
        console.log("PROBLEM IN CREATING THE PAYMENT TABLE");
      } else {
        console.log("Payment table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS \`Order\` (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_date DATETIME,
        total_price DECIMAL(10,2),
        Customer_customer INTEGER,
        Payment_payments INTEGER,
        Shipment_shipment INTEGER,
        FOREIGN KEY (Customer_customer) REFERENCES Customer(customer_id),
        FOREIGN KEY (Payment_payments) REFERENCES Payment(payment_id),
        FOREIGN KEY (Shipment_shipment) REFERENCES Shipment(shipment_id)
    )`,
    (err) => {
      if (err) {
        console.log("PROBLEM IN CREATING THE ORDER TABLE");
      } else {
        console.log("Order table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Category (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
    )`,
    (err) => {
      if (err) {
        console.log("PROBLEM IN CREATING THE CATEGORY TABLE");
      } else {
        console.log("Category table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Product (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        SKU TEXT,
        description TEXT,
        price FLOAT,
        stock INTEGER,
        Category_category INTEGER,
        promo INTEGER DEFAULT 0, 
        img_path TEXT,
        FOREIGN KEY (Category_category) REFERENCES Category(category_id)
    )`,
    (err) => {
      if (err) {
        console.log("PROBLEM IN CREATING THE PRODUCT TABLE");
      } else {
        console.log("Product table created");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Order_item (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity INTEGER,
        price DECIMAL(10,2),
        size TEXT,
        color TEXT,
        name TEXT,
        Product_prod INTEGER,
        Order_order_id INTEGER,
        FOREIGN KEY (Product_prod) REFERENCES Product(product_id),
        FOREIGN KEY (Order_order_id) REFERENCES \`Order\`(order_id)
    )`,
    (err) => {
      if (err) {
        console.log("PROBLEM IN CREATING THE ORDER_ITEM TABLE");
      } else {
        console.log("Order_item table created");
      }
    }
  );
});

//END POINTS

//CREATE AN USER end point
app.post("/register", (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  // Input validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Hash the password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Insert user into the database
    db.run(
      `INSERT INTO Customer (first_name, last_name, email,password) 
             VALUES (?, ?, ?, ?)`,
      [first_name, last_name, email, hash],
      function (err) {
        if (err) {
          console.error(
            "Error inserting data into Customer table:",
            err.message
          );

          // Handle unique constraint violation (email already exists)
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({ error: "Email already in use" });
          }

          return res.status(500).json({ error: "Internal server error" });
        }

        // Success response
        console.log("User registered successfully");
        res.status(201).json({ message: "User created successfully" });
      }
    );
  });
});

app.post("/Shipment", (req, res) => {
  const { address, country, city, state, zip_code } = req.body;

  // Input validation
  if (!address || !city || !state || !country || !zip_code) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Insert shipment into the database
  db.run(
    `INSERT INTO Shipment (address, city, state, country, zip_code) 
         VALUES ( ?, ?, ?, ?, ?)`,
    [address, city, state, country, zip_code],
    function (err) {
      if (err) {
        console.error("Error inserting data into Shipment table:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Success response
      console.log("Shipment created successfully");
      res.status(201).json({ message: "Shipment created successfully" });
    }
  );
});

//login end point

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get(
    `SELECT * FROM Customer WHERE email = ? AND password = ?`,
    [email, password],
    (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
      } else if (row) {
        // Generate a JWT token
        const token = jwt.sign({ id: row.customer_id }, jwt_key);
        res.json({ token: token }, { userid: row.customer_id });
      } else {
        res.status(404).send("User not found");
      }
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
      res.render("category", {
        products: processedPorducts,
        category: categoryName,
      });
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
      res.render("product", { product: row });
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
app.post("/createOrder/:clientId", (req, res) => {
  const clientId = req.params.clientId;

  db.serialize(() => {
    // First check if there are items in the cart
    db.get(
      `SELECT EXISTS (SELECT 1 FROM Order_item) AS hasItems`,
      [],
      (err, row) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error in verifying if the cart items has items" });
        }

        if (!row.hasItems) {
          return res.status(400).json({ error: "No items in the cart" });
        }

        // Next get the shipment ID
        db.get(
          `SELECT s.shipment_id FROM Shipment s JOIN Customer c ON ? = s.Customer_custom`,
          [clientId],
          (err, shipment) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Internal Server Error in selecting the shipement id that matchs with the right customer" });
            }

            if (!shipment) {
              return res
                .status(400)
                .json({ error: "No shipment found for customer" });
            }

            const shipmentId = shipment.shipment_id;
            const orderDate = new Date().toISOString();

            // Then calculate the total price
            db.get(
              `SELECT SUM(o.price * o.quantity) AS total_price FROM Order_item o WHERE o.Order_order_id IS NULL`,
              [],
              (err, totalPrice) => {
                if (err) {
                  console.error(err);
                  return res
                    .status(500)
                    .json({ error: "Internal Server Error in calculating the sum of the order" });
                }

                const totalPriceValue = totalPrice.total_price;

                // Create the order
                db.run(
                  `INSERT INTO \`Order\` (order_date, total_price, Customer_customer, Payment_payments, Shipment_shipment)
                           VALUES (?, ?, ?, ?, ?)`,
                  [orderDate, totalPriceValue, clientId, 0, shipmentId],
                  function (err) {
                    if (err) {
                      console.error(err);
                      return res
                        .status(500)
                        .json({ error: "Internal Server Error in inserting to order table" });
                    }

                    const orderId = this.lastID;

                    // Finally update the order items
                    db.run(
                      `UPDATE Order_item SET Order_order_id = ? WHERE Order_order_id IS NULL`,
                      [orderId],
                      (err) => {
                        if (err) {
                          console.error(err);
                          return res
                            .status(500)
                            .json({ error: "Internal Server Error in updating the order items" });
                        }

                        res.status(200).json({
                          message: "Order created successfully",
                          orderId: orderId,
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});
app.get("/getOrder/:orderId", (req, res) => {
    const orderId = req.params.orderId;
    let itemRowsExt = [];
    let shipementRowExt = {};
    let customerRowExt = {};
    let paymentRowExt = {};
    db.serialize(()=>{
        //get the order infos
        db.all(`SELECT * FROM \`Order\` WHERE order_id  =?`, [orderId], (err, orderRows) => {
            if (err) {
                console.error("error in getting the order items");
                return res.status(500).json({ error: "Internal Server Error" });
            }
            //**********identifier
            const shipementId = orderRows[0].Shipment_shipment;
            const customerId = orderRows[0].Customer_customer;
            const paymentId  = orderRows[0].Payment_payments;

            
            
            //get the items infos by the order id 
            db.all(`SELECT o.quantity o.color o.size FROM Order_item o WHERE o.Order_order_id = ?`,[orderId],(err,itemRows)=>{
                if(err){
                    return res.status(500).send({"error":err});
                }
                itemRowsExt = itemRows;
            })
            //get the shipement infos
            db.all(`SELECT s.address s.city s.state s.country s.zip_code FROM shipment s WHERE s.shipment_id = ?`,[shipementId],(err,shipementRows)=>{
                if(err){
                    return res.status(500).send({"error":err});
                }
                shipementRowExt = shipementRows;
            })
            //get the customer infos
            db.all(`SELECT c.first_name c.last_name  FROM Customer c WHERE c.customer_id = ?`,[customerId],(err,customerRows)=>{
                if(err){
                    return res.status(500).send({"error":err});
                }
                customerRowExt = customerRows;
            })

            //get the payment infos


            //finally returning a server rendered page with all those infos 
        }

    )
  })});

app.post("/addPayment", (req, res) => {
  const { payment_date, payment_method, Customer_customer, order_id } =
    req.body;
  if (!payment_date || !payment_method || !Customer_customer || !order_id) {
    return res.status(400).json({ error: "All fields are required" });
  }
  db.run(
    `INSERT INTO Payment (payment_date, payment_method, Customer_customer, order_id) VALUES (?, ?, ?, ?)`,
    [payment_date, payment_method, Customer_customer, order_id],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      // Success response
      console.log("Payment created successfully");
      res.status(201).json({ message: "Payment created successfully" });
    }
  );
});

//server listening
// Start the server
app.listen(3000, () => {
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
