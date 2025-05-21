// src/screens/LinkScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type RouteP  = RouteProp<RootStackParamList, 'LinkScreen'>;
type NavProp = StackNavigationProp<RootStackParamList, 'LinkScreen'>;

export default function LinkScreen({ route }: { route: RouteP }) {
  const { role } = route.params;
  const navigation = useNavigation<NavProp>();
  const [password, setPassword] = useState('');

  // Gera roomName curto e único
  const roomName = useMemo(() => {
    const now = new Date();
    const stamp = now.getTime().toString().slice(-6);
    return `${role}-${stamp}`;
  }, [role]);

  // Formata data e hora
  const { date, time } = useMemo(() => {
    const d = new Date();
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  }, []);

  const startCall = () => {
    navigation.navigate('VideoCall', { roomName, password, role });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Cabeçalho com data e hora */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{date}</Text>
        <Text style={styles.headerTime}>{time}</Text>
      </View>

      <Text style={styles.title}>Olá, {role}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome da sala</Text>
        <Text style={styles.room}>{roomName}</Text>

        <Text style={styles.label}>Senha (o Psicólogo define)</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Defina uma senha"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, !password && styles.buttonDisabled]}
          onPress={startCall}
          disabled={!password}
        >
          <Text style={styles.buttonText}>Iniciar Consulta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 24, justifyContent: 'flex-start' },
  header:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  headerDate:{ fontSize: 16, color: '#666' },
  headerTime:{ fontSize: 16, color: '#666' },
  title:     { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#333' },
  card:      { backgroundColor: '#fff', borderRadius: 12, padding: 20,
               shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
               shadowRadius: 6, elevation: 4 },
  label:     { fontSize: 14, color: '#666', marginTop: 12, marginBottom: 6, fontWeight: '500' },
  room:      { fontSize: 16, color: '#4B7BE5', fontWeight: '600', marginBottom: 12 },
  input:     { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16 },
  button:    { marginTop: 24, backgroundColor: '#4B7BE5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#A0BFF9' },
  buttonText:{ color: '#fff', fontSize: 16, fontWeight: '600' },
});
