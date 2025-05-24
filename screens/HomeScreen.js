// HomeScreen.js — اختيار خدمة
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  SafeAreaView, I18nManager,
} from 'react-native';
import Icon           from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage   from '@react-native-async-storage/async-storage';
import axios          from 'axios';
import LinearGradient from 'react-native-linear-gradient';

/* ألوان وهوامش موحّدة مع Dashboard */
const BRAND_YELLOW='#FFD700', BRAND_ORANGE='#FFA500', DARK_NAVY='#0D1B2A';
const SIDE_PADDING =14, isRTL=I18nManager.isRTL;

const HomeScreen = ({ navigation }) => {
  const [selected, setSelected] = useState([]);
  const [services, setServices] = useState([]);

  /* جلب الخدمات مرة واحدة */
  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await axios.get(
          'https://carwashbackend-qhon.onrender.com/api/products'
        );
        setServices(data);
      }catch(e){ console.error('خطأ في جلب الخدمات',e); }
    })();
  },[]);

  /* اختيار / إلغاء اختيار خدمة */
  const toggleService = id =>
    setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  /* متابعة للحجز */
  const proceed = ()=>{
    const full = services.filter(s=>selected.includes(s._id));
    navigation.navigate('Booking',{ selectedServices:full });
  };

  /* تسجيل خروج كامل */
  const logout = async ()=>{
    await AsyncStorage.clear();
    navigation.reset({index:0,routes:[{name:'Login'}]});
  };

  /* — واجهة المستخدم — */
  return(
    <SafeAreaView style={styles.container}>
      {/* شريط علوي */}
      <View style={[styles.topBar,{flexDirection:isRTL?'row-reverse':'row'}]}>
        <Pressable style={styles.logoutBtn} onPress={logout}
          android_ripple={{color:'#ffffff22',radius:22}}>
          <Icon name="logout" size={20} color="#fff"/>
        </Pressable>

        <Text style={styles.pageTitle}>اختيار خدمة</Text>

        <Pressable style={styles.backBtn}
          onPress={()=>navigation.navigate('Dashboard')}
          android_ripple={{color:'#00000022',radius:22}}>
          <Icon name={isRTL?'arrow-forward':'arrow-back'} size={20} color={DARK_NAVY}/>
        </Pressable>
      </View>

      <Text style={styles.subHeading}>
        اختر نوع الخدمة (تم اختيار {selected.length})
      </Text>

      {/* قائمة الخدمات */}
      <ScrollView contentContainerStyle={styles.listWrap} showsVerticalScrollIndicator={false}>
        {services.map(item=>{
          const chosen = selected.includes(item._id);
          return(
            <Pressable key={item._id}
              style={[styles.card,chosen&&styles.cardChosen]}
              onPress={()=>toggleService(item._id)}
              android_ripple={{color:'#00000022'}}>
              <View style={styles.cardHeader}>
                <Icon name={item.icon||'build'} size={26} color={DARK_NAVY}/>
                {chosen&&<Icon name="check-circle" size={20} color={DARK_NAVY}/>}
              </View>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.cardPrice}>₪{item.price}</Text>
            </Pressable>
          );
        })}
        <View style={{height:100}}/>
      </ScrollView>

      {/* زر المتابعة */}
      <Pressable style={[styles.proceedWrap,{opacity:selected.length?1:0.35}]}
        disabled={!selected.length} onPress={proceed}
        android_ripple={{color:'#00000022'}}>
        <LinearGradient colors={[BRAND_YELLOW,BRAND_ORANGE]} style={styles.gradientBtn}>
          <Text style={styles.proceedTxt}>متابعة الحجز</Text>
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
};

/* — الأنماط — */
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:DARK_NAVY,paddingHorizontal:SIDE_PADDING},

  topBar:{alignItems:'center',justifyContent:'space-between',marginTop:8},
  backBtn:{backgroundColor:BRAND_YELLOW,padding:6,borderRadius:18,elevation:4},
  logoutBtn:{backgroundColor:'#C62828',padding:6,borderRadius:18,elevation:4},
  pageTitle:{flex:1,textAlign:'center',fontSize:18,fontWeight:'bold',color:BRAND_YELLOW},

  subHeading:{fontSize:18,color:'#ccc',textAlign:'right',marginVertical:16},

  listWrap:{paddingBottom:40},
  card:{backgroundColor:BRAND_YELLOW,borderRadius:22,padding:18,marginBottom:16,
        borderWidth:1,borderColor:'transparent'},
  cardChosen:{borderColor:DARK_NAVY},
  cardHeader:{flexDirection:'row',justifyContent:'space-between',marginBottom:6},
  cardTitle:{fontSize:20,fontWeight:'bold',color:DARK_NAVY,textAlign:'right'},
  cardDesc:{fontSize:13,color:DARK_NAVY,textAlign:'right',marginTop:4},
  cardPrice:{fontSize:16,color:DARK_NAVY,fontWeight:'700',textAlign:'right',marginTop:8},

  proceedWrap:{position:'absolute',left:SIDE_PADDING,right:SIDE_PADDING,bottom:28,
               borderRadius:32,overflow:'hidden'},
  gradientBtn:{height:54,justifyContent:'center',alignItems:'center'},
  proceedTxt:{fontSize:18,fontWeight:'bold',color:DARK_NAVY},
});

export default HomeScreen;
