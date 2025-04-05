import React from 'react';
import { SafeAreaView } from 'react-native';
import Mapbox from '@rnmapbox/maps';

const MapScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Mapbox.MapView style={{ flex: 1 }}>
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={[116.397428, 39.90923]} // 北京坐标
        />
        <Mapbox.PointAnnotation
          id="marker"
          coordinate={[116.397428, 39.90923]}
        />
      </Mapbox.MapView>
    </SafeAreaView>
  );
};

export default MapScreen;