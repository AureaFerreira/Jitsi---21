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
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WebView, WebViewPermissionRequest } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoCall'>;

export default function VideoCall({ route, navigation }: Props) {
  const { roomName } = route.params;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  // estados:
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [granted, setGranted]         = useState(false);
  const [checking, setChecking]       = useState(true);

  // 1) pedir permissões no Android
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const res = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        const okCam = res[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted';
        const okMic = res[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted';
        if (!okCam || !okMic) {
          Alert.alert(
            'Permissões necessárias',
            'Precisamos de câmera e microfone para a videochamada.',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => navigation.goBack() },
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

  // 2) enquanto verifica permissões
  if (checking) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!granted) {
    return (
      <View style={styles.loader}>
        <Text style={styles.infoText}>
          Para continuar, habilite Câmera e Microfone nas configurações do app.
        </Text>
      </View>
    );
  }

  // 3) se ainda não aceitou termos, exibe a tela de termos
  if (!acceptedTerms) {
    return (
      <View style={styles.termsContainer}>
        <Text style={styles.termsTitle}>Termos e Condições</Text>
        <ScrollView style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            • Esta sessão de teleconsulta será gravada para fins de registro clínico.{"\n\n"}
            • As gravações serão armazenadas com acesso restrito e usadas somente pela equipe responsável.{"\n\n"}
            • Você pode solicitar a exclusão ou cópia da gravação a qualquer momento, conforme a política de privacidade.{"\n\n"}
            • Ao concordar, você autoriza o uso e armazenamento desta gravação.{"\n\n"}
            • Todas as informações aqui tratadas são confidenciais e protegidas pelo Código de Ética Profissional.
          </Text>
        </ScrollView>
        <View style={styles.termsButtons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnDecline]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnText}>Recusar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnAccept]}
            onPress={() => setAcceptedTerms(true)}
          >
            <Text style={[styles.btnText, { color: '#fff' }]}>Aceitar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 4) finalmente, renderiza o WebView com Jitsi
  return (
    <WebView
      source={{ uri: jitsiUrl }}
      style={styles.webview}
      javaScriptEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      onPermissionRequest={(event: WebViewPermissionRequest) => {
        event.grant(event.resources);
      }}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // termos
  termsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  termsTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  termsTextContainer: {
    flex: 1,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
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
  btnDecline: {
    backgroundColor: '#eee',
    marginRight: 8,
  },
  btnAccept: {
    backgroundColor: '#4B7BE5',
    marginLeft: 8,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
