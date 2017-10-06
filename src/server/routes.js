const albumsController = require("./controllers/albums");
const artistsController = require("./controllers/artists");
// const configController = require("./controllers/config");
const librariesController = require("./controllers/libraries");
const tracksController = require("./controllers/tracks");
const scansController = require("./controllers/scans");
// const filesController = require("./controllers/files");
const features = require("./features");
const assets = require("./assets");
// const jobController = require("./controllers/job");

let routes = {};

Object.assign(routes,
  artistsController,
  albumsController,
  tracksController,
  librariesController,
  scansController);

Object.assign(routes, features, assets)

module.exports = function (router) {
  for(let route in routes) {
    for(let verb in routes[route]) {
      router[verb](route, routes[route][verb]);
    }
  }
}
