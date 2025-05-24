import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, Image,
  TouchableOpacity, SafeAreaView,
  I18nManager, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Sound from 'react-native-sound';
import BubblesAnimation from '../components/BubblesAnimation';

const BRAND_YELLOW = '#FFD700';
const BRAND_NAVY   = '#0D1B2A';

/* ثوابت نصّية */
const STR = {
  title:            'قوة',
  subtitlePre:      'النظافة ',
  subtitleHighlight:'بين يديك',
  splash:           'WASHI',
  btn:              'تحكم في النظافة',
};

/* حمّل صوت النقرة */
const clickSound = new Sound(
  require('../assets/sound/click.mp3'),
  (e) => e && console.log('خطأ في تحميل الصوت', e),
);

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
    return () => clickSound.release();
  }, []);

  const handleStart = () => {
    if (clickSound?.isLoaded()) clickSound.stop(() => clickSound.play());
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{STR.title}</Text>

        <Text style={styles.subtitle}>
          {STR.subtitlePre}
          <Text style={{ color: BRAND_YELLOW }}>{STR.subtitleHighlight}</Text>
        </Text>

        <Text style={styles.number}>{STR.splash}</Text>

        <Image
          source={require('../assets/yellocar.png')}
          style={styles.carImage}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.lockButton} onPress={handleStart}>
          <Text style={styles.lockText}>{STR.btn}</Text>
        </TouchableOpacity>
      </View>

      <BubblesAnimation />
    </SafeAreaView>
  );
};

export default SplashScreen;

/* ـــــ الأنماط ـــــ */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:BRAND_NAVY, paddingHorizontal:20 },
  content  :{ flex:1, alignItems:'center', justifyContent:'center' },
  title    :{ color:'#fff', fontSize:28, fontWeight:'bold', writingDirection:'rtl' },
  subtitle :{ color:'#fff', fontSize:22, marginBottom:20, writingDirection:'rtl' },
  number   :{ fontSize:80, color:'#fff', fontWeight:'bold',
              position:'absolute', top:160, opacity:0.08 },
  carImage :{ width:250, height:250 },
  lockButton:{ marginTop:30, backgroundColor:BRAND_YELLOW,
               paddingVertical:12, paddingHorizontal:30, borderRadius:30 },
  lockText :{ color:'#000', fontWeight:'bold', fontSize:16 },
});
