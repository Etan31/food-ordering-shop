const router = require('express').Router();
const { pool } = require("../../dbConfig");
const { checkNotAuthenticated } = require('../middlewares/authCheckNotAuthenticate.js');
const {getUserOrders} = require('../middlewares/orders.js')


router.get('/user-portal/register', (req, res) => {
    res.render('signup.ejs');
});


router.get('/bufpay-home', checkNotAuthenticated() ,async(req, res) => {
     const userType = req.user.userType; 
     const user_id = req.user.user_id;
     const shopname = '7104102124';


     try {

   

          const query = `SELECT * FROM menus WHERE seller_id = $1`;
          const query1 = `SELECT * FROM shop_name`
          const { rows } = await pool.query(query, [shopname]);
          const { rows: shops } = await pool.query(query1);

          res.render("userUI/home.ejs", { menus: rows , shops: shops});
     } catch (error) {
          console.error('Error fetching menu data', error);
          res.status(500).send('Error fetching menu data');
     }
})
router.get('/shop/getdishes', checkNotAuthenticated() , async(req, res) => {

    
     const {shop} = req.query

     console.log("shoppp", shop)


     try {

   

          const query = `SELECT * FROM menus WHERE seller_id = $1`;
          const query1 = `SELECT * FROM shop_name`
          const { rows } = await pool.query(query, [shop]);
          const { rows: shops } = await pool.query(query1);
          console.log("shoppp", "fgfgfg ")
          console.log(rows)


          res.render("userUI/home.ejs", { menus: rows , shops: shops});
         

     } catch (error) {
        throw error
     }
})

router.get('/bufpay-user/cart', checkNotAuthenticated(), async (req, res) => {
     const user_id = req.user.user_id;
 
     console.log("user", user_id);
     const query = `
         SELECT cart.*, menus.* 
         FROM cart 
         LEFT JOIN menus ON cart.food_id = menus.menu_id
         WHERE user_ids = $1
     `;
 
     const values = [user_id];
 
     try {
         const result = await pool.query(query, values);
 
         // Calculate total price
         let totalPrice = 0;
         result.rows.forEach(order => {
             totalPrice += parseFloat(order.price);
         });
 
         // Render the template after calculating the total price
         res.render("userUI/cart.ejs", { orders: result.rows, totalPrice: totalPrice });
 
        
     } catch (error) {
         console.error('Error:', error);
         res.status(500).send('Error occurred while retrieving order data.');
     }
 });

 router.get('/bufpay-user/order', checkNotAuthenticated(), getUserOrders, async (req, res) => {
    
    res.render("userUI/order.ejs");
 });
 
 router.get('/bufpay-user/about', checkNotAuthenticated(), async (req, res) => {



    res.render("userUI/about.ejs");

});
router.post('/bufpay-user/addOrder', checkNotAuthenticated(), async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const {menu_id, seller_id} = req.body; // Assuming you pass menu_id in the request body

        // Check if the item with the same menu_id already exists in the order list
        const checkQuery = 'SELECT * FROM cart WHERE user_ids = $1 AND food_id = $2';
        const checkResult = await pool.query(checkQuery, [user_id, menu_id]);

        if (checkResult.rows.length > 0) {
            // If the item already exists, send a message indicating that it's already in the order list
            return res.status(400).send({ message: 'Item is already in the order list' });
        }

        // Fetch the menu details
        const menuQuery = 'SELECT * FROM menus WHERE menu_id = $1';
        const menuResult = await pool.query(menuQuery, [menu_id]);
        const menu = menuResult.rows[0];

        // Insert order into the database with default quantity of 1
        const insertQuery = 'INSERT INTO cart (user_ids, food_id, quantity, seller_id) VALUES ($1, $2, $3, $4)';
        const values = [user_id, menu.menu_id, 1, seller_id]; // Default quantity is set to 1
        await pool.query(insertQuery, values);

        res.status(200).send({ message: 'Order added successfully' });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

 
 router.delete('/bufpay-user/deleteOrder', checkNotAuthenticated(), async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const food_id = req.body.food_id; // Assuming you pass food_id in the request body

        // Construct the DELETE query to delete the order with the specified user_id and food_id
        const deleteQuery = 'DELETE FROM cart WHERE user_ids = $1 AND food_id = $2';
        
        // Execute the query to delete the order
        await pool.query(deleteQuery, [user_id, food_id]);

        res.status(200).send({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.delete('/bufpay-user/deleteAllOrders', checkNotAuthenticated(), async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Construct the DELETE query to delete all orders for the specified user_id
    const deleteQuery = 'DELETE FROM cart WHERE user_ids = $1';
    
    // Execute the query to delete all orders
    await pool.query(deleteQuery, [user_id]);

    res.status(200).send({ message: 'All orders deleted successfully' });
  } catch (error) {
    console.error('Error deleting all orders:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});



router.put('/bufpay-user/updateQuantity', checkNotAuthenticated(), async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { food_id, quantity } = req.body;

        // Update the quantity in the database
        const updateQuery = 'UPDATE cart SET quantity = $1 WHERE user_ids = $2 AND food_id = $3';
        await pool.query(updateQuery, [quantity, user_id, food_id]);

        res.status(200).send({ message: 'Quantity updated successfully' });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



router.post('/save-order', checkNotAuthenticated(), async(req, res) => {
    try {
        const {  mode,
        name,
        contactNumber,
        deliveryAddress,
        date_time} = req.body;
        const user_id = req.user.user_id;

        console.log("user:" , user_id)
        

        const getCart = `SELECT cart.*, menus.price
                        FROM cart 
                        LEFT JOIN menus ON cart.food_id = menus.menu_id
                        WHERE cart.user_ids = $1`
        const query = `INSERT INTO orders (food_id, user_id, mode_delivery, total_payment, delivery_pickup_date, seller_id, cust_name, contact, address, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
        const values = [ mode,
            name,
            contactNumber,
            deliveryAddress,
            date_time]


    
            const {rows: cart} = await pool.query(getCart, [user_id])

            console.log("cart: ", cart)

            cart.forEach(async item => {

                await pool.query(query, [item.food_id, user_id, mode, item.quantity* item.price, date_time, item.seller_id, name, contactNumber, deliveryAddress, item.quantity])

            })

    } catch (error) {
        throw error;
    }
}) 




 
module.exports = router;