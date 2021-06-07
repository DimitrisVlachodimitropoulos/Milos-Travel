const express = require('express')
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express()
const exphbs = require('express-handlebars');
const path = require("path");
const bodyParser = require("body-parser");
const { Client } = require('pg');
const dotenv = require("dotenv");
dotenv.config({ path: './.env'});


app.use(express.static('static'))


const client = new Client({
    connectionString: "postgres://zoexckzqyyaiah:a7c3cadf4406b7dc6c421ba0071b979446e56ef830547b29d3d796d0b1b7bef7@ec2-35-171-250-21.compute-1.amazonaws.com:5432/dfr5tu194p8rj1",
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect(console.log("PostgreSQL Conected..."));

app.use(cookieParser());
app.use(session({
    secret: "secretpassword",
    resave: false,
    saveUninitialized: false
}));
app.use(express.urlencoded({extended: false }));
app.use(express.json());



const routes = require('./routes/milos-routes');
app.use('/', routes);

app.engine('hbs', exphbs({
    defaultLayout: 'layout',
    extname: 'hbs'
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use('/milos-routes',require("./routes/milos-routes"));





module.exports = app;
