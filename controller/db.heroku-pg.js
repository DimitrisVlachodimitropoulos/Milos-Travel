// const mysql = require("mysql");
// const bcrypt = require("bcryptjs");
// const fs = require("fs");




// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST,//IP addres of server
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE,
//     port: process.env.PORT
// });


const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect((err) => {
    if (err)
        throw err;
});

module.exports = client
