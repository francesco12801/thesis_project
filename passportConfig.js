const LocalStrategy = require("passport-local").Strategy; 
const { pool } = require("./dbConfing"); 
const bcrypt = require("bcrypt"); 


function initialize(passport){
    const authenticateUser = (email, pw, done) =>{
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) =>{
                if (err){
                    throw err;
                }
                console.log(results.rows.length);
                if (results.rows.length > 0){
                    
                    const user = results.rows[0]; 
                    bcrypt.compare(pw, user.pw, (err, isMatch) =>{
                        if (err){
                            throw err;
                        }
                        if (isMatch){
                            return done(null, user); 
                        }else{
                            return done(null, false, {message: 'pw is not correct'}); 
                        }
                    });
                }else{
                    return done(null, false, {message: "Email is not registered"}); 
                }
            }
        )
    }

    passport.use(
        new LocalStrategy(
            {
            usernameField: "email", 
            pwField: "pw"
            },
        authenticateUser
        )
    );

    passport.serializeUser((user, done) => done(null, user.name)); 
    passport.deserializeUser((name, done) =>{
        pool.query(
            `SELECT * FROM users
            WHERE name = $1 `, [name], (err, results)=>{
                if (err){
                    throw err; 
                }
                return done(null, results.rows[0]); 
            }
        )
    })
}

module.exports = initialize; 