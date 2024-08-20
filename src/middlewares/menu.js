const {pool} = require('../../dbConfig.js')


const getMenuItems = async(req, res, next) => {
    try {
    const query = `SELECT * FROM menus WHERE seller_id = $1`
    const {user_id} = req.user
    const {rows: menus} = await pool.query(query, [user_id])
    res.locals.menus = menus
    // console.log(menus)
    next()
    } catch (error) {
        throw error
    }

}

module.exports = {getMenuItems}