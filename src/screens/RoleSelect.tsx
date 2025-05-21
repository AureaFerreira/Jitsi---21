// src/screens/RoleSelect.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type NavProp = StackNavigationProp<RootStackParamList, 'RoleSelect'>;

export default function RoleSelect({ navigation }: { navigation: NavProp }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quem é você?</Text>
      <TouchableOpacity
        style={[styles.card, styles.patientCard]}
        onPress={() => navigation.navigate('LinkScreen', { role: 'Paciente' })}
      >
        <Text style={styles.cardText}>Paciente</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.card, styles.psyCard]}
        onPress={() => navigation.navigate('LinkScreen', { role: 'Psicólogo' })}
      >
        <Text style={styles.cardText}>Psicólogo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#F5F7FA', justifyContent:'center', alignItems:'center', padding:24 },
  title:       { fontSize:24, fontWeight:'700', marginBottom:32, color:'#333' },
  card:        { width:'100%', padding:20, borderRadius:12, marginVertical:8, alignItems:'center',
                 shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{x:0,y:4}, shadowRadius:6, elevation:3 },
  patientCard: { backgroundColor:'#E8F0FE' },
  psyCard:     { backgroundColor:'#CCE8FF' },
  cardText:    { fontSize:18, fontWeight:'600', color:'#4B7BE5' },
});
