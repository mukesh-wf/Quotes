
 

const path = require("path");

module.exports = {
  entry: "./extensions/quote-extension/assets/buttons.js",
  output: {
    filename: "bundle-button.js",
    path: path.resolve(__dirname, "./extensions/quote-extension/assets"),
  },
};