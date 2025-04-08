import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import BottomNavBar from '../components/BottomNavBar';
import DrawingTools from '../components/DrawingTools';
import CommandCenter from '../components/CommandCenter';
import AnnotationManager from '../components/AnnotationManager';

Mapbox.setAccessToken('sk.eyJ1IjoiN3huM3VtbHQiLCJhIjoiY205M3Y3bzZuMG11NzJqcXozOTQ5YjB0YSJ9.fk8RU7RNlM0QDj9WUw-84A');

const MapboxTest = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [showAnnotationManager, setShowAnnotationManager] = useState(false);
    const [showDrawingTools, setShowDrawingTools] = useState(false);
    const [showCommandCenter, setShowCommandCenter] = useState(false);
    const [drawingMode, setDrawingMode] = useState(null);
    const [activeGeoJson, setActiveGeoJson] = useState(null);
    const [savedGeoJsons, setSavedGeoJsons] = useState([]);

    const [drawingStyle, setDrawingStyle] = useState({
        color: '#4285F4',
        lineWidth: 3
    });

    const mapRef = useRef(null);

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                setUserLocation([longitude, latitude]);
            },
            (error) => {
                console.log('获取位置失败:', error);
                Alert.alert('定位失败', '无法获取您的位置，请检查定位权限或网络设置。');
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                const auth = await Geolocation.requestAuthorization('whenInUse');
                if (auth === 'granted') {
                    getCurrentLocation();
                } else {
                    Alert.alert('权限拒绝', '您拒绝了定位权限，可能无法正常使用地图功能。');
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
                } else {
                    Alert.alert('权限拒绝', '您拒绝了定位权限，可能无法正常使用地图功能。');
                }
            }
        } catch (err) {
            console.warn('请求位置权限失败:', err);
            Alert.alert('权限请求失败', '在请求定位权限时出现错误，请稍后重试。');
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const handleToolSelect = (tool) => {
        setDrawingMode(tool.id);
        const newActiveGeoJson = {
            type: 'Feature',
            geometry: {
                type: tool.type,
                coordinates: tool.type === 'Polygon' ? [[]] : []
            },
            properties: {
                ...drawingStyle,
                title: '新图形',
                description: '绘制中...'
            }
        };
        setActiveGeoJson(newActiveGeoJson);
        console.log(tool);
        console.log(newActiveGeoJson);
    };

    const handleMapPress = (event) => {
        if (!drawingMode || !activeGeoJson) return;

        const coords = event.geometry.coordinates;
        const newGeoJson = JSON.parse(JSON.stringify(activeGeoJson));

        try {
            switch (newGeoJson.geometry.type) {
                case 'Point':
                    newGeoJson.geometry.coordinates = coords;
                    break;
                case 'LineString':
                    newGeoJson.geometry.coordinates = [
                        ...(newGeoJson.geometry.coordinates || []),
                        coords
                    ];
                    break;
                case 'Polygon':
                    if (!newGeoJson.geometry.coordinates[0]) {
                        newGeoJson.geometry.coordinates[0] = [];
                    }
                    newGeoJson.geometry.coordinates[0] = [
                        ...(newGeoJson.geometry.coordinates[0] || []),
                        coords
                    ];
                    break;
            }
            setActiveGeoJson(newGeoJson);
        } catch (error) {
            console.error('处理坐标时出错:', error);
            Alert.alert('绘图错误', '在处理绘图坐标时出现错误，请稍后重试。');
        }
    };

    const handleSaveDrawing = (drawingInfo) => {
        if (!activeGeoJson) return;

        const geometryType = activeGeoJson.geometry.type;
        let currentPoints = 0;

        if (geometryType === 'Polygon') {
            currentPoints = activeGeoJson.geometry.coordinates[0]?.length || 0;
        } else {
            currentPoints = activeGeoJson.geometry.coordinates?.length || 0;
        }

        const minPoints = {
            Point: 1,
            LineString: 2,
            Polygon: 3
        }[geometryType];

        if (currentPoints < minPoints) {
            Alert.alert('提示', `${geometryType}需要至少${minPoints}个点`);
            return;
        }

        const finalizedGeoJson = JSON.parse(JSON.stringify(activeGeoJson));
        if (geometryType === 'Polygon') {
            const firstPoint = finalizedGeoJson.geometry.coordinates[0][0];
            finalizedGeoJson.geometry.coordinates[0].push(firstPoint);
        }

        finalizedGeoJson.properties = {
            ...finalizedGeoJson.properties,
            title: drawingInfo.title || `未命名${geometryType}`,
            description: drawingInfo.description || '无描述'
        };

        setSavedGeoJsons(prev => [...prev, finalizedGeoJson]);
        setActiveGeoJson(null);
        setDrawingMode(null);
    };

    const handleCancelDrawing = () => {
        setActiveGeoJson(null);
        setDrawingMode(null);
    };

    const clearMapData = () => {
        setSavedGeoJsons([]);
        setActiveGeoJson(null);
        setDrawingMode(null);
    };

    const renderFeatures = () => {
        const features = [...savedGeoJsons];

        console.log("activeGeoJson \n ",activeGeoJson);
        console.log("activeGeoJson?.geometry?.coordinates.length \n ",activeGeoJson?.geometry?.coordinates.length);
        if(activeGeoJson?.geometry?.type==="Polygon") {
            // console.log("activeGeoJson",activeGeoJson);
            if(activeGeoJson?.geometry?.coordinates[0]?.[0].length > 0){
                if(activeGeoJson?.geometry?.coordinates[0]?.length > 0){
                    if(activeGeoJson?.geometry?.coordinates[0]?.length >= 3 ) {
                        features.push(activeGeoJson);
                    }
                }
            }
        } else {
            if (activeGeoJson?.geometry?.coordinates?.length > 0) {
                features.push(activeGeoJson);
            }
        }


        // console.log("*************************************************");
        // console.log("features \n ",features);
        // console.log("*************************************************");

        return (
            <Mapbox.ShapeSource
                id="main-source"
                shape={{ type: 'FeatureCollection', features }}
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
                    id="polygons-fill"
                    filter={['==', ['geometry-type'], 'Polygon']}
                    style={{ fillColor: ['get', 'color'], fillOpacity: 0.3 }}
                />
                <Mapbox.LineLayer
                    id="polygons-stroke"
                    filter={['==', ['geometry-type'], 'Polygon']}
                    style={{ lineColor: ['get', 'color'], lineWidth: ['get', 'lineWidth'] }}
                />
            </Mapbox.ShapeSource>
        );
    };

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

    useEffect(() => {
        console.log("activeGeoJson \n ", activeGeoJson);
    }, [activeGeoJson]);

    return (
        <View style={styles.container}>
            <Mapbox.MapView
                ref={mapRef}
                style={styles.map}
                onPress={handleMapPress}
            >
                <Mapbox.Camera
                    zoomLevel={14}
                    centerCoordinate={userLocation || [-122.084, 37.421998333333335]}
                />

                {userLocation && (
                    <Mapbox.PointAnnotation
                        id="userLocation"
                        coordinate={userLocation}
                    >
                        <View style={styles.userLocationMarker} />
                    </Mapbox.PointAnnotation>
                )}

                {renderFeatures()}
            </Mapbox.MapView>

            {showAnnotationManager && (
                <AnnotationManager
                    onClose={() => setShowAnnotationManager(false)}
                    features={savedGeoJsons}
                />
            )}

            {showDrawingTools && (
                <DrawingTools
                    visible={showDrawingTools}
                    onClose={() => setShowDrawingTools(false)}
                    onToolSelect={handleToolSelect}
                    currentTool={drawingMode}
                    onSave={handleSaveDrawing}
                    onCancel={handleCancelDrawing}
                    onClearMapData={clearMapData}
                    savedFeatures={savedGeoJsons}
                    onSetSavedFeatures={setSavedGeoJsons}
                />
            )}

            {showCommandCenter && (
                <CommandCenter onClose={() => setShowCommandCenter(false)} />
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