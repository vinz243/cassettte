'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Album = require('./Album');

var _Album2 = _interopRequireDefault(_Album);

var _Track = require('./Track');

var _Track2 = _interopRequireDefault(_Track);

var _Model = require('./Model');

var _Model2 = _interopRequireDefault(_Model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// ARTIST SCHEMA:
//   _id: artistsid
//   name: artist name
//   coverArt: art id (not implemented)
//   genre: genre

var Artist = new _Model2.default('artist').field('name').defaultParam().required().string().done().field('genre').string().done().noDuplicates().oneToMany(_Album2.default, 'artistId').oneToMany(_Track2.default, 'artistId').done();

exports.default = Artist;