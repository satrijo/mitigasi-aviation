const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const { isAuth, authLogin, isLogged } = require("../utils/user");
const session = require("cookie-session");
const flash = require("req-flash");
const cookieParser = require("cookie-parser");
const { sendBerita } = require("../utils/berita");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(expressLayouts);
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "aBankTuKangBaks0",
    name: "secretName",
    cookie: {
      sameSite: true,
      maxAge: 60000 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.get("/", isAuth, (req, res) => {
  res.render("index", { username: req.session.username });
});

app.post("/", isAuth, (req, res) => {
  const { berita, username } = req.body;
  const send = sendBerita(berita, username);
  send.then((data) => {
    if (data && data.error) {
      return res.render("index", {
        username: req.session.username,
        errors: data.error,
      });
    }

    res.render("index", {
      username: req.session.username,
      success: "Berita berhasil dikirim",
    });
  });
});

app.get("/find", isAuth, (req, res) => {
  res.render("find");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.get("/login", isLogged, (req, res) => {
  res.render("login", { errors: {} });
});

app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    const checkAuth = authLogin(username, password);
    checkAuth.then((data) => {
      if (data.error) {
        res.render("login", { errors: data.error });
      } else {
        req.session.loggedin = true;
        req.session.username = data.icao;
        res.redirect("/");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// middleware not found
app.use("/", (req, res) => {
  res.status(404).render("404", { title: "404" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
