import React, {useState} from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
} from 'react-native';

import TicTacToe from './component/TicTacToe';
import SplashScreen from './component/SplashScreen';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSplashVisible, setSplashVisible] = useState(true);

  const handleSplashFinish = () => {
    setSplashVisible(false); // Hide splash when done
  };
  const backgroundStyle = {
    backgroundColor: '#1A1A2E',
  };

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={
          Platform.OS == 'ios'
            ? isDarkMode
              ? 'light-content'
              : 'dark-content'
            : 'light-content'
        }
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{
          backgroundColor: backgroundStyle.backgroundColor,
        }}>
        {isSplashVisible ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <TicTacToe />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
