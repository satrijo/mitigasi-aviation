const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const { isAuth, authLogin, isLogged } = require("../utils/user");
const session = require("cookie-session");
const flash = require("req-flash");
const cookieParser = require("cookie-parser");
const { sendBerita, getBerita } = require("../utils/berita");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { getImage } = require("../utils/image");

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

cron.schedule("*/10 * * * *", () => {
  const getHima = getImage(
    "hima.png",
    "https://inderaja.bmkg.go.id/IMAGE/HIMA/H08_EH_Indonesia.png?time=1234"
  );
  const getSigwx00 = getImage(
    "sigwx_00.gif",
    "https://aviation.bmkg.go.id/shared/sigwx/sigwx_hl_dir/sigwx_00.gif"
  );
  const getSigwx06 = getImage(
    "sigwx_06.gif",
    "https://aviation.bmkg.go.id/shared/sigwx/sigwx_hl_dir/sigwx_06.gif"
  );
  const getSigwx12 = getImage(
    "sigwx_12.gif",
    "https://aviation.bmkg.go.id/shared/sigwx/sigwx_hl_dir/sigwx_12.gif"
  );
  const getSigwx18 = getImage(
    "sigwx_18.gif",
    "https://aviation.bmkg.go.id/shared/sigwx/sigwx_hl_dir/sigwx_18.gif"
  );

  const dateNow = new Date();
  let date = dateNow.getDate();
  if (date < 10) {
    date = `0${date}`;
  }
  let month = dateNow.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  const year = dateNow.getFullYear();

  const getMediumSigwx00 = getImage(
    `medium_${year}${month}${date}00.jpeg`,
    `https://aviation.bmkg.go.id/shared/sigwx/${year}/${month}/sigwx_${year}${month}${date}0000.jpeg`,
    "medium"
  );
  const getMediumSigwx06 = getImage(
    `medium_${year}${month}${date}06.jpeg`,
    `https://aviation.bmkg.go.id/shared/sigwx/${year}/${month}/sigwx_${year}${month}${date}0600.jpeg`,
    "medium"
  );
  const getMediumSigwx12 = getImage(
    `medium_${year}${month}${date}12.jpeg`,
    `https://aviation.bmkg.go.id/shared/sigwx/${year}/${month}/sigwx_${year}${month}${date}1200.jpeg`,
    "medium"
  );
  const getMediumSigwx18 = getImage(
    `medium_${year}${month}${date}18.jpeg`,
    `https://aviation.bmkg.go.id/shared/sigwx/${year}/${month}/sigwx_${year}${month}${date}1800.jpeg`,
    "medium"
  );
});

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

app.post("/find", (req, res) => {
  const { stasiun } = req.body;
  const capital = stasiun.toUpperCase();
  const berita = getBerita(capital);
  berita.then((data) => {
    if (data && data.error) {
      return res.render("find", { errors: data.error });
    }
    res.json(data);
  });
});

app.get("/citra", (req, res) => {
  res.render("citra");
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
  res.status(404).render("404", { title: "404: Halaman Tidak Ditemukan!" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
