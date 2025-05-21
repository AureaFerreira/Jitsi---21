// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RoleSelect from './src/screens/RoleSelect';
import LinkScreen from './src/screens/LinkScreen';

export type RootStackParamList = {
  RoleSelect: undefined;
  LinkScreen: { role: 'Paciente' | 'Psicólogo' };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelect">
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelect}
          options={{ title: 'Quem é você?' }}
        />
        <Stack.Screen
          name="LinkScreen"
          component={LinkScreen}
          options={{ title: 'Sua Teleconsulta' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
