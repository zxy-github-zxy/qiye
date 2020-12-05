const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const ueditor = require("ueditor");
const session = require("express-session");
const adminRouter = require("./router/admin.js");
const indexRouter = require("./router/index.js");
const usersRouter = require("./router/users.js");
const userRouter = require("./router/user.js");
const newsRouter = require("./router/news.js");
const conn = require("./config/conn.js");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.engine("html",require("express-art-template"));
app.set("view engine","html");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap3', express.static('./node_modules/bootstrap3/dist'));
app.use('/jquery', express.static('./node_modules/jquery/dist'));
app.use(session({
  secret: 'b0322',
  resave: false,
  saveUninitialized: false,
  cookie: {
    // maxAge: 60*60*1000*24
  }
}));

app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  let d = new Date();
  var imgDir = '/uploads/' + d.getFullYear() + (d.getMonth()+1) + d.getDate() 
  var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;
       
        if (ActionType === 'uploadfile') {
            file_url = '/file/ueditor/';
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/video/ueditor/'; 
        }
        res.ue_up(file_url); 
        res.setHeader('Content-Type', 'text/html');
    }
  
  else if (ActionType === 'listimage'){
    
    res.ue_list(imgDir);  // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
	  res.redirect('/ueditor/nodejs/config.json')
}}));

app.use("/admin",adminRouter);
app.use("/",indexRouter);
app.use("/users",usersRouter);
app.use("/user",userRouter);
app.use("/",newsRouter);

app.listen(3000,function(){
    console.log(200);
})