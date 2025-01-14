import child_process from 'child_process';
import Library from './Library';
import Album from './Album';
import Artist from './Artist';
import Track from './Track';
import File from './File';
import Model from './Model';
import process from 'process';
import chalk from 'chalk';
import { mainStory } from 'storyboard';

export const processResult = async (res) => {
  if(res.status === 'done') {
    let data = res.data;
    for (let artistName of Object.keys(data)) {
      let artist = (await Artist.find({name: artistName}))[0];
      if (!artist) {
        artist = new Artist(artistName);
        await artist.create();
      }
      for (let albumName of Object.keys(data[artistName])) {
        let album = (await Album.find({name: albumName}))[0];
        if (!album) {
          album = new Album(albumName);
          album.data.artistId = artist.data._id;
          await album.create();
        }
        for (let t of data[artistName][albumName]) {
          let track = (await Track.find({name: t.trackTitle}))[0];
          if (!track) {
            track = new Track(t.trackTitle);
            track.data.artistId = artist.data._id;
            track.data.albumId = album.data._id;
            track.data.duration = t.duration;
            // console.log("ADDING TRACK", t.trackNumber);
            if(t.trackNumber) {
              track.data.trackNumber = (t.trackNumber + '').match(/^\d+/)[0] - 0;
            }
            await track.create();
          }
          let dup = await File.find({path: t.path});

          if (dup.length === 0){
            let file = new File({
              path: t.path,
              duration: t.duration, // TODO: Bitrate and everything
              bitrate: t.bitrate,
              artistId: artist.data._id,
              albumId: album.data._id,
              trackId: track.data._id
            });
            await file.create();
          }
        }
      }
    }
  }
}

let Scan = new Model('scan')
  .field('startDate')
    .int()
    .done()
  .field('dryRun')
    .defaultValue(false)
    .boolean()
    .done()
  .field('libraryId')
    .string()
    .required()
    .defaultParam()
    .done()
  .field('statusMessage')
    .string()
    .done()
  .field('statusCode')
    .string()
    .done()
  .implement('startScan', async function () {
    // console.log('start');
    this.data.statusCode = 'STARTED';
    this.data.statusMessage = 'Scan started...';
    let story = mainStory.child({
      src: 'libscan',
      title: 'Library scan',
      level: 'info'
    });
    story.debug('Running scan on `nextTick()`');
    process.nextTick(() => {
      if (this.data.dryRun) {
        this.data.statusCode = 'DONE';
        this.data.statusMessage = 'Scan was a dry run';
        story.warn(`${chalk.bold('dryRun')} flag was set`);
        story.close();
      } else {
        Library.findById(this.data.libraryId).then((dir) => {
          let child = child_process.fork(require.resolve('../scripts/music_scanner'));
          story.debug('Child process forked');

          story.debug(`${chalk.dim('Executing action ')} 'set_config'`, {
            dir: dir.data.path
          });

          child.send({
            action: 'set_config',
            data: {
              dir: dir.data.path
            }
          });
          story.debug(`${chalk.dim('Executing action ')} 'execute'`);
          child.send({action: 'execute'});

          child.on('message', (res) => {
            if (res.status === 'LOG') {
              story.info(res.msg);
              return;
            }
            processResult(res).then(() => {
              this.data.statusCode = 'DONE';
              this.data.statusMessage = 'Scan finished without errors';
              this.update();
              story.info('Scan finished !');
              story.close();
            }).catch((err) => {
              this.data.statusCode = 'FAILED';
              this.data.statusMessage = err;
              story.error('Scan errored', err);
              story.close();
            });
          });
        });


      }
    });
  }).done();
export default Scan;
