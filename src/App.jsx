import React from 'react';
import RootView from './router';
import {Provider} from 'react-redux';
import {store} from './stores';
import ToastProvider from './components/commom/Toast';
import MusicCtrlProvider from './components/music/MusicController';
import SocketProvider from './utils/socket';
import {RealmProvider} from '@realm/react';
import {
  ChatMsg,
  UsersInfo,
  MusicInfo,
  LocalMusic,
  LocalLyric,
} from './constants/realmModel';

import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('sk.eyJ1IjoiN3huM3VtbHQiLCJhIjoiY205M3Y3bzZuMG11NzJqcXozOTQ5YjB0YSJ9.fk8RU7RNlM0QDj9WUw-84A');

const App = () => {



  return (
    <Provider store={store}>
      <ToastProvider>
        <RealmProvider
          schema={[ChatMsg, UsersInfo, MusicInfo, LocalMusic, LocalLyric]}>
          <SocketProvider>
            <MusicCtrlProvider>
              <RootView />
            </MusicCtrlProvider>
          </SocketProvider>
        </RealmProvider>
      </ToastProvider>
    </Provider>
  );
};

export default App;
