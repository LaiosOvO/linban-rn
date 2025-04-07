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
  const [coordinates, setCoordinates] = useState([]);
  const [drawType, setDrawType] = useState(null);

  const [geoJson , setGeoJson] = useState({
    type: 'Feature',
    geometry: {
      type: '',
      coordinates: []  // 天安门位置
    },
    properties: {
      color: '#FF5722',  // 橙色
      lineWidth: 3,
      title: '天安门',
      description: '北京天安门广场'
    }
  });


  // 默认测试多边形数据
  const [savedFeatures, setSavedFeatures] = useState([
    {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-122.084, 37.421998533333335]  // 天安门位置
        },
        properties: {
          color: '#FF5722',  // 橙色
          lineWidth: 3,
          title: '天安门',
          description: '北京天安门广场'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [-122.084, 37.421998333333335],  // 起点 - 天安门
            [-122.084, 37.423998333333335]   // 终点 - 故宫附近
          ]
        },
        properties: {
          color: '#4CAF50',  // 绿色
          lineWidth: 4,
          title: '测试直线',
          description: '从天安门到故宫的测试直线'
        }
      },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-122.084, 37.421998333333335],  // 顶点1
          [-122.084, 37.4259981],  // 顶点2
          [-122.284, 37.424998233333335],  // 顶点3
          [-122.384, 37.423998433333335],  // 顶点4
          [-122.084, 37.421998333333335]   // 闭合多边形，回到顶点1
        ]]
      },
      properties: {
        color: '#FF0000',  // 红色
        lineWidth: 3,
        title: '测试多边形',
        description: '这是一个默认显示的测试多边形'
      }
    }
  ]);
  
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

        console.log(userLocation)
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
    console.log('获取到坐标 \n',coordinates);
    if (!coordinates || coordinates.length !== 2) return;
    if(drawingMode === 'polygon'){
        console.log('绘制多边形 \n',drawingPoints,coordinates);
        if(drawingPoints.length === 0){
            newPoints = [[[coordinates]]]
            setDrawingPoints(newPoints);
            geoJson.geometry.coordinates = [coordinates];
            setGeoJson(geoJson);
        } else {
            newPoints = drawingPoints[0][0];
            newPoints = [...newPoints, coordinates];
            newPoints.push(newPoints[0]);
            setDrawingPoints([[newPoints]]);
            geoJson.geometry.coordinates = [...geoJson.geometry.coordinates, coordinates];
            setGeoJson(geoJson);
        }
    } else {

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
    }
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
          centerCoordinate={userLocation || [116.404, 39.915]}  // 默认中心点设置为测试多边形的中心
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

        {/* 已保存标注 - 这里会显示默认的测试多边形 */}
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
          onToolSelect={(tool) => {
            console.log('绘制类型 \n',tool);
            geoJson.geometry.type = tool.type;
            setGeoJson(geoJson);
            setDrawingMode(tool.id)
          }}
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