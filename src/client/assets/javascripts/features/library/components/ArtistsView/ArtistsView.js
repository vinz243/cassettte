import React, { Component, PropTypes } from 'react';
import './ArtistsView.scss';
import uniqBy from 'lodash/uniqBy';
import chunk from 'lodash/chunk';
import {Flex, Box} from 'reflexbox';
import classnames from 'classnames';
import { browserHistory } from 'react-router';
import LoaderProxy from '../LoaderProxy';
import ImageCard from '../ImageCard';

export default class ArtistsView extends Component {
  componentDidMount() {
    const { library, actions } = this.props;
    actions.loadContent({scope: 'ARTISTS'});

  }
  componentWillReceiveProps(nextProps) {
    const { library, actions } = this.props;
    if (nextProps.location && nextProps.location.key !== this.props.location.key) {
      actions.loadContent({scope: 'ARTISTS'});
    }
  }
  render() {
    const COLUMNS = 12;
    let artists = chunk(this.props.library.items.artists,
      COLUMNS).map((arr, index) => {
        let arts = arr.map((artist) => (
          <Box col={Math.floor(12 / COLUMNS)} className="artistCard" key={artist.id}>
            <ImageCard link={`/app/library/artists/${artist._id}/albums`}
              title={artist.name} image={
                  `/api/v2/artists/${artist._id}/artwork?size=120`
                } />
          </Box>
        ));
        return <Flex key={`artist-row-${index}`}>
          {arts}
        </Flex>
      });

    return <LoaderProxy {...this.props}>
      <div className="artistsView">{artists}</div>
    </LoaderProxy>
  }
}
