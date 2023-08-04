const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect(
      "mongodb+srv://satriyo:G5fu8bjy4JxbWDzK@cluster0.juglr08.mongodb.net/?retryWrites=true&w=majority/aviation"
    )
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = { connect };
