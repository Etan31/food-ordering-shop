const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig.js");
// src\controller\dbConfig.js
const bcrypt = require("bcrypt");

function initialize(passport) {
 
  console.log("Initialized");
 

  const authenticateUser = (user, password, done) => {
    const query = `SELECT * FROM users WHERE username = $1 OR email = $1`;
    pool.query(query, [user], (err, results) => {
      if (err) {
        throw err;
      }

      if (results.rows.length > 0) {
          const user = results.rows[0];
          bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) {
                  console.log(err);
              }
              if (isMatch) {
                  return done(null, user);
              } else {
                  // password is incorrect
                  return done(null, false, { message: "Password is incorrect" });
              }
          });
      } else {
        // No user
        return done(null, false, {
          message: "No user with that username or email address",
        });
      }
    });
  };

  passport.use(
  "local-login",
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    (user, password, done) => {
      authenticateUser(user, password, done);
    }
  )
);


  passport.serializeUser((user, done) => {
    try {
      done(null, user.user_id);
      console.log("Serialized user:", user);
    } catch (error) {
      console.error("Error during serialization:", error);
      done(error, null);
    }
  });
  

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user
  passport.deserializeUser((id, done) => {
    pool.query(
      `SELECT * FROM users WHERE user_id = $1`,
      [id],
      (err, results) => {
        if (err) {
          console.log("err")
          return done(err);
        
        }

        // let firstlogin = false;
        // firstlogin = results.rows[0].first_login;
        // let roles = null;
        // roles = results.rows[0].roles.roles;

        const userType = results.rows[0].usertype;
       

        let user = {
          userType: userType,
          user_id: id,
        };
        // console.log(user);
        return done(null, user);
      }
    );
  });
}

module.exports = initialize;
