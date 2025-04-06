import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CommandCenter = ({ onClose }) => {
  const [stats, setStats] = useState({
    online: 42,
    total: 50,
    teams: {
      forestry: { name: '造林组', count: 15 },
      patrol: { name: '巡护组', count: 12 },
      harvest: { name: '采伐组', count: 15 },
    },
    equipment: {
      battery: 80,
      fuel: 30,
    },
    alerts: [
      { id: 1, type: 'battery', message: '油锯#23电量不足', time: '10分钟前' },
    ],
    communications: [
      { id: 1, user: '张建国', message: '区域A巡查完毕', time: '14:30' },
      { id: 2, user: '李明', message: '发现隐患点', time: '14:25' },
    ],
  });

  useEffect(() => {
    // 模拟实时数据更新
    const interval = setInterval(() => {
      // 这里可以添加实际的API调用
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>指挥中心</Text>
        <View style={styles.headerRight}>
          <Icon name="notifications" size={24} color={Colors.black} style={styles.icon} />
          <Icon name="settings" size={24} color={Colors.black} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>在线人数</Text>
          <Text style={styles.statsValue}>{stats.online}/{stats.total}</Text>
        </View>

        <View style={styles.teamsSection}>
          {Object.entries(stats.teams).map(([key, team]) => (
            <View key={key} style={styles.teamItem}>
              <Icon name="group" size={20} color={Colors.primary} />
              <Text style={styles.teamName}>{team.name}</Text>
              <Text style={styles.teamCount}>{team.count}人</Text>
            </View>
          ))}
        </View>

        <View style={styles.equipmentSection}>
          <Text style={styles.sectionTitle}>设备状态</Text>
          <View style={styles.equipmentStats}>
            <View style={styles.equipmentItem}>
              <Text>油锯电量</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stats.equipment.battery}%` }]} />
              </View>
            </View>
            <View style={styles.equipmentItem}>
              <Text>车辆油量</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { 
                  width: `${stats.equipment.fuel}%`,
                  backgroundColor: stats.equipment.fuel < 50 ? Colors.red30 : Colors.primary,
                }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.communicationSection}>
          <Text style={styles.sectionTitle}>通讯记录</Text>
          {stats.communications.map((comm) => (
            <View key={comm.id} style={styles.communicationItem}>
              <Text style={styles.communicationUser}>{comm.user}: {comm.message}</Text>
              <Text style={styles.communicationTime}>{comm.time}</Text>
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
    shadowOffset: { width: -2, height: 0 },
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
  statsTitle: {
    fontSize: 14,
    color: Colors.grey30,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  teamsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    marginLeft: 8,
    flex: 1,
  },
  teamCount: {
    color: Colors.grey30,
  },
  equipmentSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  equipmentStats: {
    marginTop: 8,
  },
  equipmentItem: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.grey60,
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  communicationSection: {
    padding: 16,
  },
  communicationItem: {
    marginBottom: 12,
  },
  communicationUser: {
    fontSize: 14,
  },
  communicationTime: {
    fontSize: 12,
    color: Colors.grey30,
    marginTop: 4,
  },
});

export default CommandCenter; 