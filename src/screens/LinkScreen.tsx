// src/screens/LinkScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Clipboard,          // Se sua versão RN não suportar, use @react-native-clipboard/clipboard
  Alert,
  Linking,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type LinkScreenRouteProp = RouteProp<RootStackParamList, 'LinkScreen'>;

type Props = {
  route: LinkScreenRouteProp;
};

export default function LinkScreen({ route }: Props) {
  const { role } = route.params;

  // Exemplo de link fixo; no futuro você pode puxar de uma API
  const teleconsultaLink = 'https://meet.jit.si/SuaConsultaAqui';

  const copyToClipboard = () => {
    Clipboard.setString(teleconsultaLink);
    Alert.alert('Copiado', 'Link copiado para a área de transferência.');
  };

  const openLink = () => {
    Linking.openURL(teleconsultaLink).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {role === 'Paciente' ? 'Olá, paciente!' : 'Olá, psicólogo!'}
      </Text>
      <Text style={styles.instructions}>
        Este é o link da teleconsulta:
      </Text>
      <Text style={styles.link}>{teleconsultaLink}</Text>
      <View style={styles.buttons}>
        <View style={styles.button}>
          <Button title="Copiar Link" onPress={copyToClipboard} />
        </View>
        <View style={styles.button}>
          <Button title="Abrir Consulta" onPress={openLink} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  instructions: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  link: { fontSize: 14, color: 'blue', marginBottom: 24, textAlign: 'center' },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  button: { flex: 1, marginHorizontal: 8 },
});
