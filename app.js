var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cors = require("cors");

var indexRouter = require("./routes/index");
var admin = require("./routes/admin");
var buyer = require("./routes/buyer");
var seller = require("./routes/seller");
var staff = require("./routes/staff");
var company = require("./routes/company");
var user = require("./routes/users");
var consignment = require("./routes/consignment");
var vechicle = require("./routes/vechicle");
var invoice = require("./routes/invoice");
var load = require("./routes/load");
var state = require("./routes/state");
var party = require("./routes/party");

require("dotenv").config();
var dbURI = process.env.DBURI;
var app = express();
app.use(cors());
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", admin);
app.use("/buyer", buyer);
app.use("/seller", seller);
app.use("/staff", staff);
app.use("/company", company);
app.use("/user", user);
app.use("/consignment", consignment);
app.use("/vechicle", vechicle);
app.use("/invoice", invoice);
app.use("/load", load);
app.use("/state", state);
app.use("/party", party);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
