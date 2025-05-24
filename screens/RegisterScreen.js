import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ScrollView,
  SafeAreaView, ActivityIndicator,
  I18nManager, Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const BRAND_YELLOW='#FFD700';
const BRAND_NAVY  ='#0D1B2A';
const API_BASE    ='https://carwashbackend-qhon.onrender.com/api';

const RegisterScreen = ({ navigation }) => {
  const [loading,setLoading]=useState(false);
  const [error,  setError]=useState('');

  useEffect(()=>{
    if(Platform.OS==='android'||Platform.OS==='ios'){
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  },[]);

  const schema = Yup.object().shape({
    name    : Yup.string().required('الاسم مطلوب'),
    email   : Yup.string().transform(v=>v?.toLowerCase().trim())
                 .email('البريد الإلكتروني غير صالح')
                 .required('البريد الإلكتروني مطلوب'),
    password: Yup.string().min(6,'يجب أن تكون كلمة المرور 6 أحرف على الأقل')
                 .required('كلمة المرور مطلوبة'),
  });

  const onRegister = async ({ name,email,password })=>{
    setLoading(true); setError('');
    try{
      await axios.post(`${API_BASE}/users/register`,
        { name, email:email.toLowerCase().trim(), password });
      navigation.navigate('Login');
    }catch(e){
      setError(e?.response?.data?.message||'حدث خطأ أثناء التسجيل');
    }finally{ setLoading(false); }
  };

  return(
    <SafeAreaView style={styles.container}>
      {loading&&(
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BRAND_YELLOW}/>
          <Text style={styles.loadingText}>يتم إنشاء الحساب... الرجاء الانتظار</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Image source={require('../assets/yellocar.png')} style={styles.carImage}/>
        <Text style={styles.headerText}>أنشئ حسابك</Text>

        <View style={styles.formContainer}>
          <Formik initialValues={{ name:'',email:'',password:'' }}
                  validationSchema={schema} onSubmit={onRegister}>
            {({ handleChange, handleSubmit, values, errors, touched })=>(
              <>
                {/* الاسم */}
                <View style={styles.inputWrapper}>
                  <Icon name="person" size={20} color="#fff" style={styles.icon}/>
                  <TextInput style={styles.input} placeholder="الاسم"
                    placeholderTextColor="#ccc" onChangeText={handleChange('name')}
                    value={values.name}/>
                </View>
                {touched.name&&errors.name&&<Text style={styles.error}>{errors.name}</Text>}

                {/* البريد */}
                <View style={styles.inputWrapper}>
                  <Icon name="email" size={20} color="#fff" style={styles.icon}/>
                  <TextInput style={styles.input} placeholder="البريد الإلكتروني"
                    placeholderTextColor="#ccc" keyboardType="email-address"
                    autoCapitalize="none" onChangeText={handleChange('email')}
                    value={values.email}/>
                </View>
                {touched.email&&errors.email&&<Text style={styles.error}>{errors.email}</Text>}

                {/* كلمة المرور */}
                <View style={styles.inputWrapper}>
                  <Icon name="lock" size={20} color="#fff" style={styles.icon}/>
                  <TextInput style={styles.input} placeholder="كلمة المرور"
                    placeholderTextColor="#ccc" secureTextEntry
                    onChangeText={handleChange('password')}
                    value={values.password}/>
                </View>
                {touched.password&&errors.password&&<Text style={styles.error}>{errors.password}</Text>}
                {error&&<Text style={styles.error}>{error}</Text>}

                <TouchableOpacity style={styles.regButton} onPress={handleSubmit}>
                  <Text style={styles.regText}>تسجيل</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

/* ـــــ الأنماط ـــــ */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:BRAND_NAVY },
  scrollContainer:{ alignItems:'center', justifyContent:'center',
                    paddingHorizontal:20, paddingTop:50, paddingBottom:40 },
  carImage:{ width:200, height:270, marginBottom:20 },
  headerText:{ fontSize:24, fontWeight:'bold', color:'#fff', marginBottom:20 },
  formContainer:{ width:'100%', backgroundColor:'#1a2a3c',
                  borderRadius:20, padding:20 },
  inputWrapper:{ flexDirection:'row-reverse', alignItems:'center',
                 backgroundColor:'#ffffff20', borderRadius:25,
                 paddingHorizontal:15, marginBottom:15 },
  icon:{ marginLeft:10 },
  input:{ flex:1, height:45, color:'#fff', textAlign:'right' },
  error:{ color:'salmon', marginBottom:10, textAlign:'right' },
  regButton:{ backgroundColor:BRAND_YELLOW, paddingVertical:12,
              borderRadius:30, alignItems:'center', marginVertical:15 },
  regText:{ color:'#000', fontWeight:'bold', fontSize:16 },
  loginLink:{ color:'#00BFFF', textAlign:'center', fontSize:16 },
  loadingOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor:'#00000088',
                   justifyContent:'center', alignItems:'center', zIndex:10 },
  loadingText:{ marginTop:12, color:BRAND_YELLOW, fontSize:16, fontWeight:'bold' },
});
