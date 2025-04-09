import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // 导入 Icon

const DetailScreen = () => {
  const route = useRoute();
  const { item } = route.params; // 从路由参数获取传递过来的卡片数据

  // 模拟 Tab 状态
  const [activeTab, setActiveTab] = useState('基础信息');
  const tabs = ['基础信息', '关联航拍图', '作业人员', '历史记录'];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Tab 切换 */}
        <View style={styles.tabContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 根据 activeTab 显示不同内容 */}
        {activeTab === '基础信息' && (
          <View style={styles.contentContainer}>
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoTitle}>{item?.name || '林班号: 加载中...'}</Text>
                <View style={[styles.statusTag, {backgroundColor: '#e0f2f7' /* 示例颜色 */}]}>
                   <Text style={[styles.statusTagText, {color: '#007bff'}]}>正常</Text>
                </View>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>林班面积</Text>
                  <Text style={styles.infoValue}>234.5 公顷</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>优势树种</Text>
                  <Text style={styles.infoValue}>云南松</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>林龄</Text>
                  <Text style={styles.infoValue}>20-25年</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>郁闭度</Text>
                  <Text style={styles.infoValue}>0.7</Text>
                </View>
              </View>
            </View>

            <View style={styles.locationCard}>
               <Text style={styles.locationTitle}>地理位置</Text>
               <View style={styles.locationRow}>
                 <Icon name="location-pin" size={18} color="#007bff" style={styles.locationIcon}/>
                 <Text style={styles.locationText}>云南省昆明市西山区梁王山林场</Text>
               </View>
               <Text style={styles.coordText}>经度: 102.123° 纬度: 25.456°</Text>
            </View>

          </View>
        )}

        {activeTab !== '基础信息' && (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderText}>{activeTab} 内容待添加</Text>
          </View>
        )}

      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.bottomActionContainer}>
         <TouchableOpacity style={[styles.bottomActionButton, styles.editButton]}>
            <Icon name="edit" size={18} color="#007bff" style={styles.buttonIcon}/>
            <Text style={styles.editButtonText}>编辑信息</Text>
         </TouchableOpacity>
         <TouchableOpacity style={[styles.bottomActionButton, styles.taskButton]}>
             <Icon name="list-alt" size={18} color="#fff" style={styles.buttonIcon}/>
            <Text style={styles.taskButtonText}>林班任务</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // 浅灰色背景
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 10, // 增加水平内边距
    marginRight: 10, // 增加按钮间距
    borderBottomWidth: 2,
    borderBottomColor: 'transparent', // 默认无下划线
  },
  activeTabButton: {
    borderBottomColor: '#007bff', // 激活状态下划线颜色
  },
  tabText: {
    fontSize: 15,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff', // 激活状态文字颜色
    fontWeight: '500',
  },
  contentContainer: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
   infoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
   },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1, // 允许标题换行
    marginRight: 10,
  },
   statusTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  statusTagText: {
      fontSize: 12,
      fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // 允许换行
  },
  infoItem: {
    width: '50%', // 每行两项
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
  },
   locationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
   locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
   },
   locationIcon: {
      marginRight: 6,
   },
   locationText: {
      fontSize: 14,
      color: '#555',
   },
   coordText: {
      fontSize: 13,
      color: '#777',
      marginLeft: 24, // 对齐位置文字
   },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#aaa',
  },
   bottomActionContainer: {
      flexDirection: 'row',
      padding: 15,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#eee',
   },
   bottomActionButton: {
      flex: 1,
      flexDirection: 'row', // 图标和文字同行
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 5,
   },
   editButton: {
      backgroundColor: '#e7f3ff', // 浅蓝色背景
      borderWidth: 1,
      borderColor: '#007bff',
   },
   taskButton: {
      backgroundColor: '#007bff', // 主题蓝色
   },
   buttonIcon: {
      marginRight: 6,
   },
   editButtonText: {
      color: '#007bff',
      fontSize: 15,
      fontWeight: '500',
   },
   taskButtonText: {
      color: 'white',
      fontSize: 15,
      fontWeight: '500',
   }
});

export default DetailScreen; 