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
    connectionString: "postgres://zoexckzqyyaiah:a7c3cadf4406b7dc6c421ba0071b979446e56ef830547b29d3d796d0b1b7bef7@ec2-35-171-250-21.compute-1.amazonaws.com:5432/dfr5tu194p8rj1",
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect((err) => {
    if (err)
        throw err;
});

module.exports = client
