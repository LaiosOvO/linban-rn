import * as React from 'react';
import {StyleSheet, ImageBackground} from 'react-native';
import {Image, View, Text, Colors, TouchableOpacity} from 'react-native-ui-lib';
import {useSelector, useDispatch} from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {fullHeight, fullWidth} from '../../styles';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Marquee} from '@animatereactnative/marquee';
import {isEmptyObject, deepClone, getRandomInt} from '../../utils/base';
import {
  setPlayingMusic,
  removePlayList,
  setIsClosed,
  addPlayList,
  setPlayList,
} from '../../stores/store-slice/musicStore';
import {useToast} from '../commom/Toast';
import {useRealm} from '@realm/react';
import MusicControl, {Command} from 'react-native-music-control';
import {
  getMusicList,
  getFavoritesDetail,
  editDefaultFavorites,
} from '../../api/music';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LyricModal from './LyricModal';
import ToBePlayedModal from './ToBePlayedModal';

export const MusicCtrlContext = React.createContext();
export const useMusicCtrl = () => React.useContext(MusicCtrlContext);
const audioPlayer = new AudioRecorderPlayer();

const MusicCtrlProvider = React.memo(props => {
  const {children} = props;
  const {showToast} = useToast();
  const realm = useRealm();
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.userStore.userInfo);
  // baseConfig
  const {STATIC_URL} = useSelector(state => state.baseConfigStore.baseConfig);
  const showMusicCtrl = useSelector(state => state.musicStore.showMusicCtrl);
  const playList = useSelector(state => state.musicStore.playList);
  const playingMusic = useSelector(state => state.musicStore.playingMusic);
  const closeTime = useSelector(state => state.musicStore.closeTime);
  const randomNum = useSelector(state => state.musicStore.randomNum);
  const isRandomPlay = useSelector(state => state.musicStore.isRandomPlay);

  const [musicModalVisible, setMusicModalVisible] = React.useState(false);
  const [listModalVisible, setListModalVisible] = React.useState(false);
  const [audioIsPlaying, setAudioIsPlaying] = React.useState(false); // 音频是否正在播放
  const [audioPlayprogress, setAudioPlayprogress] = React.useState({}); // 音频播放进度
  const [prevPlayingMusic, setPrevPlayingMusic] = React.useState({}); // 记录上一次播放的音乐
  const [playingIndex, setPlayingIndex] = React.useState(0); // 当前播放音乐的索引
  const [progressNum, setProgressNum] = React.useState(0); // 进度条数值
  const [playType, setPlayType] = React.useState('order'); // 列表播放类型 single order random

  // 音乐播放器
    const listener = audioPlayer.addPlayBackListener(playbackMeta => {
      setAudioPlayprogress(playbackMeta);
      MusicControl.updatePlayback({
        elapsedTime: Math.round(playbackMeta.currentPosition / 1000),
      });
      const num = Math.round(
        (playbackMeta.currentPosition / playbackMeta.duration) * 100,
      );
      if (num) {
        setProgressNum(num);
      }
      if (playbackMeta.isFinished) {
        restMusicStatus().then(() => {
          if (isRandomPlay) {
            getRandMusic();
          } else if (playList.length > 0) {
            if (playType === 'single') {
              dispatch(setPlayingMusic(playList[playingIndex]));
            } else if (playType === 'order') {
              dispatch(
                setPlayingMusic(
                  playingIndex === playList.length - 1
                    ? playList[0]
                    : playList[playingIndex + 1],
                ),
              );
            } else if (playType === 'random') {
              dispatch(
                setPlayingMusic(
                  playList[Math.floor(Math.random() * playList.length)],
                ),
              );
            }
          } else {
            dispatch(setPlayingMusic({}));
          }
        });
      }
    });

  // 上一首
  const previousRemote = React.useCallback(() => {
    if (playingIndex === 0 && playList.length > 0) {
      dispatch(setPlayingMusic(playList[playList.length - 1]));
      showToast('已经是第一首了~', 'warning');
      return;
    }
    if (playList.length > 0) {
      dispatch(setPlayingMusic(playList[playingIndex - 1]));
    } else {
      showToast('没有要播放的音乐~', 'warning');
    }
  }, [playList, playingIndex]);

  // 播放或暂停
  const playOrPauseRemote = React.useCallback(() => {
    if (audioIsPlaying) {
      audioPlayer.pausePlayer();
      setAudioIsPlaying(false);
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PAUSED,
      });
    } else {
      if (isEmptyObject(playingMusic)) {
        showToast('没有要播放的音乐~', 'warning');
        return;
      }
      audioPlayer.resumePlayer();
      setAudioIsPlaying(true);
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PLAYING,
      });
    }
  }, [audioIsPlaying, playingMusic]);

  // 下一首
  const nextRemote = React.useCallback(() => {
    if (isRandomPlay) {
      getRandMusic();
      return;
    }
    if (playingIndex === playList.length - 1) {
      dispatch(setPlayingMusic(playList[0]));
      showToast('已经是最后一首了~', 'warning');
      return;
    }
    if (playList.length > 0) {
      dispatch(setPlayingMusic(playList[playingIndex + 1]));
      return;
    } else {
      showToast('没有要播放的音乐~', 'warning');
      return;
    }
  }, [isRandomPlay, playList, playingIndex]);

  // 重置音乐播放所有状态
  const restMusicStatus = async () => {
    MusicControl.stopControl();
    setAudioPlayprogress({});
    setProgressNum(0);
    setAudioIsPlaying(false);
    try {
      const stopResult = await audioPlayer.stopPlayer();
      return stopResult;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  /* 写入本地播放记录 */
  const addOrUpdateLocalMusic = music => {
    if (typeof music?.id === 'string') {
      return;
    }
    const localMusic = deepClone(music);
    for (const key in localMusic) {
      if (localMusic[key] === null) {
        delete localMusic[key];
      }
    }
    const musicList = realm
      .objects('MusicInfo')
      .filtered('id == $0', localMusic.id);
    if (musicList.length > 0) {
      realm.write(() => {
        for (const ele of musicList) {
          ele.updateAt = Date.now().toString();
        }
      });
    } else {
      localMusic.createdAt = Date.now().toString();
      localMusic.updateAt = Date.now().toString();
      realm.write(() => {
        realm.create('MusicInfo', localMusic);
      });
    }
  };

  /* 开启通知栏控件 */
  const startNotification = musicInfo => {
    const {title, artist, album, duration, musicMore} = musicInfo;
    MusicControl.setNotificationId(5173, '音乐播放器控制组件');
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('stop', false);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableControl('seek', true);
    MusicControl.enableControl('closeNotification', true, {when: 'paused'});
    MusicControl.enableBackgroundMode(true);
    MusicControl.handleAudioInterruptions(true);
    MusicControl.setNowPlaying({
      title: title,
      artwork: STATIC_URL + (musicMore?.music_cover || userInfo?.user_avatar),
      artist: artist,
      album: album,
      duration: duration,
      color: 0x0000ff,
      date: Date.now().toString(),
      isLiveStream: true,
    });
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PLAYING,
      speed: 1,
    });
  };

  React.useEffect(() => {
    /* 控件操作 */
    MusicControl.on(Command.pause, () => {
      playOrPauseRemote();
    });
    MusicControl.on(Command.play, () => {
      playOrPauseRemote();
    });
    MusicControl.on(Command.nextTrack, () => {
      nextRemote();
    });
    MusicControl.on(Command.previousTrack, () => {
      previousRemote();
    });
    MusicControl.on(Command.seek, pos => {
      audioPlayer?.seekToPlayer(pos * 1000);
    });
  }, [playOrPauseRemote, nextRemote, previousRemote]);

  // 是否要定时关闭音乐
  let timer = null;
  React.useEffect(() => {
    if (closeTime) {
      timer = setTimeout(() => {
        audioPlayer.pausePlayer();
        setAudioIsPlaying(false);
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PAUSED,
        });
        dispatch(setIsClosed(true));

        clearTimeout(timer);
      }, closeTime * 60000);
    } else {
      clearTimeout(timer);
    }
  }, [closeTime]);

  // 获取随机歌曲
  const getRandMusic = React.useCallback(async () => {
    const index = getRandomInt(randomNum.min, randomNum.max);
    try {
      const res = await getMusicList({pageNum: index, pageSize: 1});
      if (res.success && res.data.list.length > 0) {
        const music = res.data.list[0];
        dispatch(setPlayingMusic(music));
        dispatch(addPlayList([music]));
      }
    } catch (error) {
      console.log(error);
    }
  }, [randomNum.max, randomNum.min]);

  // 随机播放
  React.useEffect(() => {
    if (isRandomPlay && playList.length === 0) {
      getRandMusic();
    }
  }, [isRandomPlay]);

  // 是否播放新的音乐
  React.useEffect(() => {
    if (
      prevPlayingMusic?.id !== playingMusic?.id ||
      playType === 'single' ||
      !audioIsPlaying
    ) {
      restMusicStatus().then(() => {
        if (playingMusic?.file_name) {
          let url = '';
          if (typeof playingMusic?.id === 'number') {
            url = STATIC_URL + playingMusic?.file_name;
          } else {
            url = playingMusic?.file_name;
          }
          // console.log('开始播放音乐', playingMusic);
          audioPlayer
            .startPlayer(url)
            .then(() => {
              setAudioIsPlaying(true);
              const index = playList.findIndex(
                item => item.id === playingMusic.id,
              );
              setPlayingIndex(index);
              setPrevPlayingMusic(playingMusic);
              startNotification(playingMusic);
              if (realm) {
                addOrUpdateLocalMusic(playingMusic);
              }
            })
            .catch(error => {
              console.log(error);
              showToast('无法播放的音乐！', 'error');
            });
        }
      });
    }
  }, [playingMusic, realm]);

  // 加载音乐名
  const renderMarquee = music => {
    const {title, artists} = music;
    const musicText =
      (title ?? '还没有要播放的音乐') +
      ' - ' +
      (artists?.join('/') || '未知歌手');
    const speed = musicText.length > 16 ? 0.4 : 0;
    const spacing = musicText.length > 16 ? fullWidth * 0.2 : fullWidth * 0.6;
    return (
      <Marquee
        key={title}
        speed={speed}
        spacing={spacing}
        style={styles.marquee}>
        <Text white>{musicText}</Text>
      </Marquee>
    );
  };

  /* 获取用户收藏的音乐列表 */
  const [collectMusic, setCollectMusic] = React.useState([]);
  const getAllMusicList = async userId => {
    try {
      const res = await getFavoritesDetail({
        creator_uid: userId,
        is_default: 1,
      });
      if (res.success) {
        setCollectMusic(res.data.music);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // 编辑用户收藏的音乐
  const editMyFavorite = async (id, isFavorite) => {
    try {
      const res = await editDefaultFavorites({
        handleType: isFavorite ? 'remove' : 'add',
        creator_uid: userInfo?.id,
        musicIds: [id],
      });
      if (res.success) {
        showToast(isFavorite ? '已取消收藏' : '已收藏', 'success');
        getAllMusicList(userInfo?.id);
      } else {
        showToast(res.message, 'error');
      }
    } catch (error) {
      console.error(error);
    }
  };

  React.useEffect(() => {
    if (userInfo?.id) {
      getAllMusicList(userInfo?.id);
    }
    return () => {
      audioPlayer.removePlayBackListener(listener);
      MusicControl.stopControl();
      restMusicStatus();
    };
  }, [userInfo]);

  return (
    <MusicCtrlContext.Provider value={{}}>
      {children}
      {showMusicCtrl ? (
        <View style={styles.CtrlContainer}>
          <ImageBackground
            blurRadius={40}
            style={styles.ctrlBackImage}
            source={{uri: STATIC_URL + userInfo?.user_avatar}}
            resizeMode="cover">
            <GestureHandlerRootView>
              <View row centerV spread>
                <TouchableOpacity
                  row
                  centerV
                  onPress={() => {
                    setMusicModalVisible(true);
                  }}>
                  <View marginR-6>
                    <AnimatedCircularProgress
                      key={playingMusic}
                      size={47}
                      width={3}
                      fill={progressNum}
                      tintColor={Colors.red40}
                      rotation={0}
                      lineCap="round">
                      {() => (
                        <Image
                          source={{
                            uri:
                              STATIC_URL +
                              (playingMusic?.musicMore?.music_cover ||
                                'default_music_cover.jpg'),
                          }}
                          style={styles.image}
                        />
                      )}
                    </AnimatedCircularProgress>
                  </View>

                  <View centerV>{renderMarquee(playingMusic)}</View>
                </TouchableOpacity>
                <View row centerV>
                  <TouchableOpacity
                    style={styles.musicBut}
                    onPress={() => {
                      playOrPauseRemote();
                    }}>
                    {audioIsPlaying ? (
                      <AntDesign
                        name="pausecircleo"
                        color={Colors.white}
                        size={24}
                      />
                    ) : (
                      <AntDesign
                        name="playcircleo"
                        color={Colors.white}
                        size={24}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.musicBut}
                    marginL-6
                    marginR-12
                    onPress={() => setListModalVisible(true)}>
                    <AntDesign
                      name="menuunfold"
                      color={Colors.white}
                      size={22}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </GestureHandlerRootView>
          </ImageBackground>
        </View>
      ) : null}
      <LyricModal
        Visible={musicModalVisible}
        OnClose={() => setMusicModalVisible(false)}
        Music={playingMusic}
        IsPlaying={audioIsPlaying}
        IsFavorite={collectMusic.some(item => item.id === playingMusic.id)}
        OnFavorite={editMyFavorite}
        PlayMode={playType}
        PlayProgress={audioPlayprogress}
        OnSliderChange={value => {
          audioPlayer.seekToPlayer(value);
        }}
        OnChangeMode={() => {
          setPlayType(prev => {
            if (prev === 'order') {
              showToast('随机播放', 'success', true);
              return 'random';
            }
            if (prev === 'random') {
              showToast('单曲循环', 'success', true);
              return 'single';
            }
            if (prev === 'single') {
              showToast('顺序播放', 'success', true);
              return 'order';
            }
          });
        }}
        OnBackWard={() => {
          previousRemote();
        }}
        OnPlay={() => {
          playOrPauseRemote();
        }}
        OnForWard={() => {
          nextRemote();
        }}
        OnMain={() => {
          setListModalVisible(true);
        }}
      />
      <ToBePlayedModal
        Visible={listModalVisible}
        OnClose={() => setListModalVisible(false)}
        OnClearList={()=>{
          dispatch(setPlayList([]));
        }}
        Music={playingMusic}
        List={playList}
        OnPressItem={item => {
          dispatch(setPlayingMusic(item));
        }}
        OnPressRemove={item => {
          dispatch(removePlayList([item]));
        }}
      />
    </MusicCtrlContext.Provider>
  );
});

const styles = StyleSheet.create({
  musicBut: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ctrlBackImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 2,
  },

  CtrlContainer: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  image: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: Colors.white,
    borderWidth: 1,
  },
  marquee: {
    flex: 1,
    width: fullWidth * 0.56,
    paddingTop: fullHeight * 0.016,
    overflow: 'hidden',
  },
});

export default MusicCtrlProvider;
