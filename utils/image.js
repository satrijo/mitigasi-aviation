const axios = require("axios");
const fs = require("fs");

const getImage = (type, url, folder = null) => {
  const random = Math.floor(Math.random() * 10000);
  axios
    .get(`${url}?time=${random}`, {
      responseType: "arraybuffer",
    })
    .then((res) => {
      const imgBuffer = Buffer.from(res.data, "binary");
      if (folder) {
        fs.writeFile(
          `public/assets/img/${folder}/${type}`,
          imgBuffer,
          (err) => {
            if (err) {
              console.error(err);
            }
          }
        );
      } else {
        fs.writeFile(`public/assets/img/${type}`, imgBuffer, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = { getImage };
