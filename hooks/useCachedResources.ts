import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...FontAwesome.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
          'mona-black': require('../assets/fonts/Mona-Sans-Black.ttf'),
          'mona-bold': require('../assets/fonts/Mona-Sans-Bold.ttf'),
          'mona-extraBold': require('../assets/fonts/Mona-Sans-ExtraBold.ttf'),
          'mona-light': require('../assets/fonts/Mona-Sans-Light.ttf'),
          'mona-medium': require('../assets/fonts/Mona-Sans-Medium.ttf'),
          'mona-regular': require('../assets/fonts/Mona-Sans-Regular.ttf'),
          'mona-semiBold': require('../assets/fonts/Mona-Sans-SemiBold.ttf'),
          'mona-ultraLight': require('../assets/fonts/Mona-Sans-UltraLight.ttf'),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        await SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync().then(() => console.log("Resources loaded"));
  }, []);

  return isLoadingComplete;
}
