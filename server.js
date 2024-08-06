const express = require("express");
const http = require("http");
const app = express();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const server = http.createServer(app);
const path = require('path');
const pg = require('pg');
const fs = require('fs');
const multer  = require('multer');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { pool } = require("./dbConfig");
const { formatDate } = require("./src/modules/date.js")
const initializePassport = require("./passportConfig");
const generateUserNum = require('./src/modules/user_idgenerator');
const cors = require('cors');


initializePassport(passport);

// Middlewares
const { checkNotAuthenticated } = require('./src/middlewares/authCheckNotAuthenticate');
const generateMenuId = require('./src/middlewares/menuID_generator');
app.use(cors());
app.use(generateMenuId);
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');


// routes
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const shopRoutes = require('./src/routes/shopRoutes');

app.use(userRoutes);
app.use(adminRoutes);
app.use(shopRoutes);

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/redirect',  
    failureRedirect: '/',          
    failureFlash: true
}));

// // const userType = req.user.userType; 
app.get("/redirect", (req, res) => {
    if (req.user.userType=== "user") {
        res.redirect("/bufpay-home");
    } else if (req.user.userType=== "seller") {
        res.redirect("/dashboard_seller");
    } else if (req.user.userType=== "admin") {
        res.redirect("/dashboard_admin");
    } else {
        res.redirect("/");
    }
});



app.get('/', async (req, res) => {
    res.render("login.ejs");
});



app.post('/register-account', async (req, res) => {
    const { username, address, email, password , type} = req.body;
    const user_id = generateUserNum();


    try {
        // Hash the password with 10 rounds of salt
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (user_id, email, username, password, usertype, address)
            VALUES ($1, $2, $3, $4, $5, $6)`;
        const quer1 = `INSERT into shop_name (user_id, shopname) values ($1, $2)`
      
        const values = [user_id, email, username, hashedPassword, type, address];

       

        const result = await pool.query(query, values);

        if(type === 'seller'){
            await pool.query(quer1, [user_id, username])
        }

        const data = result.rows;

        res.render('login.ejs', data);
    } catch (error) {
        console.error('Error inserting user: ', error);
        res.status(500).json('Internal server error');
    }
});

app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.render("login", {
        message: ["You have logged out successfully"],
      });
    });
  });


////////////seller


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

app.post('/menu-upload', upload.single('menuImage'), checkNotAuthenticated() , async (req, res) => {
    const { menuName, menuPrice } = req.body;
    const menuImage = req.file.filename;
    const menuId = req.menuId;
    const user_id = req.user.user_id;
    let shopname = 'Premea_Hotel'

    try {
        const query = `INSERT INTO menus (menu_id, name, price, image, seller_id, shopname)
            VALUES ($1, $2, $3, $4, $5, $6)`
        const values = [menuId, menuName, menuPrice, menuImage, user_id, shopname];
        await pool.query(query, values);    
        res.status(200).send('File uploaded successfully');
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Error uploading file');
    }
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
