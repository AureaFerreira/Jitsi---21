// src/screens/LinkScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'LinkScreen'>;

export default function LinkScreen({ navigation, route }: Props) {
  const { role } = route.params;

  // 1) Gera data/hora e nome da sala
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const displayDate = `${day}/${month}/${year}`;
  const displayTime = `${hour}:${min}`;

  const sessionName = `Sessao-${day}${month}${String(year).slice(-2)}_${hour}${min}`;
  const roomName = sessionName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_\.]/g, '-')
    .toLowerCase();

  const teleconsultaLink = `https://meet.jit.si/${roomName}`;

  // 2) Funções
  const copyToClipboard = () => {
    Clipboard.setString(teleconsultaLink);
    Alert.alert('Copiado', 'Link copiado para a área de transferência.');
  };

  const startCall = () => {
    navigation.navigate('VideoCall', { roomName, role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{`Olá, ${role}!`}</Text>

      {role === 'Paciente' && (
        <Text style={styles.sessionInfo}>
          {`Sessão ${displayDate} às ${displayTime}`}
        </Text>
      )}

      <View style={styles.linkContainer}>
        <Text style={styles.linkLabel}>Link da Sessão</Text>
        <Text
          style={styles.linkText}
          onPress={() => Linking.openURL(teleconsultaLink)}
        >
          {teleconsultaLink}
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={copyToClipboard}
        >
          <Text style={[styles.buttonText, styles.outlineText]}>
            Copiar Link
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSolid]}
          onPress={startCall}
        >
          <Text style={[styles.buttonText, styles.solidText]}>
            Iniciar Consulta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  sessionInfo: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#4B7BE5',
  },
  linkContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  linkLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  linkText: {
    fontSize: 16,
    color: '#4B7BE5',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4B7BE5',
    marginRight: 8,
  },
  buttonSolid: {
    backgroundColor: '#4B7BE5',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#4B7BE5',
  },
  solidText: {
    color: '#fff',
  },
});
