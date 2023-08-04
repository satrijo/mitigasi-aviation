const mongoose = require("mongoose");

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

const beritaSchema = new Schema({
  type: String,
  icao: String,
  icao_sender: String,
  berita: String,
  timestamp: { type: Date, default: Date.now },
});

const Berita = mongoose.model("Berita", beritaSchema, "berita");

const sendBerita = async (berita, icao_sender) => {
  // check if berita is empty
  if (berita === "") {
    return { error: "Berita tidak boleh kosong" };
  }

  if (
    berita.substring(0, 4).toUpperCase() === "SAID" ||
    berita.substring(0, 4).toUpperCase() === "SPID"
  ) {
    console.log("SAID");
    sendToDb(berita, icao_sender, "METAR-SPECI");
  } else if (berita.substring(0, 4).toUpperCase() === "WSID") {
    sendToDb(berita, icao_sender, "SIGMET");
  } else if (berita.substring(0, 4).toUpperCase() === "FTID") {
    sendToDb(berita, icao_sender, "TAF");
  } else {
    return { error: "Berita tidak valid" };
  }
};

const sendToDb = async (berita, icao_sender, type) => {
  try {
    await connect();
    let icao = berita.substring(7, 11);
    const newBerita = new Berita({
      type: type,
      icao: icao,
      icao_sender: icao_sender,
      berita: berita,
    });
    await newBerita.save();
    return { success: "Berita berhasil dikirim" };
  } catch (err) {
    console.error("Error saving berita:", err);
    return { error: "Terjadi kesalahan saat menyimpan berita" };
  }
};

module.exports = { sendBerita };
