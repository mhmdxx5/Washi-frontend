// WashiDashboardScreen.js – ‎عرض رئيسي RTL كامل (يُظهر لوحة المدير عند role === 'admin')
import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Image,
  Pressable, Animated, I18nManager,
} from 'react-native';
import Icon           from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage   from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE      = 'https://carwashbackend-qhon.onrender.com/api';
const BRAND_YELLOW  = '#FFD700';
const BRAND_ORANGE  = '#FFA500';
const DARK_NAVY     = '#0D1B2A';
const CARD_BG       = '#152536';

/* ——— عناصر صغيرة ——— */
const ServiceIcon = ({ iconName, label, onPress }) => (
  <Pressable style={styles.serviceIconContainer} onPress={onPress}
             android_ripple={{ color: BRAND_YELLOW + '33', radius: 34 }}>
    <View style={styles.iconCircle}>
      <Icon name={iconName} size={28} color={BRAND_YELLOW} />
    </View>
    <Text style={styles.serviceLabel}>{label}</Text>
  </Pressable>
);

const AdminButton = ({ icon, label, onPress }) => (
  <Pressable style={styles.adminButton} onPress={onPress}
             android_ripple={{ color: '#00000022' }}>
    <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradientButton}>
      <Icon name={icon} size={20} color="#000" style={styles.iconStyle} />
      <Text style={styles.ctaButtonText}>{label}</Text>
    </LinearGradient>
  </Pressable>
);

const AdminUploadButton = ({ onPress }) => (
  <Pressable style={styles.adminUploadButton} onPress={onPress}>
    <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradientButton}>
      <Icon name="cloud-upload" size={20} color="#000" style={styles.iconStyle} />
      <Text style={styles.ctaButtonText}>رفع صورة جديدة</Text>
    </LinearGradient>
  </Pressable>
);

/* ——— الشاشة ——— */
const WashiDashboardScreen = ({ navigation }) => {
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [userName,  setUserName]  = useState('ضيف');
  const [greeting,  setGreeting]  = useState('مرحبا');
  const [location,  setLocation]  = useState('جارٍ تحديد الموقع…');
  const [banners,   setBanners]   = useState([]);
  const [idx,       setIdx]       = useState(0);
  const fadeAnim                  = useRef(new Animated.Value(1)).current;

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'userName', 'userId', 'role']);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

const deleteAccount = async () => {
  const userId = await AsyncStorage.getItem('userId');
  const token = await AsyncStorage.getItem('token');

  if (!userId || !token) {
    Alert.alert('خطأ', 'لا يمكن العثور على بيانات المستخدم');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.ok || response.status === 404) {
      Alert.alert('🎉', 'تم حذف الحساب بنجاح', [
        { text: 'موافق', onPress: logout }
      ]);
    } else {
      Alert.alert('خطأ', result.message || 'تعذر حذف الحساب');
    }
  } catch (e) {
    Alert.alert('خطأ', 'حدث خطأ أثناء حذف الحساب');
  }
};


  useEffect(() => {
    (async () => {
      const role = (await AsyncStorage.getItem('role'))?.toLowerCase();
      setIsAdmin(role === 'admin');

      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);

      const h = new Date().getHours();
      setGreeting(h < 12 ? 'صباح الخير' : h < 18 ? 'مساء الخير' : 'مساء النور');

      try {
        const r = await fetch(`${API_BASE}/images/get-latest-images`);
        const j = await r.json();
        setBanners(j.slice(0, 3));
      } catch {}

      try {
        const r  = await fetch('https://ipapi.co/json');
        const j  = await r.json();
        setLocation(j?.city ? `${j.city}، ${j.region}` : 'الموقع غير معروف');
      } catch { setLocation('خطأ في تحديد الموقع'); }
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
      setIdx(p => banners.length ? (p + 1) % banners.length : 0);
    }, 3000);
    return () => clearInterval(t);
  }, [banners]);

  const title = isAdmin ? 'لوحة التحكم' : 'الرئيسية';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.logoutBtn} onPress={logout} android_ripple={{ color: '#ffffff22', radius: 22 }}>
          <Icon name="logout" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} android_ripple={{ color: '#00000022', radius: 22 }}>
          <Icon name="arrow-forward" size={20} color={DARK_NAVY} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.locationInfo}>
            <Icon name="location-on" size={20} color={BRAND_YELLOW} />
            <Text style={styles.locationText}>موقعك الحالي: {location}</Text>
          </View>

          <View style={styles.userInfoBox}>
            <Image source={require('../assets/avatar.png')} style={styles.avatar} />
            <View style={{ marginRight: 10 }}>
              <Text style={styles.greeting}>{greeting} 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.roleTag}>{isAdmin ? 'مدير' : 'مستخدم'}</Text>
            </View>
          </View>

          <Text style={styles.mainTitle}>سيارتك تستاهل الأفضل!</Text>
          <Text style={styles.subTitle}>اطلب غسيل السيارة أينما كنت بكل سهولة وراحة</Text>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>خدمات الغسيل والتلميع في مكان واحد!</Text>
          <Pressable style={styles.ctaButton} onPress={() => navigation.navigate('Home')} android_ripple={{ color: '#00000022' }}>
            <LinearGradient colors={[BRAND_YELLOW, BRAND_ORANGE]} style={styles.gradientButton}>
              <Icon name="add-circle-outline" size={20} color="#000" style={styles.iconStyle} />
              <Text style={styles.ctaButtonText}>طلب جديد</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.servicesRow}>
          <ServiceIcon iconName="local-car-wash" label="الغسيل" onPress={() => navigation.navigate('Home')} />
          <ServiceIcon iconName="assignment" label="طلباتي" onPress={() => navigation.navigate('MyBookings')} />
          <ServiceIcon iconName="fact-check" label="التعليمات" onPress={() => navigation.navigate('Preparation')} />
          <ServiceIcon iconName="chat-bubble-outline" label="محادثة فورية" onPress={() => navigation.navigate('Chat')} />
        </View>

        {isAdmin ? (
          <View style={styles.adminSection}>
            <Text style={styles.adminTitle}>لوحة المدير</Text>
            <AdminButton icon="build" label="إدارة الخدمات" onPress={() => navigation.navigate('AdminProduct')} />
            <AdminButton icon="assignment" label="إدارة الطلبات" onPress={() => navigation.navigate('AdminBooking')} />
            <AdminButton icon="support-agent" label="إدارة التذاكر" onPress={() => navigation.navigate('AdminSupport')} />
            <AdminUploadButton onPress={() => navigation.navigate('AdminUpload')} />
          </View>
        ) : (
          <>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={styles.bannersTitle}>مختاراتنا</Text>
              {banners.length ? (
                <Animated.Image source={{ uri: banners[idx].url }} style={[styles.bannerImage, { opacity: fadeAnim }]} />
              ) : (
                <Text style={{ color: '#fff', marginTop: 20 }}>لا توجد صور</Text>
              )}
            </View>
            <Pressable style={styles.smallDeleteBtn} onPress={deleteAccount}>
              <Icon name="delete-outline" size={16} color="#fff" />
              <Text style={styles.smallDeleteText}>حذف الحساب</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_NAVY },
  topBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: DARK_NAVY },
  topBarTitle: { flex: 1, textAlign: 'center', color: BRAND_YELLOW, fontSize: 18, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#C62828', padding: 6, borderRadius: 18, marginLeft: 8 },
  backBtn: { backgroundColor: BRAND_YELLOW, padding: 6, borderRadius: 18 },
  scrollContent: { padding: 20 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { color: '#fff', fontSize: 14, marginRight: 5 },
  userInfoBox: { flexDirection: 'row', backgroundColor: CARD_BG, padding: 14, borderRadius: 18, marginBottom: 16 },
  avatar: { width: 54, height: 54, borderRadius: 27, marginLeft: 14 },
  greeting: { color: '#ccc', fontSize: 14 },
  userName: { fontSize: 20, fontWeight: 'bold', color: BRAND_YELLOW },
  roleTag: { color: '#aaa', fontSize: 12, marginTop: 2 },
  mainTitle: { color: BRAND_YELLOW, fontSize: 26, fontWeight: 'bold' },
  subTitle: { color: '#ccc', fontSize: 14, marginTop: 4 },
  ctaBox: { backgroundColor: CARD_BG, borderRadius: 22, padding: 22, alignItems: 'center', marginBottom: 32 },
  ctaText: { color: '#fff', fontSize: 16, marginBottom: 12, textAlign: 'center' },
  ctaButton: { width: '70%', borderRadius: 32, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', height: 46, width: '100%' },
  ctaButtonText: { fontSize: 16, color: '#000', fontWeight: 'bold' },
  iconStyle: { marginLeft: 8 },
  servicesRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 },
  serviceIconContainer: { alignItems: 'center', width: '22%', marginBottom: 18 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: CARD_BG, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 2, borderColor: BRAND_YELLOW },
  serviceLabel: { color: '#fff', fontSize: 12, textAlign: 'center' },
  adminSection: { marginTop: 12 },
  adminTitle: { color: BRAND_YELLOW, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  adminButton: { marginBottom: 18, borderRadius: 32, overflow: 'hidden' },
  adminUploadButton: { borderRadius: 32, overflow: 'hidden' },
  bannersTitle: { color: BRAND_YELLOW, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  bannerImage: { width: '100%', height: 180, resizeMode: 'cover', marginTop: 15, borderRadius: 20 },
  smallDeleteBtn: { alignSelf: 'center', marginTop: 16, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#C62828', flexDirection: 'row', alignItems: 'center' },
  smallDeleteText: { color: '#fff', fontSize: 13, marginStart: 6 },
});

export default WashiDashboardScreen;