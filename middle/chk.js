// function chk_login(){
//     return function(req, res, next){
//         if(req.url == '/login.html' || req.url == '/login'){
//            return  next();
//         }
//         if(!req.session.admin){
//             return res.send('<script>alert("请先登录"); location.href="/admin/login.html"</script>');
//         }
//         next();
//     }
// }

function chk_login() {
	return function (req, res, next) {
		if (req.session.admin) {
			if (req.url == "/login.html" || req.url == "/login") {
				res.redirect("/admin");
			} else {
				next();
			}
		} else {
			if (req.url == "/login.html" || req.url == "/login") {
				next();
			} else {
				return res.send(
					'<script>top.location.href="/admin/login.html"</script>'
				);
			}
		}
	};
}
module.exports = chk_login;
