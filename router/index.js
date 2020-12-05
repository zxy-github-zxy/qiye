const express = require("express");
const router = express.Router();
const conn = require("../config/conn.js");

router.get("/",function(req,res){
    let sql =  `select * from zxy_news where status = 1 order by id desc`;
    conn.query(sql,function(error,result){
        res.render("index",{title : "公司名称",list : result});
    })
})

router.get("/del_news", function (req, res) {
    let id = req.query.did;
    let sql = `delete from zxy_news where id=${id}`;
    conn.query(sql, function (error, result) {
        res.send('<script>alert("删除成功"); location="/"</script>')
    })
})
module.exports = router;