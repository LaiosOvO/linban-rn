import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Colors} from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {page} from '../api/folder';

const AnnotationManager = ({onClose,navigation}) => {
  const personalAnnotations = [
    // { id: 1, name: '监测点 (12)', color: Colors.primary },
    // { id: 2, name: '临时标记 (8)', color: Colors.primary },
  ];

  const companyAnnotations = [
    // { id: 3, name: '项目A-防火带 (23)', color: '#00BCD4' },
    // { id: 4, name: '项目B-区区规划 (15)', color: '#00BCD4' },
  ];

  const annotationCards = [
    {
      id: 1,
      title: '监测点 A-12',
      date: '2023-12-20',
      image: require('../assets/icons/monitor.png'), // 确保有这个图片资源
    },
    {
      id: 2,
      title: '防火带 B-08',
      date: '2023-12-19',
      image: require('../assets/icons/fire.png'), // 确保有这个图片资源
    },
  ];

  useEffect(() => {
    load();
  }, []);

  // 加载数据
  const load = async () => {
    let res = await page({
      pageNo: 1,
      pageSize: 15,
      userId: 1,
    });

    console.log('res', res);
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>标注管理</Text>
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>个人收藏夹</Text>
            <TouchableOpacity onPress={()=>{
                navigation.push("AddFolder");
            }}>
              <Icon name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {personalAnnotations.map(item => (
            <TouchableOpacity key={item.id} style={styles.folderItem}>
              <Icon name="folder" size={24} color={item.color} />
              <Text style={styles.folderName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>企业收藏夹</Text>
            <TouchableOpacity>
              <Icon name="add" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          {companyAnnotations.map(item => (
            <TouchableOpacity key={item.id} style={styles.folderItem}>
              <Icon name="folder" size={24} color={item.color} />
              <Text style={styles.folderName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cardsContainer}>
          {annotationCards.map(card => (
            <View key={card.id} style={styles.card}>
              <Image source={card.image} style={styles.cardImage} />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDate}>更新于 {card.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 60,
    width: '80%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  folderName: {
    marginLeft: 12,
    fontSize: 14,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  card: {
    width: '48%',
    marginBottom: 16,
    marginRight: '2%',
    backgroundColor: Colors.grey60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardTitle: {
    padding: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  cardDate: {
    padding: 8,
    paddingTop: 0,
    fontSize: 12,
    color: Colors.grey30,
  },
});

export default AnnotationManager;
