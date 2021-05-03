var express = require("express"); // Gọi thư viện express
var app = express(); // Sử dụng express
app.use(express.static("public")); // Thiết lập thư mục mặc định
app.set("view engine", "ejs"); // Thiết lập thư viện view mặc định (file giao diện)
app.set("views", "./views"); // Thiết lập thư mục chứa file giao diện
// Mở cổng port 
app.listen(3000);

// Truy vấn vào cơ sở dữ liệu -> sử dụng thư viện posgresql nodejs -> postgresql nodejs github
var pg = require('pg'); // Nạp thư viện posgresql vào
// Thiết lập biến config để kết nối csdl - (lấy thông tin - giá trị tương ứng trong csdl)
var config = {
      user: 'postgres',
      database: 'chucmunggiangsinh',
      password: '1234',
      host: 'localhost',
      port: 5432,
      max: 10,
      idleTimeoutMillis: 30000
}
// Cấu hình kết nối cơ sở dữ liệu thông qua biến config
var pool = new pg.Pool(config);

// bodyparser nodejs github -> Bắt dữ liệu dạng post  
var bodyParser = require('body-parser'); // Tạo biến nạp thư viện body parser
var urlencodedParser = bodyParser.urlencoded({ extended: false }); // Cấu hình biến để nhận được dữ liệu từ Post trả về

// multer nodejs github -> upload file
var multer = require('multer');
// Cấu hình đường dẫn upload file
var storage = multer.diskStorage({
      destination: function (req, file, cb) {
            cb(null, './public/upload'); // Thư mục upload file
      },
      filename: function (req, file, cb) {
            cb(null, file.originalname); // Tên file, originalname -> hiển thị tên file gốc
      }
})
// Sử dụng cấu hình storage cho file, single -> file đơn, uploadfile -> tên file (name="uploadfile")
var upload = multer({ storage: storage }).single('uploadfile');

// Tạo route - đường dẫn
app.get("/", function (req, res) {
      // Kết nối cơ sở dữ liệu
      pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
            if (err) { // Nếu có lỗi
                  return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
            }
            // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
            client.query('select * from video', function (err, result) {
                  done();

                  if (err) { // Nếu có lỗi
                        res.end();
                        return console.error('error running query', err); // Thông báo lỗi
                  }
                  res.render("home", { data: result }); // Trả về file giao diện, hứng dữ liệu trả về
            });
      });
});

app.get("/video/list", function (req, res) {
      // Kết nối cơ sở dữ liệu
      pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
            if (err) { // Nếu có lỗi
                  return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
            }
            // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
            client.query('select * from video', function (err, result) {
                  done();

                  if (err) { // Nếu có lỗi
                        res.end();
                        return console.error('error running query', err); // Thông báo lỗi
                  }
                  res.render("list", { data: result }); // Trả về file giao diện, hứng dữ liệu trả về
            });
      });
})

// Xử lý xóa video
app.get("/video/delete/:id", function (req, res) { // id: tham số
      // res.send(req.params.id); // Trả về tham số id
      pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
            if (err) { // Nếu có lỗi
                  return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
            }
            // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
            client.query('delete from video where id = ' + req.params.id, function (err, result) {
                  done();

                  if (err) { // Nếu có lỗi
                        res.end();
                        return console.error('error running query', err); // Thông báo lỗi
                  }
                  res.redirect("../list"); // Trả về route 
            });
      });
})

// Xử lý thêm video
app.get("/video/add", function (req, res) {
      res.render("add");
})
app.post("/video/add", urlencodedParser, function (req, res) { // urlencodedParser -> sử dụng bodyParser đã cấu hình
      upload(req, res, function (err) {
            // Upload file
            if (err) { // Nếu có lỗi (Cấu hình sai)
                  res.send("Lỗi");
            } else {
                  if (req.file == undefined) {
                        res.send("File chưa được chọn");
                  }
                  else {
                        // res.send("OK");
                        // // console.log(req.file); // Thuộc tính file
                        // console.log(req.body); // Dữ liệu lấy được từ bodyParser

                        // Truy vấn cơ sở dữ liệu
                        pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
                              if (err) { // Nếu có lỗi
                                    return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
                              }
                              var sql = "insert into video (tieude, mota, key, image) values ('" +
                                    req.body.tieude + "','" + req.body.mota + "','" + req.body.key +
                                    "','" + req.file.originalname + "')"; 
                              // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
                              client.query(sql, function (err, result) {
                                    done();
                  
                                    if (err) { // Nếu có lỗi
                                          res.end();
                                          return console.error('error running query', err); // Thông báo lỗi
                                    }
                                    res.redirect("./list"); // Trả về route 
                              });
                        });
                  }
            }
      });
});

// Xử lý sửa video
app.get("/video/edit/:id", function (req, res) {
      var id = req.params.id;
      pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
            if (err) { // Nếu có lỗi
                  return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
            }
            // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
            client.query('select * from video where id = ' + id, function (err, result) {
                  done();

                  if (err) { // Nếu có lỗi
                        res.end();
                        return console.error('error running query', err); // Thông báo lỗi
                  }
                  res.render("edit", {data:result.rows[0]}); // Trả về file giao diện
            });
      });
})
app.post("/video/edit/:id", urlencodedParser, function (req, res) {
      var id = req.params.id;
      upload(req, res, function (err) {
            // Upload file
            if (err) { // Nếu có lỗi (Cấu hình sai)
                  res.send("Xảy ra lỗi trong quá trình upload");
            } else {
                  if (typeof(req.file) == 'undefined') {
                        // Truy vấn cơ sở dữ liệu
                        pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
                              if (err) { // Nếu có lỗi
                                    return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
                              }
                              // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
                              client.query("UPDATE video set tieude ='"+req.body.tieude+"', mota='"
                                    +req.body.mota+"', key='"+req.body.key+"' WHERE id="+id, 
                                    function (err, result) {
                                    done();
                  
                                    if (err) { // Nếu có lỗi
                                          res.end();
                                          return console.error('error running query', err); // Thông báo lỗi
                                    }
                                    res.redirect("../list"); // Trả về route 
                              });
                        });
                  }
                  else {
                        // Truy vấn cơ sở dữ liệu
                        pool.connect(function (err, client, done) { // Kết nối cơ sở dữ liệu
                              if (err) { // Nếu có lỗi
                                    return console.error('error fetching client from pool', err); // Xuất thông báo lỗi
                              }
                              // Nếu không có lỗi -> Thực hiện truy vấn đến cơ sở dữ liệu
                              client.query("UPDATE video set tieude ='"+req.body.tieude+"', mota='"
                                    +req.body.mota+"', key='"+req.body.key+"', image='"+req.file.originalname
                                    + "' WHERE id="+id, function (err, result) {
                                    done();
                  
                                    if (err) { // Nếu có lỗi
                                          res.end();
                                          return console.error('error running query', err); // Thông báo lỗi
                                    }
                                    res.redirect("../list"); // Trả về route
                              });
                        });
                  }
            }
      });
})