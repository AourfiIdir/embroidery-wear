import express from 'express';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();



const jwt_key = process.env.JWT_KEY;

const app = express();
app.use(express.json());

app.set('view engine', 'ejs');

const db = new sqlite3.Database('BACKEND/DataBase/projectDB.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the project database.');
});
//DATA BASE CREATION

// Create tables and insert initial data

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Customer (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        shipping_address INTEGER,
        FOREIGN KEY (shipping_address) REFERENCES Shipment(shipment_id)
    )`, (err) => {
        if (err) {
            console.error('PROBLEM IN CREATING THE CUSTOMER TABLE:', err.message);
        } else {
            console.log('Customer table created');
        }
    });
    
    db.run(`CREATE TABLE IF NOT EXISTS Shipment (
        shipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT,
        city TEXT,
        state TEXT,
        country TEXT,
        zip_code TEXT,
        Customer_custom INTEGER,
        FOREIGN KEY (Customer_custom) REFERENCES Customer(customer_id)
    )`, (err) => {
        if (err) {
            console.error('PROBLEM IN CREATING THE SHIPMENT TABLE:', err.message);
        } else {
            console.log('Shipment table created');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS Payment (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_date DATETIME,
        payment_method TEXT,
        Customer_customer INTEGER UNIQUE,
        order_id INTEGER unique,
        FOREIGN KEY (order_id) REFERENCES \`Order\`(order_id),
        FOREIGN KEY (Customer_customer) REFERENCES Customer(customer_id)
    )`, (err) => {
        if (err) {
            console.log('PROBLEM IN CREATING THE PAYMENT TABLE');
        } else {
            console.log('Payment table created');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS \`Order\` (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_date DATETIME,
        total_price DECIMAL(10,2),
        Customer_customer INTEGER,
        Payment_payments INTEGER,
        Shipment_shipment INTEGER,
        FOREIGN KEY (Customer_customer) REFERENCES Customer(customer_id),
        FOREIGN KEY (Payment_payments) REFERENCES Payment(payment_id),
        FOREIGN KEY (Shipment_shipment) REFERENCES Shipment(shipment_id)
    )`, (err) => {
        if (err) {
            console.log('PROBLEM IN CREATING THE ORDER TABLE');
        } else {
            console.log('Order table created');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS Category (
        category_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
    )`, (err) => {
        if (err) {
            console.log('PROBLEM IN CREATING THE CATEGORY TABLE');
        } else {
            console.log('Category table created');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS Product (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        SKU TEXT,
        description TEXT,
        price FLOAT,
        stock INTEGER,
        Category_category INTEGER,
        promo INTEGER DEFAULT 0, 
        img_path TEXT,
        FOREIGN KEY (Category_category) REFERENCES Category(category_id)
    )`, (err) => {
        if (err) {
            console.log('PROBLEM IN CREATING THE PRODUCT TABLE');
        } else {
            console.log('Product table created');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS Order_item (
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
    )`, (err) => {
        if (err) {
            console.log('PROBLEM IN CREATING THE ORDER_ITEM TABLE');
        } else {
            console.log('Order_item table created');
        }

    });
    
    
});



//END POINTS

//CREATE AN USER end point
app.post('/register', (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    // Input validation
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }


    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Insert user into the database
        db.run(
            `INSERT INTO Customer (first_name, last_name, email,password) 
             VALUES (?, ?, ?, ?)`,
            [first_name, last_name, email, hash],
            function (err) {
                if (err) {
                    console.error('Error inserting data into Customer table:', err.message);

                    // Handle unique constraint violation (email already exists)
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ error: 'Email already in use' });
                    }

                    return res.status(500).json({ error: 'Internal server error' });
                }

                // Success response
                console.log('User registered successfully');
                res.status(201).json({ message: 'User created successfully' });
            }
        );
    });
});

app.post('/Shipment', (req, res) => {
    const { address,country ,city,state,zip_code} = req.body;

    // Input validation
    if (!address || !city || !state || !country || !zip_code) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert shipment into the database
    db.run(
        `INSERT INTO Shipment (address, city, state, country, zip_code) 
         VALUES ( ?, ?, ?, ?, ?)`,
        [address, city, state, country, zip_code],
        function (err) {
            if (err) {
                console.error('Error inserting data into Shipment table:', err.message);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Success response
            console.log('Shipment created successfully');
            res.status(201).json({ message: 'Shipment created successfully' });
        }
    );
});


//login end point

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM Customer WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else if (row) {
            // Generate a JWT token
            const token = jwt.sign({ id: row.customer_id }, jwt_key);
            res.json({ token:token },{userid:row.customer_id});
        } else {
            res.status(404).send('User not found');
        }
    });
}
);


// Get products by category name
app.get('/category/:name', (req, res) => {
    const categoryName = req.params.name; // Use params for GET requests

    if (!categoryName) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    db.all(`
        SELECT p.product_id, p.SKU, p.price,p.img_path,p.description,p.stock,p.promo
        FROM Product p
        JOIN Category c ON p.Category_category = c.category_id
        WHERE c.name = ?
    `, [categoryName], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        const processedPorducts = rows.map((product)=>{
            if(product.promo && product.promo !=0){
                return {
                    ...product,
                    original_price: product.price,
                    promo_price: (product.price * (100 - product.promo) / 100).toFixed(2),
                    has_promo: true
                };
            }
            return {
                ...product,
                original_price: product.price,
                has_promo: false
            };
        })
        // Render the template with the products and category name
        res.render('category', { products: processedPorducts, category: categoryName});
    });
});

// Filter products by price range
app.get('/category/:name/filter', (req, res) => {
    const categoryname = req.params.name; // Category name from route parameter
    const { minprice, maxprice } = req.query; // Min and max price from query parameters

    if (!categoryname) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    // Convert minPrice and maxPrice to numbers
    const min = parseFloat(minprice) || 0;
    const max = parseFloat(maxprice) || Number.MAX_VALUE;

    db.all(`
        SELECT p.product_id, p.SKU,p.price,p.img_path,p.description,p.stock
        FROM Product p
        JOIN Category c ON p.Category_category = c.category_id
        WHERE c.name = ? AND p.price >= ? AND p.price <= ?
    `, [categoryname, min, max], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Render the template with the filtered products
        res.render('category', { products: rows, category: categoryname });
    });
});

//user when he click in a product a "product page will apear where he can buy , order , and vue the product

app.get('/product/:id', (req, res) => {
    const productId = req.params.id; // Use params for GET requests

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    db.get(`
        SELECT p.product_id, p.SKU, p.description, p.price, p.stock,p.img_path,p.promo
        FROM Product p
        WHERE p.product_id = ?
    `, [productId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Render the template with the product details
        res.render('product', { product: row });
    });
});

//the addToCart end point order_item
app.post('/addToCart',(req,res)=>{
    const {product_id,quantity,color,size,uniPrice} = req.body; //use body params for POST requests
    if(!product_id || !quantity || !color || !size || !uniPrice){
        return res.status(400).json({error: 'All fields are required'});
    }
    const quantityInt = parseInt(quantity);
    //before we insert we check if we got left in the stock

    db.all(`SELECT stock AND SKU FROM Product WHERE product_id = ?`,[product_id],(err,row)=>{
        if(err){
            console.error(err.message);
            res.status(500).json({error: 'Internal Server Error'});

        }
        if(row[0].stock < quantityInt){
            return res.status(400).json({error: 'Not enough stock'});
        }
        const name = row[0].SKU;
        db.run(`
            INSERT INTO Order_item (quantity, price, size, color,name, Product_prod, Order_order_id)
            VALUES (?, ?, ?, ?,?, ?, ?)
        `, [quantityInt , uniPrice, size, color,name, product_id, 0], (err) => { //0 because we didnt pass a order yet
    
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
    
            // Success response
            console.log('Product added to cart successfully');
            res.status(201).json({ message: 'Product added to cart successfully' });
        }
        );

    })
    
})



//end point to get the cart items

app.get('/getCartItems',(req,res)=>{
    db.all(`SELECT * FROM Order_item`,[],(err,rows)=>{
        if(err){
            console.error("error in getting the order items");
            return res.status(500).json({error: 'Internal Server Error'});
        }
        //we need to change it to ejs render page
        res.status(200).json({items:rows});
    })

})

//end point to delete an item from the cart
app.delete('/deleteItem/:id',(req,res)=>{
    const itemId = req.params.id;
    if(!itemId){
        return res.status(400).json({error: 'Item ID is required'});
    }
    db.run(`DELETE FROM Order_item WHERE order_item_id = ?`,[itemId],(err)=>{
        if(err){
            console.error(err.message);
            return res.status(500).json({error: 'Internal Server Error'});
        }
        res.status(200).json({message: 'Item deleted successfully'});
    })
})

//end point to create an order
//!!!! check the user authentification
app.post('/makeOrder',(req,res)=>{

})


//server listening
// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Close the database connection when the server shuts down
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});