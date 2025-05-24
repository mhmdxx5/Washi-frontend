// BookingScreen.js – شاشة الحجز مع التقويم وGPS وكهرباء/ماء
/* الآن يُظهر رسالة اعتذار إذا لا تتوفر ساعات في هذا اليوم */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView,
  TextInput, Alert, ActivityIndicator, I18nManager,
} from 'react-native';
import { Calendar }    from 'react-native-calendars';
import Icon            from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage    from '@react-native-async-storage/async-storage';
import axios           from 'axios';
import LinearGradient  from 'react-native-linear-gradient';
import Geolocation     from '@react-native-community/geolocation';
import moment          from 'moment';

/* RTL ثابت */
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

/* ألوان */
const BRAND_YELLOW='#FFD700', BRAND_ORANGE='#FFA500', BRAND_RED='#C62828',
      DARK_NAVY='#0D1B2A', CARD_BG='#152536', SIDE=14;

const todayStr = moment().format('YYYY-MM-DD');

export default function BookingScreen({ route, navigation }) {
  const { selectedServices=[] } = route.params||{};

  /* الحالة */
  const [carNumber,setCarNumber]   = useState('');
  const [phone,setPhone]           = useState('');
  const [location,setLocation]     = useState('');
  const [coords,setCoords]         = useState({});
  const [notes,setNotes]           = useState('');
  const [hasElectricity,setHasElectricity] = useState(false);
  const [hasWater,setHasWater]             = useState(false);

  const [pickedDay,setPickedDay]   = useState(todayStr);
  const [availableHours,setAvailableHours]=useState([]);
  const [selectedHour,setSelectedHour]=useState(null);

  const [userId,setUserId]   = useState(null);
  const [loading,setLoading] = useState(false);
  const [locating,setLocating] = useState(false);

  /* تهيئة */
  useEffect(()=>{ (async()=>{ setUserId(await AsyncStorage.getItem('userId')); })(); },[]);
  useEffect(()=>{ fetchAvailability(pickedDay); setSelectedHour(null); },[pickedDay]);

  /* جلب الساعات المتاحة + فلترة الساعات الماضية لليوم الحالي */
  const fetchAvailability = async (day)=>{
    try{
      const {data}=await axios.get(
        `https://carwashbackend-qhon.onrender.com/api/bookings/availability?date=${day}`
      );
      let hours = data.availableHours||[];

      if(day===todayStr){
        const nowH = moment().hour();
        hours = hours.filter(h=>parseInt(h,10)>nowH);
      }
      setAvailableHours(hours);
    }catch(e){ console.error('availability',e); }
  };

  /* تحديد الموقع وتحويله إلى عنوان (شارع + مدينة) */
  const detectLocation = () => {
    setLocating(true);
    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        try{
          const r=await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`,
            { headers:{'User-Agent':'WashiApp/1.0'} }
          );
          const j=await r.json(), a=j.address||{};
          const parts=[
            a.road||a.street||a.pedestrian||a.neighbourhood||a.suburb,
            a.city||a.town||a.village,
          ].filter(Boolean);
          setLocation(parts.join('، '));
        }catch{ Alert.alert('خطأ','تعذّر تحديد اسم المكان'); }
        finally{ setLocating(false); }
      },
      ()=>{ Alert.alert('خطأ','تعذّر الحصول على GPS'); setLocating(false); },
      { enableHighAccuracy:true, timeout:8000, maximumAge:5000 }
    );
  };

  /* حساب السعر */
  const services = selectedServices.map(s=>({
    productId:s._id||s.id, name:s.name, price:+s.price||0
  }));
  const total = services.reduce((t,s)=>t+s.price,0);

  /* إرسال الحجز */
  const submit = async ()=>{
    if(!location||!carNumber||!selectedHour){
      Alert.alert('خطأ','يرجى تعبئة كل الحقول واختيار ساعة');
      return;
    }
    const IL_MOBILE=/^05\d{8}$/;
    if(!IL_MOBILE.test(phone)){
      Alert.alert('رقم غير صالح','رقم الهاتف المحمول الإسرائيلي يجب أن يبدأ بـ05 ويتكون من 10 أرقام');
      return;
    }
    try{
      setLoading(true);
      const token=await AsyncStorage.getItem('token');
      await axios.post('https://carwashbackend-qhon.onrender.com/api/bookings',{
        user:userId,services,totalPrice:total,location,coordinates:coords,
        date:`${pickedDay}T${selectedHour}:00.000Z`,carNumber,phone,notes,
        electricity:hasElectricity,water:hasWater,
      },{headers:{Authorization:`Bearer ${token}`}});
      Alert.alert('نجاح','تم إرسال الحجز');
      navigation.navigate('Home');
    }catch(e){
      console.error(e);
      Alert.alert('خطأ','فشل إرسال الحجز');
    }finally{ setLoading(false); }
  };

  /* — واجهة المستخدم — */
  return(
  <SafeAreaView style={st.container}>
    {loading&&<View style={st.overlay}><ActivityIndicator size="large" color={BRAND_YELLOW}/>
      <Text style={st.ovTxt}>جارٍ الإرسال…</Text></View>}

    {/* شريط علوي */}
    <View style={st.top}>
      <Pressable style={st.logout} onPress={async()=>{await AsyncStorage.clear();navigation.reset({index:0,routes:[{name:'Login'}]});}}
        android_ripple={{color:'#ffffff22',radius:20}}>
        <Icon name="logout" size={20} color="#fff"/>
      </Pressable>
      <Text style={st.title}>تفاصيل الحجز</Text>
      <Pressable style={st.back} onPress={()=>navigation.goBack()}
        android_ripple={{color:'#00000022',radius:20}}>
        <Icon name="arrow-forward" size={20} color={DARK_NAVY}/>
      </Pressable>
    </View>

    {/* النموذج */}
    <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
      <Input icon="directions-car" placeholder="رقم السيارة" value={carNumber} onChangeText={setCarNumber}/>
      <Input icon="phone"         placeholder="رقم الهاتف"  value={phone}     onChangeText={setPhone} keyboardType="phone-pad"/>

      <Input icon="place" placeholder="الموقع" value={location} onChangeText={setLocation}/>
      <Pressable style={st.detect} onPress={detectLocation} disabled={locating}
        android_ripple={{color:'#00000022',radius:20}}>
        {locating?<ActivityIndicator size={18} color={BRAND_YELLOW}/>
                 :<Icon name="my-location" size={20} color={BRAND_YELLOW}/>}
        <Text style={st.detectTxt}>تحديد موقعي تلقائياً</Text>
      </Pressable>

      <Input icon="note" placeholder="وصف الموقع/ملاحظات" value={notes} onChangeText={setNotes} multiline/>

      <Check label="نقطة كهرباء" checked={hasElectricity} onToggle={()=>setHasElectricity(!hasElectricity)}/>
      <Check label="نقطة مياه"   checked={hasWater}       onToggle={()=>setHasWater(!hasWater)}/>

      <Text style={st.secTitle}>اختر التاريخ</Text>
      <Calendar
        minDate={todayStr}
        onDayPress={d=>setPickedDay(d.dateString)}
        markedDates={{[pickedDay]:{selected:true,selectedColor:BRAND_YELLOW}}}
        theme={{calendarBackground:CARD_BG,dayTextColor:'#fff',monthTextColor:BRAND_YELLOW,
                arrowColor:BRAND_YELLOW,todayTextColor:BRAND_ORANGE,selectedDayTextColor:DARK_NAVY}}
        style={{borderRadius:12,marginBottom:12}}/>

      {/* ساعات متاحة أو رسالة نفاد */}
      {availableHours.length>0 ? (
        <>
          <Text style={st.secTitle}>اختر الساعة</Text>
          <View style={st.hoursWrap}>
            {availableHours.map(h=>(
              <Pressable key={h} style={[st.hour,selectedHour===h&&st.hourSel]}
                onPress={()=>setSelectedHour(h)} android_ripple={{color:'#00000022',radius:24}}>
                <Text style={[st.hourTxt,selectedHour===h&&{color:DARK_NAVY}]}>{h}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <Text style={st.noHours}>نفدت المواعيد لهذا اليوم، جرّب تاريخاً آخر. نعتذر منك</Text>
      )}

      <Text style={st.total}>₪ الإجمالي: {total}</Text>
      {services.map((s,i)=><Text key={i} style={st.sItem}>- {s.name}: ₪{s.price}</Text>)}
    </ScrollView>

    <Pressable style={[st.btn,{opacity:selectedHour?1:0.35}]} disabled={!selectedHour}
      onPress={submit} android_ripple={{color:'#00000022'}}>
      <LinearGradient colors={[BRAND_YELLOW,BRAND_ORANGE]} style={st.btnGrad}>
        <Text style={st.btnTxt}>تأكيد الحجز</Text>
      </LinearGradient>
    </Pressable>
  </SafeAreaView>);
}

/* مكوّنات مساعدة */
const Input = ({ icon, multiline, ...p })=>(
  <View style={st.inWrap}>
    <Icon name={icon} size={20} color={BRAND_YELLOW} style={{marginStart:6}}/>
    <TextInput {...p} multiline={multiline}
      style={[st.input,multiline&&{height:90,textAlignVertical:'top'}]}
      placeholderTextColor="#999"/>
  </View>
);
const Check = ({ label, checked, onToggle })=>(
  <Pressable style={st.chk} onPress={onToggle} android_ripple={{color:'#00000022',radius:20}}>
    <Icon name={checked?'check-box':'check-box-outline-blank'} size={22} color={BRAND_YELLOW}/>
    <Text style={st.chkTxt}>{label}</Text>
  </Pressable>
);

/* الأنماط */
const st = StyleSheet.create({
  container:{flex:1,backgroundColor:DARK_NAVY},
  overlay:{...StyleSheet.absoluteFillObject,backgroundColor:'#00000088',
           justifyContent:'center',alignItems:'center',zIndex:10},
  ovTxt:{marginTop:12,color:BRAND_YELLOW,fontSize:16,fontWeight:'bold'},

  top:{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between',
       marginTop:8,paddingHorizontal:SIDE},
  logout:{backgroundColor:BRAND_RED,padding:6,borderRadius:18},
  back:{backgroundColor:BRAND_YELLOW,padding:6,borderRadius:18,marginStart:8},
  title:{flex:1,textAlign:'center',fontSize:18,fontWeight:'bold',color:BRAND_YELLOW},

  content:{paddingHorizontal:SIDE,paddingBottom:140,paddingTop:6},
  inWrap:{flexDirection:'row-reverse',alignItems:'center',backgroundColor:'#1a2a3c',
          borderRadius:16,padding:12,marginBottom:12},
  input:{flex:1,color:'#fff',fontSize:15,textAlign:'right'},

  detect:{flexDirection:'row-reverse',alignItems:'center',marginBottom:12},
  detectTxt:{color:'#00BFFF',fontSize:14,marginEnd:6},

  chk:{flexDirection:'row',alignItems:'center',marginBottom:20},
  chkTxt:{color:'#fff',fontSize:15,marginEnd:6},

  secTitle:{color:BRAND_YELLOW,fontWeight:'700',fontSize:16,marginBottom:6},

  hoursWrap:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',marginBottom:10},
  hour:{backgroundColor:'#1a2a3c',borderRadius:22,margin:6,paddingHorizontal:18,paddingVertical:8,
        borderWidth:1,borderColor:BRAND_YELLOW},
  hourSel:{backgroundColor:BRAND_YELLOW},
  hourTxt:{color:'#fff',fontWeight:'bold'},

  noHours:{
    color: BRAND_YELLOW,   // ⬅️ צהוב
    fontSize: 18,          // ⬅️ גדול יותר
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 14,
  },

  total:{fontSize:18,fontWeight:'700',color:BRAND_YELLOW,marginTop:40,marginBottom:10},
  sItem:{fontSize:14,color:'#ccc',textAlign:'left'},

  btn:{position:'absolute',left:SIDE,right:SIDE,bottom:28,borderRadius:32,overflow:'hidden'},
  btnGrad:{height:56,justifyContent:'center',alignItems:'center'},
  btnTxt:{fontSize:18,fontWeight:'bold',color:DARK_NAVY},
});
