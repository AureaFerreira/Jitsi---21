// src/screens/VideoCall.tsx

import React, { useEffect, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoCall'>;

// Defina a URL correta da sua API
const BACKEND_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

export default function VideoCall({ route, navigation }: Props) {
  const { roomName, role } = route.params;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  const [checking, setChecking] = useState(true);
  const [granted, setGranted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  // 1) Permissões Android
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
            'Permissões necessárias',
            'Precisamos de câmera e microfone.',
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

  if (checking) return <FullLoader />;
  if (!granted) return <PermissionDenied />;
  if (!acceptedTerms) {
    return (
      <TermsView
        onAccept={() => setAcceptedTerms(true)}
        onDecline={() => navigation.goBack()}
      />
    );
  }

  // 2) Chama o FastAPI e busca os resultados
  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      console.log('➡️ Fazendo request para', `${BACKEND_URL}/analyze-webcam`);
      const res = await fetch(`${BACKEND_URL}/analyze-webcam`);
      console.log('⬅️ Status da resposta:', res.status);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      console.log('⬅️ JSON recebido:', json);
      setAnalysisResults(json.analysis || []);
      Alert.alert('Análise concluída', `Recebemos ${json.analysis.length} frames.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro na análise', String(e));
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão de análise apenas para Psicólogo */}
      {role === 'Psicólogo' && (
        <View style={styles.analysisContainer}>
          <TouchableOpacity
            style={styles.analysisButton}
            onPress={handleAnalyze}
            disabled={loadingAnalysis}
          >
            {loadingAnalysis ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.analysisButtonText}>Analisar Expressão</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Exibição dos resultados */}
      {analysisResults.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          {analysisResults.map((item, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>Segundo:</Text> {item.second}
              </Text>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>Dominante:</Text> {item.dominant_emotion}
              </Text>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>Detalhes:</Text> {JSON.stringify(item.emotions)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* WebView com Jitsi */}
      <WebView
        source={{ uri: jitsiUrl }}
        style={styles.webview}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        renderLoading={() => <FullLoader />}
      />
    </View>
  );
}

// Componentes auxiliares
const FullLoader = () => (
  <View style={styles.fullLoader}>
    <ActivityIndicator size="large" color="#4B7BE5" />
  </View>
);

const PermissionDenied = () => (
  <View style={styles.fullLoader}>
    <Text style={styles.infoText}>
      Habilite câmera e microfone nas configurações.
    </Text>
  </View>
);

const TermsView = ({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) => (
  <View style={styles.termsContainer}>
    <Text style={styles.termsTitle}>Termos e Condições</Text>
    <Text style={styles.termsText}>
      • Esta sessão será gravada para fins de registro clínico.{'\n\n'}
      • Gravações restritas à equipe responsável.{'\n\n'}
      • Solicite exclusão a qualquer momento.{'\n\n'}
      • Ao concordar, autoriza armazenamento desta gravação.{'\n\n'}
      • Todas as informações são confidenciais.
    </Text>
    <View style={styles.termsButtons}>
      <TouchableOpacity style={[styles.btn, styles.btnDecline]} onPress={onDecline}>
        <Text style={styles.btnText}>Recusar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={onAccept}>
        <Text style={[styles.btnText, { color: '#fff' }]}>Aceitar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },

  fullLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { textAlign: 'center', color: '#666' },

  termsContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  termsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDecline: { backgroundColor: '#eee', marginRight: 8 },
  btnAccept: { backgroundColor: '#4B7BE5', marginLeft: 8 },
  btnText: { fontSize: 16, fontWeight: '600' },

  analysisContainer: {
    padding: 12,
    backgroundColor: '#eef4fb',
    alignItems: 'center',
  },
  analysisButton: {
    backgroundColor: '#4B7BE5',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  analysisButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  resultsContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    padding: 12,
  },
  resultItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
});
