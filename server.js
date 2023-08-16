const express = require('express');
const app = express();
const { pool } = require("./dbConfing"); 
const bcrypt = require('bcrypt'); 
const bodyParser = require('body-parser');
var path = require('path'); 
const fileUpload = require('express-fileupload');
require("dotenv").config();
const session = require('express-session'); 
const flash = require("express-flash"); 
const passport = require("passport"); 
const nodeMailer = require('nodemailer');

var request = require('request-promise');
const initializePassport = require("./passportConfig"); 
var result;
initializePassport(passport); 

const PORT = process.env.PORT || 4050; 

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false})); 
app.use(fileUpload());
app.use(express.static(path.join(__dirname,'public'))); 

app.use(session({
    secret: 'secret', 
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); 
app.use(bodyParser.json());
app.use(session({ secret: 'secret', saveUninitialized: false, resave: false, cookie: { maxAge: 1000 } }));
app.use(flash());

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/users/signup', checkAuthenticated, (req, res) => {
    res.render("signup.ejs");
});


app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render("login.ejs");
});


app.get('/users/profile',checkNotAuthenticated, (req, res) =>{
    res.render("profile", { user: req.user.name }); 
});

app.get('/users/editProfile',checkNotAuthenticated, (req, res) =>{
    res.render("editProfile",{ user: req.user});
});


app.get("/logout",(req, res) => {
    req.session.destroy();
    res.redirect('/');
});
  

app.get('/users/map', checkNotAuthenticated, (req,res) => {
    res.render("map");
})


app.get('/map-data', async (req, res) =>{
    var data = {
        lt: req.query.lt,
        lg: req.query.lg,
    };
    var options = {
        method: 'POST',
        // http:flaskserverurl:port/route
        uri: 'http://127.0.0.1:5000/createScrape',
        body: data,
  
        // Automatically stringifies
        // the body to JSON 
        json: true
    };

    var sendrequest = await request(options)
  
        // The parsedBody contains the data
        // sent back from the Flask server 
        .then(function (parsedBody) {
            console.log(parsedBody);
              
            // You can do something with
            // returned data
            
            result = parsedBody['result'];
            console.log(result);
        })
        .catch(function (err) {
            console.log(err);
        });
});



app.post('/users/signup', async (req, res) =>{

    pool.query(`
    CREATE TABLE IF NOT EXISTS fav (utente VARCHAR NOT NULL, 
                                    title VARCHAR(100) NOT NULL,
                                    type VARCHAR(100) NOT NULL,
                                    address varchar (100),
                                    dist varchar(100) NOT NULL,
                                    phone varchar(100),
                                    website varchar(100),
                                    PRIMARY KEY(utente, title))`, (err, res) => {
        if(err){
            throw err; 
        }
    });

    let { name, surname, username, email, b_day, address, p_num, pw, pw_c } = req.body; 
    
    let errors = []; 

    if (!name || !surname || !username || !email || !b_day || !address || !p_num || !pw || !pw_c ){
        errors.push({message: "Please enter all fields"});
    }

    if (pw.length < 6){
        errors.push({message: "Password must be at least six characters"});
    }

    if (pw != pw_c){
        errors.push({message: "Password do not match!!!"});
    }

    if (errors.length > 0){
        res.render("signup", {errors})
    }else{
        // form validation passed 
        let hashedPassword = await bcrypt.hash(pw, 10); 
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) =>{
                if (err){
                    throw err;
                }
                console.log(results.rows);

                if (results.rows.length > 0){
                    errors.push({message: "Email already in use. "});
                    res.render('signup', {errors}); 
                }else{
                    pool.query(
                        `INSERT INTO users (name, surname, username, email, b_day, address, p_num, pw)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8 )
                        RETURNING username,pw`, [name, surname, username, email, b_day, address, p_num, hashedPassword], (err, results) =>{
                            if(err){
                                throw err; 
                            }
                            req.flash('success_msg', "You are now registered. Please log in. ");
                            res.redirect("/users/login");
                        }
                    )
                }
            }
        )
    }
});

app.post('/users/login', passport.authenticate('local',{
    successRedirect: '/users/profile',
    failureRedirect: '/users/login',
    failureFlash: true,
}));


app.get("/profile/list", (req,res) => {
    pool.query(`SELECT *
                FROM fav
                WHERE utente = $1`, [req.user.username], (err,results) => {
                    if (err) throw err;
                    res.send(JSON.stringify(results.rows));
                })
    
})

app.post('/users/map/update',(req, res) => {
    let {title, type, address, dist, phone, website} = req.body.card;
    //req.user è definito
    pool.query(`
        INSERT INTO fav
        VALUES ($1,$2,$3,$4,$5,$6,$7)`, [req.user.username,title,type,address,dist,phone,website], (err, res) => {
            if (err) throw err;
        })     
})

app.post('/users/map/delete', (req,res) => {
    let {title, type, address, dist, phone, website} = req.body.card;
    pool.query(`
        DELETE FROM fav
        WHERE utente = $1 and title = $2`, [req.user.username,title], (err, res) => {
            if (err) throw err;
        }) 
})


app.post("/send_email", (req, res) =>{
    var _name = req.body.name;
    var _email = req.body.email;
    var _msg = req.body.message;

    var transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    var mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.DESTINATION,
        subject: `Message from ${_name}, ${_email}`,
        html: `${_msg}`
    }
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            throw error;
        }
        else {
            console.log("email sent");
        }
        res.redirect("/");
    })
})


app.post('/users/editProfile', (req, res) => {
    const { username, email, address, p_num } = req.body;
    var oldUser = req.user.username;
    //query che aggiorna il database dei favoriti
    pool.query(`UPDATE fav
                SET utente = $1
                WHERE utente = $2;
    `, [username, oldUser], (err, res) => {
        if (err) throw err;
    });
    var oldMail = req.user.email;
    pool.query(`
                UPDATE users 
                SET username = $1, email = $2, address = $3, p_num = $4
                WHERE name = $5 and surname = $6 and email = $7;
                `, [username, email, address, p_num, req.user.name,req.user.surname, oldMail], (err, result) => {
      if (err) {
        console.error('Error in modify profile:', err.stack);
        res.status(500).send('Error in modify profile');
      }else{
        console.log("Good job");
        res.redirect("/");
      }
    });
})


app.post('/upload', (req, res) => {
    
    const { image } = req.files;

    // If no image submitted, exit
    if (!image) return res.sendStatus(400);

    // Move the uploaded image to our upload folder
    image.mv(__dirname + '/upload/' + image.name);

    res.sendStatus(200);
});


app.post('/search-for-local', (req, res) =>{
    let search = req.body; 
    if (!search){
        res.redirect('/users/map');
    }
    res.redirect('/'); 

    
});


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/profile");
    }
    next();
}
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }


app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});

