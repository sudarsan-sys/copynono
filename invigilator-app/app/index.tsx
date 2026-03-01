import { useEffect, useRef, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    View,
    Text,
    BackHandler,
    Platform,
    Linking,
} from 'react-native';
import { WEB_APP_URL } from '../config';

// WebView is native-only — import conditionally
let WebView: any = null;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').default;
}

export default function HomeScreen() {
    const webViewRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // On web platform, redirect straight to the React web app
    useEffect(() => {
        if (Platform.OS === 'web') {
            window.location.href = WEB_APP_URL;
        }
    }, []);

    // Android hardware back button → navigate back in WebView
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const onBackPress = () => {
            if (webViewRef.current) {
                webViewRef.current.goBack();
                return true; // prevent default (exit app)
            }
            return false;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []);

    // Web platform — show a simple redirect message while navigating
    if (Platform.OS === 'web') {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#4361ee" />
                <Text style={styles.loaderText}>Redirecting to ExamGuard…</Text>
            </SafeAreaView>
        );
    }

    // Error state (native only)
    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={styles.errorTitle}>Cannot reach ExamGuard</Text>
                <Text style={styles.errorSub}>
                    Make sure the web app is running at:{'\n'}
                    {WEB_APP_URL}
                </Text>
                <Text
                    style={styles.retry}
                    onPress={() => {
                        setError(false);
                        setLoading(true);
                    }}
                >
                    Tap to Retry
                </Text>
            </SafeAreaView>
        );
    }

    // Native — full-screen WebView
    return (
        <SafeAreaView style={styles.container}>
            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#4361ee" />
                    <Text style={styles.loaderText}>Loading ExamGuard…</Text>
                </View>
            )}
            {WebView && (
                <WebView
                    ref={webViewRef}
                    source={{ uri: WEB_APP_URL }}
                    style={styles.webview}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => setError(true)}
                    onHttpError={() => setError(true)}
                    javaScriptEnabled
                    domStorageEnabled
                    startInLoadingState={false}
                    allowsBackForwardNavigationGestures
                    mediaCapturePermissionGrantType="grant"
                    allowsInlineMediaPlayback
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    webview: {
        flex: 1,
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        zIndex: 10,
    },
    loaderText: {
        marginTop: 12,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 24,
    },
    errorTitle: {
        color: '#ff6b6b',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    errorSub: {
        color: '#aaa',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    retry: {
        marginTop: 24,
        color: '#4361ee',
        fontSize: 16,
        fontWeight: '600',
    },
});
