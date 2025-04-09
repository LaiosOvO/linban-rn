import React, {useEffect, useState} from 'react';
import {StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import {
  View,
  TextField,
  Text,
  Button,
  Checkbox,
  Colors,
  RadioGroup,
  RadioButton,
} from 'react-native-ui-lib';

import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  AccountuserLogin,
  CodeuserLogin,
  getCodeBymail,
  userRegMail,
} from '../../api/user';
import {useSelector, useDispatch} from 'react-redux';
import {setUserInfo, setUserToken} from '../../stores/store-slice/userStore';
import {useToast} from '../../components/commom/Toast';
import {ValidateMail} from '../../utils/base';
import PasswordEye from '../../components/aboutInput/PasswordEye';
import {displayName as appDisplayName} from '../../../app.json';
import {addFolder, linbanList} from '../../api/folder';

const Search = ({navigation}) => {
  const {showToast} = useToast();
  const themeColor = useSelector(state => state.settingStore.themeColor);

  const [list, setList] = useState('');
 

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    let res = await linbanList({
      pageNo: 1,
      pageSize: 15,
      userId: 1,
    });
    setList(res.data.list);
    console.log('res2==', res);
  };

  return (
    <View flexG paddingH-25 paddingT-10 backgroundColor={Colors.white}>
      <TouchableOpacity
        onPress={() => {
          navigation.push('Search');
        }}
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: '#eee',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 20,
        }}>
        <Icon name="search" size={24} color={'#000'} />
        <Text>搜索林班</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  logoBox: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: Colors.Primary,
  },
  mouthBox: {
    position: 'absolute',
    bottom: 34,
    right: 31,
  },
  msgBox: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: Colors.Primary,
    padding: 10,
    borderRadius: 12,
    position: 'relative',
  },
  input: {
    padding: 8,
    width: 300,
  },
  seedbut: {
    position: 'absolute',
    right: 16,
  },
  label: {
    color: Colors.grey30,
  },
  button: {
    width: '20%',
  },
});

export default Search;
