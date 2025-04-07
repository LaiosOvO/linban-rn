import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Button, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from 'react-native-ui-lib';
import { getLabelUserPage, saveLabelUser, updateLabelUser, deleteLabelUser } from '../api/linban/label';
// import {useToast} from './commom/Toast';
// import {useSelector, useDispatch} from 'react-redux';

// const {showToast} = useToast();


const DrawingTools = ({ visible, onClose, onToolSelect, onSave, currentTool, onClearMapData, savedFeatures, onSetSavedFeatures, OutSideCancelSelectDraw }) => {
  const [userLabel, setUserLabel] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const userInfo = { 
    id: 1,
   }
//   const userInfo = useSelector(state => {

//     console.log(state);
//     console.log(state.userStore);
//     return state.userStore.userInfo;
//   });
  if (!visible) return null;

  const tools = [
    { id: 'marker', name: '标记', icon: 'place' },
    { id: 'polyline', name: '折线', icon: 'timeline' },
    { id: 'polygon', name: '多边形', icon: 'crop-square' },
  ];

  const cancelSelectDraw = () => {
    console.log("取消绘图")
    OutSideCancelSelectDraw();
  }

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入标注名称');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim()
    });

    let data = {
        labelName: title.trim(),
        LabelRemark: description.trim(),
        dataJson: JSON.stringify(savedFeatures),
        userId: userInfo.id    
    }

    const res = saveLabelUser(data);
    if(res){
        if(res.code === 0 || res.code === 200){
            // showToast(res.message, 'error');
        }
    }

    setTitle('');
    setDescription('');
  };

  const clearMapData = () => {
    onClearMapData();
  };

  const dataList = async () => {
    let param = {
      page: 1,
      pageSize: 10,
      userId: userInfo.id
    }

    const res = await getLabelUserPage(param);
    console.log(res);
    setUserLabel(res.data.list);
    // showToast("获取数据成功", 'error');
    }

    const handleSelectGeoJson = (item) => {
        console.log(item)

    }


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>绘图工具</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>绘图模式</Text>
          <View style={styles.toolGrid}>
            {tools.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolButton,
                  currentTool === tool.id && styles.activeTool
                ]}
                onPress={() => onToolSelect(tool.id)}
              >
                <Icon
                  name={tool.icon}
                  size={24}
                  color={currentTool === tool.id ? 'white' : 'grey'}
                />
                <Text style={[
                  styles.toolLabel,
                  currentTool === tool.id && styles.activeLabel
                ]}>
                  {tool.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>标注信息</Text>
          <TextInput
            style={styles.input}
            placeholder="标注名称 *"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="备注信息"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4} // 调整行数以适应备注信息
          />
        </View>
      </ScrollView>

      {/* 显示保存的列表 */}
      <ScrollView style={styles.savedFeaturesList}>
        {userLabel.map((feature, index) => (
          <View key={index} style={styles.featureItem} onPress={(item) => handleSelectGeoJson(item)} >
            <Text>{feature.properties.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={clearMapData}
        >
          <Text style={styles.cancelButtonText}>清空地图</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 200,
    backgroundColor: 'white',
    padding: 16,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  scrollView: {
    flex: 1
  },
  content: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 12
  },
  toolGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  toolButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  activeTool: {
    backgroundColor: '#4285F4'
  },
  toolLabel: {
    marginTop: 4,
    fontSize: 12,
    color: 'grey'
  },
  activeLabel: {
    color: 'white'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  footer: {
    flex: 1,
    gap: 10
  },
  cancelButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: 'black',
  },
  saveButton: {
    padding: 12,
    backgroundColor: 'blue',
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500'
  },
  savedFeaturesList: {
    marginTop: 16
  },
  featureItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  }
});

export default DrawingTools;