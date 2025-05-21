import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from 'react-native';

export default function VideoCall() {
  const [room, setRoom] = useState('');

  const startCall = () => {
    const roomId = room.trim();
    if (!roomId) {
      return Alert.alert('Oops', 'Digite o nome da sala antes de iniciar.');
    }
    const url = `https://meet.jit.si/${encodeURIComponent(roomId)}`;

    // Abre diretamente no navegador padrão ou app de intents
    Linking.openURL(url).catch((err) => {
      console.warn('Linking error:', err);
      Alert.alert(
        'Erro',
        'Não foi possível abrir a videochamada.' +
          (Platform.OS === 'android'
            ? '\nVerifique se há um navegador instalado no dispositivo.'
            : '')
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nome da Sala:</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: MinhaSalaSecreta"
          value={room}
          onChangeText={setRoom}
          autoCapitalize="none"
        />
        <Button
          title="Iniciar Videochamada"
          onPress={startCall}
          disabled={!room.trim()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
});
