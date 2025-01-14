'use strict';
const assert = require('assert');
const scanpel = require('scanpel');
const Mediastic = require('mediastic');

let mediastic = Mediastic();
let config = {};

const execute = function (data) {
	assert(data.action === 'execute');
	assert(config && config.dir);

  const log = function (msg) {
    process.send({
      status: 'LOG',
      msg
    });
  };

  mediastic.use((metadata, next) => {
    log('Working on '+ metadata.path);
    next();
  });

  mediastic.use(Mediastic.tagParser());
  mediastic.use(Mediastic.fileNameParser());

  // mediastic.use(Mediastic.spotifyApi({
  //   albumKeywordBlacklist: /deluxe|renditions|explicit|edited|performs/i,
  //   durationTreshold: 5
  // }));

  mediastic.use((metadata, next) => {
    log('Done ' + metadata.path);
    next();
  });

	let res = scanpel(config.dir, mediastic).then((res) => {
		process.send({
			status: 'done',
			data: res
		});
	});

};

const setConfig = function (data) {
	config = data.data;
};


process.on('message', function (data) {
	if (data.action === 'execute') {
		execute(data);
	} else if (data.action === 'set_config') {
		setConfig(data);
	}
});
