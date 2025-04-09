import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Alert, TextInput, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from '../components/BottomNavBar';
import DrawingTools from '../components/DrawingTools';
import CommandCenter from '../components/CommandCenter';
import AnnotationManager from '../components/AnnotationManager';
import { getLabelUserPage, saveLabelUser,deleteLabelUser } from '../api/linban/label/index'

Mapbox.setAccessToken('sk.eyJ1IjoiN3huM3VtbHQiLCJhIjoiY205M3Y3bzZuMG11NzJqcXozOTQ5YjB0YSJ9.fk8RU7RNlM0QDj9WUw-84A');

const MapboxTest = () => {
    const navigation = useNavigation();
    const [userLocation, setUserLocation] = useState(null);
    const [showAnnotationManager, setShowAnnotationManager] = useState(false);
    const [showDrawingTools, setShowDrawingTools] = useState(false);
    const [showCommandCenter, setShowCommandCenter] = useState(false);
    const [drawingMode, setDrawingMode] = useState(null);
    const [activeGeoJson, setActiveGeoJson] = useState(null);
    const [savedGeoJsons, setSavedGeoJsons] = useState([
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-122.084, 37.421998533333335] },
            properties: { color: '#FF5722', lineWidth: 3, title: '默认点', description: '默认点标记' }
        },
        {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[-122.084, 37.421998333333335], [-122.084, 37.423998333333335]] },
            properties: { color: '#4CAF50', lineWidth: 4, title: '默认线', description: '默认线段' }
        },
        {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[[-122.084, 37.421998333333335], [-122.084, 37.4259981], [-122.284, 37.424998233333335], [-122.384, 37.423998433333335], [-122.084, 37.421998333333335]]] },
            properties: { color: '#FF0000', lineWidth: 3, title: '默认多边形', description: '默认多边形区域' }
        }
    ]);
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

    const handleSaveDrawing = async (drawingInfo) => {
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

        let data = {
            labelName: drawingInfo.title.trim(),
            labelRemark: drawingInfo.description .trim(),
            dataJson: finalizedGeoJson,
            userId: 1
        }
        console.log("*************************************************");
        console.log("data \n ",data);
        console.log("*************************************************");

        let res = saveLabelUser(data);
        console.log("res \n ",res);
    
        await setSavedGeoJsons(prev => [...prev, finalizedGeoJson]);
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
        if(activeGeoJson?.geometry?.coordinates[0]?.length === 0){
            return ;
        }

        if(activeGeoJson?.geometry?.type==="Polygon") {

            if(activeGeoJson?.geometry?.coordinates[0]?.[0]?.length > 0){
                if(activeGeoJson?.geometry?.coordinates[0]?.length > 0){
                    if(activeGeoJson?.geometry?.coordinates[0]?.length > 3 ) {
                        features.push(activeGeoJson);
                    }
                }
            }
        } else {
            if(activeGeoJson?.geometry?.type === "LineString"){
                if (activeGeoJson?.geometry?.coordinates?.length > 1) {

                    features.push(activeGeoJson);

                }
            } else {
                if (activeGeoJson?.geometry?.coordinates?.length > 0) {
                    features.push(activeGeoJson);
                }
            }

        }

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

    const handleSearchPress = () => {
        navigation.navigate('History');
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

            <View style={styles.searchContainer}>
                <TouchableOpacity style={styles.searchBox} onPress={handleSearchPress} activeOpacity={0.7}>
                    <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
                    <View style={styles.searchInput}>
                        <TextInput
                            placeholder="搜索林班、标记"
                            placeholderTextColor="#888"
                            editable={false}
                            style={styles.searchText}
                        />
                    </View>
                </TouchableOpacity>
            </View>

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
    searchContainer: {
        position: 'absolute',
        top: 50,
        left: 15,
        right: 15,
        zIndex: 1,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
    },
    searchText: {
        fontSize: 15,
        color: '#333',
        padding: 0,
    },
});

export default MapboxTest;    