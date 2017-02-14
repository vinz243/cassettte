import child_process from 'child_process';
import chalk from 'chalk';
import {findById as findLibraryById} from './Library';
import {
  assignFunctions,
  defaultFunctions,
  manyToOne,
  legacySupport,
  updateable,
  createable,
  removeable,
  databaseLoader,
  publicProps,
  findOneFactory,
  findFactory,
  findOrCreateFactory
} from './Model';
import {scan} from '../features/scanner/scanner';
import {
  mainStory
} from 'storyboard';

export const Scan = function(props) {
  if (typeof props === 'string') {
    props = {
      name: props
    };
  }
  let state = {
    name: 'scan',
    fields: ['statusCode', 'statusMessage', 'library', 'dryRun'],
    functions: {},
    populated: {},
    props
  };
  return assignFunctions(
    state.functions,
    defaultFunctions(state),
    updateable(state),
    createable(state),
    databaseLoader(state),
    publicProps(state),
    legacySupport(state), {
      startScan: () => {
        if (!state.props._id) {
          mainStory.warn('scanner', 'Scan wasn\'t created. Aborting');
          return;
        }
        try {
          scan(state.props._id).then(() => {
            mainStory.info('scanner', 'Scan finished without raising errors');
            state.functions.set('statusCode', 'DONE');
            state.functions.set('statusMessage', 'Scan finished without errors.');

            return;
          }).catch((err) => {
            mainStory.error('scanner', 'Scan failed with errors', {attach: err});
            state.functions.set('statusCode', 'FAILED');
            state.functions.set('statusMessage', 'Scan failed with errors. Please check the logs for more details...');
            state.functions.update().catch(err => {
              mainStory.fatal('scanner', 'Could not update scan', {attach: err});
            })
          });
        } catch (err) {
          mainStory.fatal('scanner', 'Scanner crashed unexpectedly.', {attach: err});

        }
      }
    }
  );
}

export const findOne = findOneFactory(Scan);

export const findById = (_id) => findOne({
  _id
});

export const find = findFactory(Scan, 'scan');
