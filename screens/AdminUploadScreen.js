import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BRAND_YELLOW = '#FFD700';
const BRAND_ORANGE = '#FFA500';
const BRAND_RED    = '#EF5350';
const DARK_NAVY    = '#0D1B2A';
const CARD_BG      = '#152536';

const AdminUploadScreen = ({ navigation }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = (source) => {
    const opts = { mediaType: 'photo', quality: 0.8 };
    const cb = (res) => {
      if (res.didCancel) return;
      if (res.errorCode) return Alert.alert('שגיאה', res.errorMessage || 'תקלה במצלמה/גלריה');
      const a = res.assets?.[0];
      if (!a) return;
      setPreview({
        uri: a.uri,
        type: a.type || 'image/jpeg',
        fileName: a.fileName || `img_${Date.now()}.jpg`,
      });
    };
    source === 'camera' ? launchCamera(opts, cb) : launchImageLibrary(opts, cb);
  };

  const uploadImage = async () => {
    if (!preview) {
      return Alert.alert('שים לב', 'בחר תמונה תחילה');
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('image', {
      uri: preview.uri,
      type: preview.type,
      name: preview.fileName,
    });

    try {
      const { data } = await axios.post('https://carwashbackend-qhon.onrender.com/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      console.log('תמונה הועלתה לכתובת:', data.image.url);
      Alert.alert('הצלחה', 'התמונה הועלתה בהצלחה!');
      setPreview(null);
      navigation.goBack();
    } catch (error) {
      console.error('שגיאה בהעלאה:', error.message);
      Alert.alert('שגיאה', 'העלאה נכשלה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_NAVY} />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BRAND_YELLOW} />
          <Text style={styles.loadingText}>מעלה תמונה... נא להמתין</Text>
        </View>
      )}

      <View style={styles.topBar}>
        <Pressable style={styles.logoutBtn} onPress={handleLogout} android_ripple={{ color: '#ffffff22', radius: 24 }}>
          <Icon name="logout" size={20} color="#fff" />
        </Pressable>

        <Text style={styles.pageTitle}>העלאת תמונה</Text>

        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} android_ripple={{ color: '#00000022', radius: 24 }}>
          <Icon name="arrow-back" size={22} color={DARK_NAVY} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.previewBox}>
          {preview
            ? <Image source={{ uri: preview.uri }} style={styles.previewImg} />
            : <Icon name="image" size={90} color="#666" />}
        </View>

        <View style={styles.rowBtns}>
          <ActionButton icon="photo-camera" label="מצלמה" onPress={() => pickImage('camera')} />
          <ActionButton icon="photo-library" label="גלריה" onPress={() => pickImage('library')} />
        </View>

        <Pressable style={styles.uploadBtn} onPress={uploadImage} disabled={loading}>
          <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradBtn}>
            <Icon name="cloud-upload" size={18} color={DARK_NAVY} style={{ marginLeft: 6 }} />
            <Text style={styles.uploadTxt}>העלאה</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const ActionButton = ({ icon, label, onPress }) => (
  <Pressable style={styles.actionBtn} onPress={onPress} android_ripple={{ color: '#ffffff22', radius: 28 }}>
    <Icon name={icon} size={26} color={BRAND_YELLOW} />
    <Text style={styles.actionTxt}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_NAVY },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 8 },
  backBtn: { backgroundColor: BRAND_YELLOW, padding: 10, borderRadius: 24, elevation: 4 },
  logoutBtn: { backgroundColor: BRAND_RED, padding: 10, borderRadius: 24, elevation: 4 },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: BRAND_YELLOW },
  body: { flex: 1, alignItems: 'center', padding: 24 },
  previewBox: { width: '90%', height: 250, borderRadius: 20, backgroundColor: CARD_BG, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  previewImg: { width: '100%', height: '100%', borderRadius: 20, resizeMode: 'cover' },
  rowBtns: { flexDirection: 'row-reverse', justifyContent: 'space-between', width: '90%', marginBottom: 24 },
  actionBtn: { alignItems: 'center' },
  actionTxt: { color: '#fff', marginTop: 6, fontSize: 13 },
  uploadBtn: { width: '70%', borderRadius: 30, overflow: 'hidden' },
  gradBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', height: 46, width: '100%' },
  uploadTxt: { color: DARK_NAVY, fontWeight: 'bold', fontSize: 16 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { marginTop: 12, color: BRAND_YELLOW, fontSize: 16, fontWeight: 'bold' },
});

export default AdminUploadScreen;
