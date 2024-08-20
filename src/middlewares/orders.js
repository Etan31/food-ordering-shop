const { name } = require('ejs')
const {pool} = require('../../dbConfig.js')
const e = require('express')


const getOrders = async (req, res, next) => {
    try {
        const { user_id } = req.user;
        const query = `SELECT orders.*, menus.name
                        FROM orders
                        LEFT JOIN menus ON orders.food_id = menus.menu_id
                        WHERE orders.seller_id = $1`;
        const { rows: orders } = await pool.query(query, [user_id]);
        let customers = [];
        let indivOrders = [];

        orders.forEach(order => {
            const deliveryDate = new Date(order.delivery_pickup_date);
            console.log(`Order ID: ${order.order_id}, Delivery Date: ${deliveryDate.toLocaleString()}`);
            
            if (!customers.includes(order.user_id)) {
                indivOrders.push({
                    user_id: order.user_id,
                    name: order.cust_name,
                    delivery_date: deliveryDate,
                    address: order.address,
                    itemNum: 1,
                    total: parseInt(order.total_payment),
                    mode: order.mode_delivery,
                    orders: [order]
                });
                customers.push(order.user_id);
            } else {
                let existingorder = indivOrders[customers.indexOf(order.user_id)];
                existingorder.itemNum++;
                existingorder.total += parseInt(order.total_payment);
                existingorder.orders.push(order);
            }
        });

        res.locals.orders = indivOrders;
        console.log("Orders: ", JSON.stringify(indivOrders, null, 2));
        next();
    } catch (error) {
        throw error;
    }
};

const getUserOrders = async (req, res, next) => {
    try {
        const query = `SELECT orders.*, menus.name, shop_name.shopname
                        FROM orders
                        LEFT JOIN menus ON orders.food_id = menus.menu_id
                        LEFT JOIN shop_name ON orders.seller_id = shop_name.user_id
                        WHERE orders.user_id = $1`
        const {user_id} = req.user
        const {rows: orders} = await pool.query(query, [user_id])

        res.locals.user_orders = orders
        next() 

    } catch (error) {
        throw error
    }
}

module.exports = {getOrders, getUserOrders}