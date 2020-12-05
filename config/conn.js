const mysql = require('mysql');

const conn = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'zxy'
});

conn.connect(function(err){
    if(err){
        console.log(err);
    }
});

module.exports = conn;