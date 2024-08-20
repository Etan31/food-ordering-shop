const router = require('express').Router();
const { checkNotAuthenticated } = require('../middlewares/authCheckNotAuthenticate.js');
const {getOrders} = require('../middlewares/orders.js')
const {getMenuItems} = require('../middlewares/menu.js')
const {pool} = require('../../dbConfig.js')
const fs = require('fs');
const path = require('path');
const multer  = require('multer');

// router.use(express.json());

const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       const uploadDirectory = 'public/uploads/';
       // Check if the directory exists, create it if not
       if (!fs.existsSync(uploadDirectory)) {
         fs.mkdirSync(uploadDirectory);
       }
       cb(null, uploadDirectory);
     },
     filename: function (req, file, cb) {
       cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
     }
   });
const upload = multer({ storage: storage });


 router.get('/bufpay-user/about', checkNotAuthenticated(), async (req, res) => {
    res.render("shopUI/about.ejs");
});

router.get('/dashboard_seller', checkNotAuthenticated(), async(req, res) => {
     res.render("shopUI/dashboard_seller.ejs");
})

router.get('/shop/uploadmenu', checkNotAuthenticated(), async(req, res) => {
     res.render("shopUI/uploadmenu.ejs");
})

router.get('/shop/ordersTable', checkNotAuthenticated(), getOrders, async(req, res) => {
     res.render("shopUI/ordersTable.ejs");
})
router.get('/shop/menusTable', checkNotAuthenticated(), getMenuItems, async(req, res) => {
     res.render("shopUI/menusTable.ejs");
})
router.get('/shop/shopTable', checkNotAuthenticated(), async(req, res) => {
     try {
          const {user_id} = req.user
          const query = `SELECT shop_name.*, users.address, users.email
                         FROM shop_name
                         LEFT JOIN users ON shop_name.user_id = users.user_id
                         WHERE shop_name.user_id = $1`     
          const {rows: data} = await pool.query(query, [user_id])
        //   console.log(data, user_id)

        //   console.log(data)   
          res.render("shopUI/shopTable.ejs", {data: data[0]});

     } catch (error) {
          throw error
     }
})

router.post('/menu/add', upload.single('menuImage'), checkNotAuthenticated(), async (req, res) => {
    const { name, unit, price } = req.body;
    const menuImage = req.file.filename;
    const menuId = req.menuId;
    const user_id = req.user.user_id;

    try {
        // Retrieve the shop name based on the user ID
        const shopQuery = 'SELECT shopname FROM shop_name WHERE user_id = $1';
        const shopResult = await pool.query(shopQuery, [user_id]);

        // Check if the shop name was found
        if (shopResult.rows.length === 0) {
            return res.status(400).send('Shop not found.');
        }

        const shopname = shopResult.rows[0].shopname;

        // Insert the menu with the retrieved shop name
        const insertQuery = `INSERT INTO menus (menu_id, name, price, image, seller_id, shopname, unit)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        const insertValues = [menuId, name, price, menuImage, user_id, shopname, unit];
        await pool.query(insertQuery, insertValues);

        res.status(200).redirect('/shop/menusTable');
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error uploading file');
    }
});




//for updating shop information
router.post('/shop/update-info', upload.single('shopLogo'), checkNotAuthenticated(), async (req, res) => {
    const { name, add, email } = req.body;
    const menuImage = req.file ? req.file.filename : undefined; // Check if file is provided
    const user_id = req.user.user_id;

    try {
        await pool.query('BEGIN'); // Start transaction

        // Retrieve the current shopname
        const result = await pool.query('SELECT shopname FROM shop_name WHERE user_id = $1', [user_id]);
        if (result.rows.length === 0) {
            throw new Error('Shop not found');
        }

        const oldShopName = result.rows[0].shopname;

        // Conditionally update the shop_name table based on the presence of menuImage
        if (menuImage) {
            const query = `UPDATE shop_name SET shopname = $1, logo = $2 WHERE user_id = $3`;
            await pool.query(query, [name, menuImage, user_id]);
        } else {
            const query = `UPDATE shop_name SET shopname = $1 WHERE user_id = $2`;
            await pool.query(query, [name, user_id]);
        }

        // Update the menus table
        const query2 = `UPDATE menus SET shopname = $1 WHERE shopname = $2`;
        await pool.query(query2, [name, oldShopName]);

        // Update the users table
        const query1 = `UPDATE users SET address = $1, email = $2 WHERE user_id = $3`;
        await pool.query(query1, [add, email, user_id]);

        await pool.query('COMMIT'); // Commit transaction

        res.status(200).json({ success: true, redirectUrl: "/shop/shopTable" });
    } catch (error) {
        await pool.query('ROLLBACK'); // Rollback transaction on error
        console.error('Error executing query', error);
        res.status(500).json({ success: false, error: 'Error updating shop information' });
    }
});



router.delete('/menu/delete', checkNotAuthenticated(), async(req, res) => {
     try {
          const {user_id} = req.user
          const {id} = req.body
          const query = `DELETE FROM menus WHERE menu_id = $1 AND seller_id = $2`
          
          await pool.query(query, [id, user_id])
          res.status(204)

     } catch (error) {
          throw error
     }
})

router.post('/shop/updateOrderStatus', checkNotAuthenticated(), async (req, res) => {
    const { orderId, foodId, status } = req.body;
    // console.log("Body: ", req.body);  // Check if this line logs

    try {
        const query = `
            UPDATE orders
            SET status = $1
            WHERE order_id = $2 AND food_id = $3
        `;
        const values = [status, orderId, foodId];
        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false });
    }
});


router.post('/shop/updateOrderStatusActive', checkNotAuthenticated(), async (req, res) => {
    const { orderId, foodId, is_ready, status } = req.body;

    try {
        // This update the order as ready to be delivered"
        const query = `
            UPDATE orders
            SET is_ready = $1, status = $2 
            WHERE order_id = $3 AND food_id = $4
        `;
        const values = [is_ready, status, orderId, foodId];

        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ success: false });
    }
});
router.post('/shop/deliver_and_delete', checkNotAuthenticated(), async (req, res) => {
    const { orderId, foodId, status } = req.body;

    try {
        const query = `
            UPDATE orders
            SET status = $1
            WHERE order_id = $2 AND food_id = $3
        `;
        const values = [status, orderId, foodId];
        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false });
    }
})

module.exports = router;