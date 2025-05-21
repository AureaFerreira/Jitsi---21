// src/screens/RoleSelect.tsx
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type RoleSelectNavProp = StackNavigationProp<RootStackParamList, 'RoleSelect'>;

type Props = {
  navigation: RoleSelectNavProp;
};

export default function RoleSelect({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione seu papel:</Text>
      <View style={styles.button}>
        <Button
          title="Paciente"
          onPress={() => navigation.navigate('LinkScreen', { role: 'Paciente' })}
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Psicólogo"
          onPress={() => navigation.navigate('LinkScreen', { role: 'Psicólogo' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  button: { marginVertical: 8 },
});
