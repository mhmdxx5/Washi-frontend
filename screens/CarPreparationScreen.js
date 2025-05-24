/* CarPreparationOnboarding.js – ריווחים / RTL תואם / כפתורים אחידים */
import React, { useState } from 'react';
import {
  View, Text, Image, Pressable, SafeAreaView,
  StyleSheet, Dimensions, I18nManager,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon            from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const isRTL      = I18nManager.isRTL;

/* —— Assets —— */
const steps = [
  {
    image: require('../assets/carPreparation/step1.png'),
    title: 'افرغ السيارة',
    description: 'قم بإزالة جميع الأغراض الشخصية قبل بدء عملية الغسيل.',
  },
  {
    image: require('../assets/carPreparation/step2.png'),
    title: 'أغلق النوافذ والأبواب',
    description: 'تأكد أن جميع النوافذ والأبواب مغلقة بإحكام.',
  },
  {
    image: require('../assets/carPreparation/step3.png'),
    title: 'وفّر مكان وقوف مناسب',
    description: 'يرجى إيقاف السيارة في مكان يسهل الوصول إليه لتنفيذ الخدمة.',
  },
  {
    image: require('../assets/carPreparation/step4.png'),
    title: 'تحقق من توفر مصدر',
    description: 'في حال الحاجة، تأكد من توفر مصدر مياه أو كهرباء قريب.',
  },
];

/* —— Palette —— */
const BRAND_YELLOW = '#FFD700';
const BRAND_RED    = '#EF5350';
const DARK_NAVY    = '#0D1B2A';
const SIDE_PADDING = 18;

const CarPreparationOnboarding = ({ navigation }) => {
  const [idx,setIdx] = useState(0);

  const next = () => {
    if (idx < steps.length-1) setIdx(idx+1);
    else navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top-bar */}
      <View style={[styles.topBar,{flexDirection:isRTL?'row-reverse':'row'}]}>
        {/* Logout */}
        <Pressable style={styles.logoutBtn}
          onPress={()=>navigation.reset({index:0,routes:[{name:'Login'}]})}
          android_ripple={{color:'#ffffff22',radius:20}}>
          <Icon name="logout" size={18} color="#fff"/>
        </Pressable>

        <Text style={styles.title}>تحضير السيارة</Text>

        {/* Back */}
        <Pressable style={styles.backBtn}
          onPress={()=>navigation.goBack()}
          android_ripple={{color:'#00000022',radius:20}}>
          <Icon name={isRTL?'arrow-forward':'arrow-back'} size={20} color={DARK_NAVY}/>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animatable.View key={idx} animation="fadeIn" style={styles.card}>
          <Image source={steps[idx].image} style={styles.image} resizeMode="contain"/>
          <Text style={styles.stepTitle}>{steps[idx].title}</Text>
          <Text style={styles.desc}>{steps[idx].description}</Text>
        </Animatable.View>

        <Pressable style={styles.nextBtn} onPress={next}
                   android_ripple={{color:'#00000022',radius:30}}>
          <Text style={styles.nextTxt}>
            {idx === steps.length-1 ? 'ابدأ الآن' : 'التالي'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

/* —— Styles —— */
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:DARK_NAVY},

  topBar:{alignItems:'center',justifyContent:'space-between',
          paddingHorizontal:SIDE_PADDING,marginTop:8},
  backBtn:{backgroundColor:BRAND_YELLOW,padding:6,borderRadius:18},
  logoutBtn:{backgroundColor:BRAND_RED,padding:6,borderRadius:18,
             marginStart:8},
  title:{flex:1,textAlign:'center',fontSize:18,fontWeight:'bold',
         color:BRAND_YELLOW},

  content:{flex:1,justifyContent:'center',alignItems:'center',
           padding:SIDE_PADDING},
  card:{alignItems:'center',width:'100%'},
  image:{width:width*0.8,height:width*0.5,marginBottom:22},
  stepTitle:{color:BRAND_YELLOW,fontSize:22,fontWeight:'700',
             textAlign:'center',marginBottom:8},
  desc:{color:'#ccc',fontSize:16,textAlign:'center',
        lineHeight:24,paddingHorizontal:4},

  nextBtn:{backgroundColor:BRAND_YELLOW,paddingVertical:14,
           paddingHorizontal:50,borderRadius:30,marginTop:36},
  nextTxt:{fontSize:18,fontWeight:'bold',color:DARK_NAVY},
});

export default CarPreparationOnboarding;
