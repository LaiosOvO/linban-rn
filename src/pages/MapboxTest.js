import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Alert, Text, TouchableOpacity, FlatList } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import BottomNavBar from '../components/BottomNavBar';
import DrawingTools from '../components/DrawingTools';
import CommandCenter from '../components/CommandCenter';
import { Colors } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnnotationManager from '../components/AnnotationManager';

Mapbox.setAccessToken('sk.eyJ1IjoiN3huM3VtbHQiLCJhIjoiY205M3Y3bzZuMG11NzJqcXozOTQ5YjB0YSJ9.fk8RU7RNlM0QDj9WUw-84A');

const MapboxTest = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [showAnnotationManager, setShowAnnotationManager] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawingPoints, setDrawingPoints] = useState([]);

  const [savedFeatures, setSavedFeatures] = useState([]);
  const [geoJson, setGeoJson] = useState({});
  
  const [drawingStyle, setDrawingStyle] = useState({
    color: '#4285F4',
    lineWidth: 3
  });
  const mapRef = useRef(null);

  // 获取定位权限
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
      },
      (error) => console.log('获取位置失败:', error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          getCurrentLocation();
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "位置信息权限",
            message: "需要获取您的位置信息",
            buttonNeutral: "稍后询问",
            buttonNegative: "取消",
            buttonPositive: "确定"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      }
    } catch (err) {
      console.warn('请求位置权限失败:', err);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // 处理地图点击事件
  const handleMapPress = (event) => {
    if (!drawingMode) return;

    const coordinates = event.geometry.coordinates;
    if (!coordinates || coordinates.length !== 2) return;

    setDrawingPoints(prev => {
      const newPoints = [...prev, coordinates];
      // 实时绘制逻辑
      if (drawingMode === 'polyline' && newPoints.length >= 2) {
        console.log('绘制折线坐标:', newPoints);
      } else if (drawingMode === 'polygon' && newPoints.length >= 3) {
        console.log('绘制多边形坐标:', newPoints);
      }
      return newPoints;
    });
  };

  // 保存绘图数据
  const handleSaveDrawing = (drawingInfo) => {
    if ((drawingMode === 'polyline' && drawingPoints.length < 2) ||
        (drawingMode === 'polygon' && drawingPoints.length < 3)) {
      Alert.alert('提示', drawingMode === 'polyline' ? '折线至少需要2个点' : '多边形至少需要3个点');
      return;
    }

    let geometry;
    switch (drawingMode) {
      case 'marker':
        geometry = {
          type: 'Point',
          coordinates: drawingPoints[0]
        };
        break;
      case 'polyline':
      case 'polygon':
        geometry = {
          type: drawingMode === 'polyline' ? 'LineString' : 'Polygon',
          coordinates: drawingMode === 'polyline' ? drawingPoints : [drawingPoints.concat(drawingPoints[0])]
        };
        break;
      default:
        return;
    }

    const newFeature = {
      type: 'Feature',
      geometry,
      properties: {
        ...drawingStyle,
        title: drawingInfo.title,
        description: drawingInfo.description
      }
    };

    setSavedFeatures(prev => [...prev, newFeature]);
    setDrawingPoints([]);
    setDrawingMode(null);
    setShowDrawingTools(false);
  };

  // 取消绘图
  const handleCancelDrawing = () => {
    setDrawingPoints([]);
    setDrawingMode(null);
    setShowDrawingTools(false);
  };

  // 清空地图数据
  const clearMapData = () => {
    setDrawingPoints([]);
    setDrawingMode(null);
    setSavedFeatures([]);
  };

  // 处理底部栏按钮点击
  const handleBottomBarPress = (buttonType) => {
    switch (buttonType) {
      case 'layers':
        setShowAnnotationManager(true);
        setShowDrawingTools(false);
        setShowCommandCenter(false);
        break;
      case 'location':
        setShowDrawingTools(true);
        setShowAnnotationManager(false);
        setShowCommandCenter(false);
        break;
      case 'draw':
        setShowDrawingTools(true);
        setShowAnnotationManager(false);
        setShowCommandCenter(false);
        break;
      case 'command':
        setShowCommandCenter(true);
        setShowAnnotationManager(false);
        setShowDrawingTools(false);
        break;
      default:
        break;
    }
  };

  // 处理关闭侧边栏
  const handleClosePanel = () => {
    setShowAnnotationManager(false);
    setShowDrawingTools(false);
    setShowCommandCenter(false);
    setDrawingMode(null);
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={userLocation || [116.40, 39.90]}
        />

        {/* 用户位置标记 */}
        {userLocation && (
          <Mapbox.PointAnnotation
            id="userLocation"
            coordinate={userLocation}
          >
            <View style={styles.userLocationMarker} />
          </Mapbox.PointAnnotation>
        )}

        {/* 实时绘制图形 */}
        {drawingMode === 'marker' && drawingPoints.length > 0 && (
          <Mapbox.ShapeSource
            id="point-source"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: drawingPoints[0]
              }
            }}
          >
            <Mapbox.CircleLayer
              id="point-layer"
              style={{ circleRadius: 8, circleColor: drawingStyle.color }}
            />
          </Mapbox.ShapeSource>
        )}

        {(drawingMode === 'polyline' || drawingMode === 'polygon') && drawingPoints.length >= 2 && (
          <Mapbox.ShapeSource
            id="line-source"
            shape={{
              type: 'Feature',
              geometry: {
                type: drawingMode === 'polyline' ? 'LineString' : 'Polygon',
                coordinates: drawingMode === 'polyline' ? drawingPoints : [drawingPoints.concat(drawingPoints[0])]
              }
            }}
          >
            {drawingMode === 'polygon' && (
              <Mapbox.FillLayer
                id="polygon-fill"
                style={{ fillColor: drawingStyle.color, fillOpacity: 0.3 }}
              />
            )}
            <Mapbox.LineLayer
              id="line-layer"
              style={{ lineColor: drawingStyle.color, lineWidth: drawingStyle.lineWidth }}
            />
          </Mapbox.ShapeSource>
        )}

        {/* 已保存标注 */}
        <Mapbox.ShapeSource
          id="saved-features"
          shape={{ type: 'FeatureCollection', features: savedFeatures }}
        >
          <Mapbox.CircleLayer
            id="points"
            filter={['==', ['geometry-type'], 'Point']}
            style={{ circleRadius: 8, circleColor: ['get', 'color'] }}
          />
          <Mapbox.LineLayer
            id="lines"
            filter={['==', ['geometry-type'], 'LineString']}
            style={{ lineColor: ['get', 'color'], lineWidth: ['get', 'lineWidth'] }}
          />
          <Mapbox.FillLayer
            id="polygons"
            filter={['==', ['geometry-type'], 'Polygon']}
            style={{ fillColor: ['get', 'color'], fillOpacity: 0.3 }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>

      {showAnnotationManager && (
        <AnnotationManager onClose={handleClosePanel} />
      )}

      {showDrawingTools && (
        <DrawingTools
          visible={showDrawingTools}
          onClose={handleClosePanel}
          onToolSelect={(tool) => setDrawingMode(tool)}
          currentTool={drawingMode}
          onSave={handleSaveDrawing}
          onClearMapData={clearMapData}
          savedFeatures={savedFeatures}
          onSetSavedFeatures={setSavedFeatures}
        />
      )}

      {showCommandCenter && (
        <CommandCenter onClose={handleClosePanel} />
      )}

      <BottomNavBar
        onLayersPress={() => handleBottomBarPress('layers')}
        onLocationPress={() => handleBottomBarPress('location')}
        onDrawPress={() => handleBottomBarPress('draw')}
        onCommandPress={() => handleBottomBarPress('command')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default MapboxTest;