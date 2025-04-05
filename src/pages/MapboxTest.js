import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Colors } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 设置 Mapbox token
Mapbox.setAccessToken('sk.eyJ1IjoiN3huM3VtbHQiLCJhIjoiY205M3Y3bzZuMG11NzJqcXozOTQ5YjB0YSJ9.fk8RU7RNlM0QDj9WUw-84A');

const MODES = {
  DEFAULT: 'default',
  ANNOTATIONS: 'annotations',
  DRAWING: 'drawing',
  COMMAND_CENTER: 'commandCenter'
};

const MapboxTest = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentMode, setCurrentMode] = useState(MODES.DEFAULT);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({
    total: 0,
    forestry: [],
    patrol: [],
    harvest: []
  });
  const mapRef = useRef(null);

  // 获取当前位置
  useEffect(() => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }
    
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation([position.coords.longitude, position.coords.latitude]);
      },
      error => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  // 加载保存的标注
  useEffect(() => {
    loadAnnotations();
  }, []);

  // 模拟获取在线用户数据
  useEffect(() => {
    if (currentMode === MODES.COMMAND_CENTER) {
      fetchOnlineUsers();
    }
  }, [currentMode]);

  const loadAnnotations = async () => {
    try {
      const savedAnnotations = await AsyncStorage.getItem('annotations');
      if (savedAnnotations) {
        setAnnotations(JSON.parse(savedAnnotations));
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
    }
  };

  const saveAnnotation = async (newAnnotation) => {
    try {
      const updatedAnnotations = [...annotations, newAnnotation];
      await AsyncStorage.setItem('annotations', JSON.stringify(updatedAnnotations));
      setAnnotations(updatedAnnotations);
    } catch (error) {
      console.error('Error saving annotation:', error);
    }
  };

  // 模拟获取在线用户数据
  const fetchOnlineUsers = async () => {
    // 这里应该是实际的API调用
    const mockData = {
      total: 42,
      forestry: [
        { id: 1, name: '张建国', status: 'online' },
        // ... 更多用户
      ],
      patrol: [
        { id: 2, name: '李明', status: 'online' },
        // ... 更多用户
      ],
      harvest: [
        { id: 3, name: '王五', status: 'online' },
        // ... 更多用户
      ]
    };
    setOnlineUsers(mockData);
  };

  const renderAnnotationManagement = () => {
    if (currentMode !== MODES.ANNOTATIONS) return null;
    return (
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>标注管理</Text>
        <View style={styles.annotationList}>
          {annotations.map((annotation, index) => (
            <View key={index} style={styles.annotationItem}>
              <Text>{annotation.title}</Text>
              <Text>{new Date(annotation.timestamp).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDrawingTools = () => {
    if (currentMode !== MODES.DRAWING) return null;
    return (
      <View style={styles.drawingTools}>
        <Text style={styles.toolsTitle}>绘图工具</Text>
        {/* 绘图工具UI */}
      </View>
    );
  };

  const renderCommandCenter = () => {
    if (currentMode !== MODES.COMMAND_CENTER) return null;
    return (
      <View style={styles.commandCenter}>
        <View style={styles.onlineStats}>
          <Text style={styles.statsTitle}>在线人数: {onlineUsers.total}/50</Text>
          <View style={styles.teamStats}>
            <Text>造林组: {onlineUsers.forestry.length}人</Text>
            <Text>巡护组: {onlineUsers.patrol.length}人</Text>
            <Text>采伐组: {onlineUsers.harvest.length}人</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}>
        <Mapbox.Camera
          zoomLevel={14}
          centerCoordinate={currentLocation || [121.4737, 31.2304]}
        />
        {currentLocation && (
          <Mapbox.PointAnnotation
            id="userLocation"
            coordinate={currentLocation}
          />
        )}
        {/* 渲染标注和绘制的内容 */}
      </Mapbox.MapView>

      {renderAnnotationManagement()}
      {renderDrawingTools()}
      {renderCommandCenter()}

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentMode(MODES.DEFAULT)}>
          <Icon name="map" size={24} color={currentMode === MODES.DEFAULT ? Colors.primary : Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentMode(MODES.ANNOTATIONS)}>
          <Icon name="bookmark" size={24} color={currentMode === MODES.ANNOTATIONS ? Colors.primary : Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentMode(MODES.DRAWING)}>
          <Icon name="edit" size={24} color={currentMode === MODES.DRAWING ? Colors.primary : Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setCurrentMode(MODES.COMMAND_CENTER)}>
          <Icon name="dashboard" size={24} color={currentMode === MODES.COMMAND_CENTER ? Colors.primary : Colors.black} />
        </TouchableOpacity>
      </View>
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.grey60,
  },
  navButton: {
    padding: 10,
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: Colors.white,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  annotationList: {
    flex: 1,
  },
  annotationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
  drawingTools: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  commandCenter: {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  onlineStats: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  teamStats: {
    marginTop: 8,
  },
});

export default MapboxTest; 