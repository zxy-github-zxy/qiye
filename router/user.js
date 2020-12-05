const express = require("express");
const conn = require("../config/conn.js");
const common = require("../common/md5.js")
const router = express.Router();

router.get("/",function(req,res){
    let sql = "select * from zxy_admin";
    conn.query(sql,function(error,result){
        res.render('user', {
            title: 'user list',
            userlist: result
          });
    })
})

router.get("/add.html",function(req,res){
    res.render("add")
})

router.post("/add",function(req,res){
    let username = req.body.name;
    let password = common.setMd5(req.body.password);
    let salt = req.body.salt;
    let sql = "insert into zxy_admin(name,password,salt,create_time) values('"+ username +"','"+ password +"','"+ salt +"',now())";
    conn.query(sql,function(error,result){
        res.redirect("/user")
    })
})

router.get("/del",function(req,res){
    // console.log(req.query);
    let id = req.query.did;
    let sql = `delete from zxy_admin where id=${id}`;
    conn.query(sql,function(error,result){
        res.redirect("/user");
    })
})

router.get("/edit",function(req,res){
    let id = req.query.eid;
    let sql = `select * from zxy_admin where id =` + id;
    conn.query(sql,function(error,result){
        // console.log(result);
        res.render('edit', {
            user: result[0] 
          })
    })
})

router.post("/edit",function(req,res){
    let id = req.body.eid;
    let username = req.body.name;
    let password = common.setMd5(req.body.password);
    let salt = req.body.salt;
    let sql = `update zxy_admin set name='${username}',password='${password}',salt='${salt}' where id=${id}`;
    conn.query(sql,function(error,result){
        res.redirect("/user");
    })
})



module.exports = router;
