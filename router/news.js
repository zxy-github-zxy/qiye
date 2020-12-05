const express = require("express");
const router = express.Router();
const conn = require("../config/conn.js");


router.get("/news/:id",function(req,res){
    let sql = `select *from zxy_news where id =` + req.params.id;
    conn.query(sql,function(error,result){
        res.render("news",{news:result[0]});
    })
    // res.render("news")
})

module.exports = router;