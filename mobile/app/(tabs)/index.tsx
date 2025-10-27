import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Alert, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONFIG } from '../../config';
import SplashScreen from '../components/SplashScreen';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');

  // Minimum splash screen time (3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Hide splash only when both conditions are met
  useEffect(() => {
    if (webViewLoaded && minTimeElapsed) {
      setShowSplash(false);
    }
  }, [webViewLoaded, minTimeElapsed]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setWebViewLoaded(true);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setHasError(true);
    setIsLoading(false);
    Alert.alert(
      'Connection Error',
      `Unable to connect to AREA app at ${CONFIG.WEB_URL}\n\nError: ${nativeEvent.description || 'Unknown error'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Render WebView in background to preload while splash is showing */}
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {hasError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Failed</Text>
            <Text style={styles.errorText}>
              Cannot connect to AREA web app at {CONFIG.WEB_URL}
            </Text>
            <Text style={styles.errorHint}>
              check if your frontend server is running and accessible.
            </Text>
          </View>
        ) : (
          <WebView
            source={{ uri: CONFIG.WEB_URL }}
            style={[styles.webview, { width: width }]}
            scalesPageToFit={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={(syntheticEvent) => {
              console.warn('HTTP Error:', syntheticEvent.nativeEvent);
            }}
            allowsBackForwardNavigationGestures={true}
            mixedContentMode="compatibility"
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            bounces={false}
            injectedJavaScript={`
              document.body.style.overflowX = 'hidden';
              document.documentElement.style.overflowX = 'hidden';
              const meta = document.createElement('meta');
              meta.name = 'viewport';
              meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
              document.getElementsByTagName('head')[0].appendChild(meta);
              document.body.style.maxWidth = '100vw';
              document.body.style.width = '100%';
              true;
            `}
          />
        )}
      </View>

      {/* Show splash screen overlay while loading */}
      {showSplash && (
        <View style={styles.splashOverlay}>
          <SplashScreen onFinished={handleSplashFinish} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
