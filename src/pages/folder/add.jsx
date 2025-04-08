import React, {useState} from 'react';
import {StyleSheet, ActivityIndicator} from 'react-native';
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
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
import {addFolder} from '../../api/folder';

const Folder = ({navigation}) => {
  const {showToast} = useToast();
  const themeColor = useSelector(state => state.settingStore.themeColor);

  const [type, setType] = useState('');
  const [typeName, setTypeName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [count, setCount] = useState('');
  const [tenantId, setTenantId] = useState('');

  const add = async () => {
    let params = {
      type: type,
      typeName:type==1?"个人":"企业",
      folderName,
      count: '1',
      userId: '1',
    };

    console.log('params', params);
    let res = await addFolder(params);
    showToast("添加成功");
    navigation.goBack();

    console.log('res', res);
  };

  return (
    <View flexG paddingH-25 paddingT-10 backgroundColor={Colors.white}>
      <RadioGroup onValueChange={value => setType(value)}>
        <RadioButton value={1} label="个人" style={{marginBottom:10}} />
        <RadioButton value={2} label="企业" />
      </RadioGroup>


      <View marginT-20 style={[styles.inputBox, {borderColor: themeColor}]}>
        <FontAwesome name="user-circle-o" color={Colors.grey40} size={20} />
        <TextField
          text70
          style={styles.input}
          placeholder="请输入收藏夹名称"
          value={folderName}
          placeholderTextColor={Colors.grey40}
          onChangeText={value => setFolderName(value)}
        />
      </View>

      <Button
        marginT-20
        label="添加"
        backgroundColor={Colors.Primary}
        disabledBackgroundColor={Colors.Primary}
        iconOnRight={true}
        onPress={() => {
          add();
        }}
      />
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

export default Folder;
