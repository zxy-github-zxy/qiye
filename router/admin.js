const express = require("express");
const router = express.Router();
const conn = require("../config/conn.js");
const common = require("../common/md5.js");
const multer = require("multer");
const path = require("path");
const chk_login = require("../middle/chk.js");

router.use((req, res, next) => {
    if (req.body.remember) {
        req.session.cookie.maxAge = 60 * 60 * 1000 * 24;
    }
    next();
});

router.use(chk_login());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        let extName = path.extname(file.originalname);
        // console.log(extName);
        cb(null, file.fieldname + "-" + Date.now() + extName);
    },
});

var upload = multer({
    storage: storage
});

router.get("/", function (req, res) {
    res.render("admin/index", {
        title: 1,
        admin: req.session.admin
    });
})
router.get("/login.html", function (req, res) {
    res.render("admin/login", {
        title: '企业管理系统'
    });
})
router.get("/fenlei.html", function (req, res) {
    res.render("admin/fenlei");
})
router.get("/main.html", function (req, res) {
    res.render("admin/main")
})
router.get('/admin_list.html', function (req, res) {
    let sql = "select * from zxy_admin";
    conn.query(sql, function (error, result) {
        res.render('admin/admin_list', {
            list: result
        });
    })
});

router.get('/logout', function (req, res) {
    req.session.destroy();
    res.send('<script>alert("退出成功"); top.location="/admin/login.html"</script>');
});

router.get("/add.html", function (req, res) {
    res.render("admin/add")
})

router.post('/add', upload.single('avatar'), function (req, res) {


    let sql = `select id from zxy_admin where name='${req.body.name}'`;
    conn.query(sql, function (error, result) {

        if (result[0]) {
            return res.send("<script>alert('用户名已存在'); history.back();</script>");
        }
        let avatar = req.file.filename;
        let salt = common.getRandomNumber();
        let password = common.setMd5(req.body.password, salt);

        let sql = "insert into zxy_admin(name, password, salt, avatar, role, create_time) values(?, ?, ?, ?, ?, now())";

        conn.query(sql, [req.body.name, password, salt, '/uploads/' + avatar, req.body.role], function (error, result) {
            if (error) {
                return res.send(error.toString());
            }
            if (result) {

            }
            res.send("<script>alert('添加成功'); window.location.href='/admin/admin_list.html'</script>");
        });
    });
});

router.get("/del", function (req, res) {
    // console.log(req.query);
    let id = req.query.did;
    let sql = `delete from zxy_admin where id=${id}`;
    conn.query(sql, function (error, result) {
        res.send('<script>alert("删除成功"); location="/admin/admin_list.html"</script>')
    })
})

router.get("/edit", function (req, res) {
    let id = req.query.eid;
    let sql = `select * from zxy_admin where id =` + id;
    conn.query(sql, function (error, result) {
        // console.log(result);
        res.render('admin/edit', {
            admin: result[0]
        })
    })
})

router.post("/edit", upload.single('avatars'), function (req, res) {
    console.log(req.body)
    let id = req.body.eid;
    let username = req.file.filename;
    let salt = req.body.salt;
    let avatar = req.body.avatar;
    let password = common.setMd5(req.body.password, salt);

    let sql = `update zxy_admin set name='${username}',password='${password}',salt='${salt}',avatar='${avatar}' where id=${id}`;
    conn.query(sql,[id,username,salt,'/uploads/' + avatar,password],function (error, result) {

        return res.send('<script>alert("添加成功"); location="/admin/admin_list.html"</script>')
    })
})

router.post("/login", function (req, res) {
    let name = req.body.name;
    let password = req.body.password;
    let sql = "select * from zxy_admin where name='" + name + "'";
    conn.query(sql, function (error, result) {
        if (error) {
            return res.send(error.toString());
        }
        if (result.lenght == 0) {
            return res.send('<script>alert("用户名或密码不正确"); history.back()</script>');
        }
        // console.log(result[0])
        let pwd_database = result[0].password;
        let admin_salt = result[0].salt;
        let pwd_post = common.setMd5(password, admin_salt);
        if (pwd_database != pwd_post) {
            return res.send('<script>alert("用户名或密码不正确"); history.back()</script>')
        }
        req.session.admin = result[0];

        let session_val = JSON.stringify(req.session);
        let maxAge = req.session.cookie.expires;
        let session_id = req.cookies["connect.sid"];
        // console.log(maxAge);
        if (req.body.remember) {
            let sql = `insert into zxy_session values('${session_id}', '${maxAge}', '${session_val}', now())`;
            // console.log(req.session.cookie);
            conn.query(sql, function (error, result) {
                if (error) {
                    console.log(error);
                }
                // console.log(result);
            });
        }

        return res.send(
            '<script>alert("登录成功"); location.href="/admin"</script>'
        );
    })
})

router.get("/password.html", function (req, res) {
    res.render("admin/password")
})

router.post('/password', function (req, res) {
    let name = req.session.admin.name;
    let sql = "select * from zxy_admin where name='" + name + "'";
    conn.query(sql, function (error, result) {
        if (error) {
            return res.send(error.toString())
        }
        // console.log(result[0])
        let pwd_database = result[0].password;
        let admin_salt = result[0].salt;
        let pwd_post = common.setMd5(req.body.password, admin_salt);
        if (pwd_database != pwd_post) {
            return res.send('<script>alert("原始密码不正确"); history.back()</script>');
        }
        if (req.body.new_password != req.body.confirm_password) {
            return res.send('<script>alert("两次密码不一致"); history.back()</script>');
        }
        let new_salt = common.getRandomNumber();
        let new_password = common.setMd5(req.body.new_password, new_salt);
        let sql = `update zxy_admin set password='${new_password}', salt='${new_salt}' where id = ${result[0].id}`;
        conn.query(sql, function (error, result) {
            // console.log(result);
            if (result) {

                return res.send('<script>alert("密码修改成功, 请重新登录"); location.href="/admin/logout"</script>');
            }
        });
    });
});

// function getTree(data, pid, lv) {
// 	let result = [];
// 	if (data && typeof data == "object") {
// 		for (var index in data) {
// 			if(data[index].parent_id == pid){
// 				result.push(data[index]);
// 				result = result.concat(getTree(data, data[index].id,lv+1));
// 			}	
// 		}
// 	}
// 	return result;
// }

// router.get("/demo", function (req, res) {
	
// 	let sql = "select * from zxy_news";
// 	conn.query(sql, function (error, result) {
		
// 		let list = getTree(result, 0, 1);
// 		res.render("admin/demo", {
// 			cat_list: list,
// 		});
// 	});
// });

// router.get("/del_cat/:id",function(req,res){
//     let sql = `select * from zxy_news`;
//     conn.query(sql,function(error,result){
//         let list = getTree(result,req.params.id);
//         let idArr = list.map(function(item){
//             return item.id;
//         })
//         idArr.push(req.params.id);
//         let str = '(' + idArr.join(',') + ')';
//         let sql =  `delete from zxy_news where id in ` + str;
//         conn.query(sql, function (error, result) {
//             res.send('<script>alert("删除成功"); location="/admin/demo"</script>')
//         })
//     })
// })

// router.get("/demo",function(req,res){
//     let sql = `select * from zxy_news`;
//     conn.query(sql,function(error,result){
//         res.render("admin/demo",{
//             cat_list : result
//         })
//     })
// })

// router.get("/del_cat",function(req,res){
//     let id = req.query.did;
//     let sql = `delete from zxy_news where id = ${id}`;
//     conn.query(sql, function (error, result) {
//         res.send('<script>alert("删除成功"); location="/admin/demo"</script>')
//     })
// })

router.get("/add_news.html",function(req,res){
    res.render("admin/add_news");
})

router.post("/add_news",upload.single("imgs"),function(req,res){
    let title = req.body.title;
    let content = req.body.content;
    let img_thumbs = req.file.filename;
    let description = req.body.description;
    let keywords = req.body.keywords;
    let author = req.body.author;
    let status = req.body.status;
    let sql = "insert into zxy_news(title,keywords,description,content,img_thumbs,author,status,create_time) values('"+ title +"','"+ content +"','"+ description +"','"+ keywords +"','"+ img_thumbs +"','"+ author +"','"+ status +"',now())";
    conn.query(sql,function(error,result){
        res.send('<script>alert("添加成功"); location="/"</script>');
    })
    // let sql = "insert into zxy_news(title) values('"+ title +"')"
    // conn.query(sql,function(error,result){
    //     res.send(result);
    // })
})


module.exports = router;