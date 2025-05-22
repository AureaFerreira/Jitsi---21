// src/screens/VideoCall.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoCall'>;

export default function VideoCall({ route, navigation }: Props) {
  const { roomName, role } = route.params;
  const webviewRef = useRef<WebView>(null);

  const [checking, setChecking] = useState(true);
  const [granted, setGranted] = useState(false);
  const [acceptedTerms, setAccepted] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [latestExp, setLatestExp] = useState<string>('—');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Android permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const res = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          res[PermissionsAndroid.PERMISSIONS.CAMERA] !== 'granted' ||
          res[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== 'granted'
        ) {
          Alert.alert(
            'Permissões',
            'Precisamos de câmera e microfone',
            [
              { text: 'Cancelar', onPress: () => navigation.goBack(), style: 'cancel' },
              { text: 'Configurações', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }
      setGranted(true);
      setChecking(false);
    })();
  }, [navigation]);

  // Call API to analyze webcam
  const callAnalysisApi = async () => {
    try {
      const response = await fetch('http:// 192.168.17.1:8000/analyze-webcam');
      const data = await response.json();
      setApiResponse(data);
      console.log('API Response:', data);
      
      // Get the most frequent emotion
      if (data.analysis && data.analysis.length > 0) {
        const emotions = data.analysis.map((item: any) => item.dominant_emotion);
        const mostFrequent = emotions.reduce((a: string, b: string) => 
          emotions.filter((v: string) => v === a).length >= 
          emotions.filter((v: string) => v === b).length ? a : b
        );
        setLatestExp(mostFrequent);
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Erro', 'Não foi possível conectar à API de análise');
    }
  };

  if (checking) return <Loader />;
  if (!granted) return <Denied />;
  if (!acceptedTerms) {
    return (
      <TermsScreen
        onAccept={() => setAccepted(true)}
        onDecline={() => navigation.goBack()}
      />
    );
  }

  // Face-api.js injection code
  const injection = `
    console.log('▶️ face-api: começando injeção');
    if (!window.__faceapi_loaded) {
      window.__faceapi_loaded = true;
      (async () => {
        console.log('⏳ face-api: carregando script externo');
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/face-api.js';
        document.head.appendChild(s);
        await new Promise(r => s.onload = r);
        console.log('✅ face-api: library carregada');

        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
        console.log('⏳ face-api: carregando modelos');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        console.log('✅ face-api: modelos carregados');

        // espera vídeo remoto
        console.log('⏳ face-api: aguardando vídeo remoto');
        const remote = await new Promise(r => {
          const iv = setInterval(() => {
            const vids = document.querySelectorAll('video');
            if (vids.length > 1 && vids[1].readyState === 4) {
              clearInterval(iv); r(vids[1]);
            }
          }, 500);
        });
        console.log('✅ face-api: vídeo remoto pronto');

        const canvas = faceapi.createCanvasFromMedia(remote);
        canvas.style.opacity = '0';
        document.body.appendChild(canvas);
        faceapi.matchDimensions(canvas, {
          width: remote.videoWidth,
          height: remote.videoHeight,
        });

        let intervalId = null;
        window.startAnalysis = () => {
          if (intervalId) return;
          console.log('▶️ face-api: análise iniciada');
          intervalId = setInterval(async () => {
            try {
              const det = await faceapi
                .detectSingleFace(remote, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();
              if (det && det.expressions) {
                const top = Object.entries(det.expressions)
                  .sort((a,b)=>b[1]-a[1])[0][0];
                console.log('🎯 face-api: detectou', top);
                window.ReactNativeWebView.postMessage(top);
              }
            } catch (err) {
              console.error('❌ face-api erro:', err);
            }
          }, 2000);
        };
        window.stopAnalysis = () => {
          clearInterval(intervalId);
          intervalId = null;
          console.log('⏹️ face-api: análise parada');
        };
      })();
    } else {
      console.log('ℹ️ face-api: já carregado');
    }
    true;
  `;

  const onLoadEnd = () => {
    setTimeout(() => {
      webviewRef.current?.injectJavaScript(injection);
    }, 500);
  };

  const onMessage = (e: WebViewMessageEvent) => {
    console.log('[RN] expressão recebida:', e.nativeEvent.data);
    setLatestExp(e.nativeEvent.data);
  };

  const toggleAnalysis = () => {
    if (!analyzing) {
      // Choose one method:
      // 1. For face-api.js (in-app analysis)
      webviewRef.current?.injectJavaScript(`window.startAnalysis();`);
      
      // 2. For API analysis (uncomment to use)
      // callAnalysisApi();
    } else {
      webviewRef.current?.injectJavaScript(`window.stopAnalysis();`);
      setLatestExp('—');
    }
    setAnalyzing(!analyzing);
  };

  return (
    <View style={S.container}>
      {role === 'Psicólogo' && (
        <View style={S.bar}>
          <Text style={S.barText}>Expressão: {latestExp}</Text>
          <TouchableOpacity style={S.btn} onPress={toggleAnalysis}>
            <Text style={S.btnText}>
              {analyzing ? 'Parar Análise' : 'Analisar Expressão'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {apiResponse && (
        <View style={S.apiResults}>
          <Text style={S.apiTitle}>Resultado da API:</Text>
          {apiResponse.analysis.map((item: any, index: number) => (
            <Text key={index} style={S.apiText}>
              {item.second}s: {item.dominant_emotion}
            </Text>
          ))}
        </View>
      )}
      
      <WebView
        ref={webviewRef}
        source={{ uri: `https://meet.jit.si/${roomName}` }}
        style={S.webview}
        onLoadEnd={onLoadEnd}
        onMessage={onMessage}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        renderLoading={() => <Loader />}
      />
    </View>
  );
}

// Helper components
const Loader = () => (
  <View style={S.loader}>
    <ActivityIndicator size="large" color="#4B7BE5" />
  </View>
);

const Denied = () => (
  <View style={S.loader}>
    <Text style={{ color:'#666' }}>Permissões negadas.</Text>
  </View>
);

const TermsScreen = ({ onAccept, onDecline }: {onAccept:()=>void; onDecline:()=>void}) => (
  <View style={S.terms}>
    <Text style={S.title}>Termos e Condições</Text>
    <Text style={S.text}>
      • Esta sessão será gravada.{'\n\n'}
      • Gravações restritas à equipe.{'\n\n'}
      • Solicite exclusão a qualquer momento.{'\n\n'}
      • Confidencialidade garantida.
    </Text>
    <View style={S.termsBtns}>
      <TouchableOpacity style={[S.btn, { backgroundColor:'#eee' }]} onPress={onDecline}>
        <Text style={S.btnText}>Recusar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[S.btn, { backgroundColor:'#4B7BE5' }]} onPress={onAccept}>
        <Text style={[S.btnText, { color:'#fff' }]}>Aceitar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Styles
const S = StyleSheet.create({
  container: { flex:1 },
  webview: { flex:1 },
  loader: { flex:1, justifyContent:'center', alignItems:'center' },

  bar: { 
    padding:12, 
    backgroundColor:'#eef4fb', 
    flexDirection:'row', 
    alignItems:'center', 
    justifyContent:'space-between' 
  },
  barText: { fontSize:16, fontWeight:'600' },
  btn: { 
    paddingVertical:8, 
    paddingHorizontal:16, 
    backgroundColor:'#4B7BE5', 
    borderRadius:20 
  },
  btnText: { color:'#fff', fontSize:14, fontWeight:'600' },

  terms: { flex:1, padding:24, justifyContent:'center', backgroundColor:'#fff' },
  title: { fontSize:22, fontWeight:'700', textAlign:'center', marginBottom:16 },
  text: { fontSize:16, lineHeight:24, color:'#333', marginBottom:24 },
  termsBtns: { flexDirection:'row', justifyContent:'space-between' },
  
  apiResults: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  apiTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  apiText: {
    fontSize: 12,
    color: '#555',
  },
});