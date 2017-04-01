import { createStructuredSelector } from 'reselect';
import assign  from 'lodash/assign';
import axios from 'axios';

const SEARCH_ARTISTS  = 'cassette/store/SEARCH_ARTISTS';
const SEARCH_ALBUMS   = 'cassette/store/SEARCH_ALBUMS';
const OPEN_ARTIST     = 'cassette/store/OPEN_ARTIST';
const OPEN_ALBUM      = 'cassette/store/OPEN_ALBUM';
const DOWNLOAD_ALBUM  = 'cassette/store/DOWNLOAD_ALBUM';
const SELECT_ARTIST   = 'cassette/store/SELECT_ARTIST';


const initialState = {
  artists: [],
  albums: [],
  selectedArtist: '',
  artist: {
    id: '',
    name: '',
    albums: []
  },
  album: {
    id: '',
    name: '',
    tracks: []
  }
}

export const NAME = 'store';

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SEARCH_ARTISTS:
      return Object.assign({}, state, {
        artists: action.data,
        selectedArtist: ''
      });
    case SEARCH_ALBUMS:
      return Object.assign({}, state, {
        albums: action.data
      });
    case OPEN_ARTIST:
      return Object.assign({}, state, {
        albums: action.data
      });
    case OPEN_ALBUM:
      return Object.assign({}, state, {
        artists: [],
        albums: [],
        album: action.data
      });
    case SELECT_ARTIST:
      return Object.assign({}, state, {
        selectedArtist: action.mbid
      });
  }
  return state;
}

const store = (state) => state[NAME];

export const selector = createStructuredSelector({
  store
});

function searchArtists (query) {
  return axios.post('/api/v2/store/artists/searches', {
    query, limit: 10
  }).then(res => {
    return {
      data: res.data,
      type: SEARCH_ARTISTS
    }
  })
}
function searchAlbums (query) {
  return axios.post('/api/v2/store/release-groups/searches', {
    query, limit: 10
  }).then(res => {
    return {
      data: res.data,
      type: SEARCH_ALBUMS
    }
  })
}
function openArtist (id) {
  return axios.get(`/api/v2/store/artists/${id}/release-groups`).then((res) => {
    return {
      data: res.data,
      type: OPEN_ARTIST
    }
  })
}
function selectArtist (mbid) {
  return {
    type: SELECT_ARTIST,
    mbid
  }
}

export const actionCreators = {
  searchArtists, selectArtist, searchAlbums, openArtist
}
