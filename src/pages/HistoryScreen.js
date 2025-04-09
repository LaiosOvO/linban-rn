import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // 导入 Icon

// 模拟数据，您应该从 API 或状态管理获取实际数据
const mockData = [
  { id: '1', name: '林班号: XC-2023-001', date: '2023-06-15', size: '256MB', status: '已关联', statusColor: '#4CAF50', image: require('../assets/mock/forest1.png') }, // 确保图片路径正确
  { id: '2', name: '林班号: XC-2023-002', date: '2023-06-14', size: '312MB', status: '待校验', statusColor: '#FFC107', image: require('../assets/mock/forest2.png') }, // 确保图片路径正确
  { id: '3', name: '林班号: XC-2023-003', date: '2023-06-13', size: '189MB', status: '已关联', statusColor: '#4CAF50', image: require('../assets/mock/forest3.png') }, // 确保图片路径正确
  { id: '4', name: '林班号: XC-2023-004', date: '2023-06-12', size: '276MB', status: '校验失败', statusColor: '#F44336', image: require('../assets/mock/forest4.png') }, // 确保图片路径正确
];

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState(mockData);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const newData = mockData.filter(item => {
        const itemData = item.name.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(mockData);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detail', { item })} // 导航到详情页并传递数据
      activeOpacity={0.8}
    >
      <Image source={item.image} style={styles.cardImage} />
      <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.date} 上传</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardSize}>{item.size}</Text>
          <TouchableOpacity>
            <Icon name="more-horiz" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索林班号、标记"
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={handleSearch}
        />
        <Icon name="filter-list" size={24} color="#555" style={styles.filterIcon} />
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2} // 每行两列
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={[styles.bottomButton, styles.exportButton]}>
          <Text style={styles.exportButtonText}>批量导出</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.deleteButton]}>
          <Text style={styles.deleteButtonText}>批量删除</Text>
        </TouchableOpacity>
      </View>
       {/* 模拟底部导航 */}
      <View style={styles.fakeBottomNav}>
          <Icon name="home" size={24} color="#888" />
          <Icon name="chevron-left" size={24} color="#555" />
          <Text style={styles.pageNumber}>6 / 14</Text>
          <Icon name="chevron-right" size={24} color="#555" />
          <Icon name="refresh" size={24} color="#888" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // 浅灰色背景
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  filterIcon: {
    marginLeft: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 150, // 为底部按钮和导航留出空间
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '48%', // 接近一半宽度，留出间隙
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120, // 图片高度
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSize: {
    fontSize: 12,
    color: '#888',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 50, // 调整位置，在假导航栏上方
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa', // 与背景色一致
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  exportButton: {
    backgroundColor: '#007bff', // 蓝色
  },
  deleteButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 15,
  },
  deleteButtonText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 15,
  },
  fakeBottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 50,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#eee',
  },
  pageNumber: {
      fontSize: 14,
      color: '#555',
  }
});

export default HistoryScreen; 