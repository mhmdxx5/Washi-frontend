// App.tsx
import React, { useEffect, useState } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import RNRestart from 'react-native-restart';

function App(): React.JSX.Element {
  const [rtlReady, setRtlReady] = useState(false);

  useEffect(() => {
    const enableRTL = async () => {
      if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        // חיוני: לא להמשיך לטעון את האפליקציה עד להפעלה מחדש
        // אם מופעל ב־debug, יש לטעון ידנית מחדש
        if (!__DEV__) {
          RNRestart.Restart(); // ודא שהתקנת את react-native-restart
        }
      } else {
        setRtlReady(true);
      }
    };
    enableRTL();
  }, []);

  if (!rtlReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1B2A' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return <RootNavigator />;
}

export default App;
