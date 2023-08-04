const validator = require("validator");
const mongoose = require("mongoose");

const isAuth = (req, res, next) => {
  if (req.session.loggedin === true) {
    next();
    return;
  } else {
    req.session.destroy(function (err) {
      res.redirect("/login");
    });
  }
};

const isLogged = (req, res, next) => {
  if (req.session.loggedin === true) {
    res.redirect("/");
    return;
  } else {
    next();
  }
};

const connect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://satriyo:G5fu8bjy4JxbWDzK@cluster0.juglr08.mongodb.net/aviation?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const airportSchema = new Schema({
  icao: String,
  wmo: String,
});

const Airport = mongoose.model("Airport", airportSchema, "airport");

const authLogin = async (icao, wmo) => {
  await connect(); // Hubungkan ke database
  console.log("Authenticating user:", icao);
  console.log("Password:", wmo);
  try {
    const user = await Airport.findOne({ icao: icao });

    if (user) {
      if (user.wmo === wmo) {
        console.log("Password is correct");
        return { icao: user.icao, wmo: user.wmo };
      } else {
        return { error: "Password is incorrect" };
      }
    } else {
      return { error: "User not found" };
    }
  } catch (err) {
    console.error("Error authenticating user:", err);
    return { error: "An error occurred while authenticating user" };
  }
};

module.exports = { isAuth, authLogin, isLogged };
