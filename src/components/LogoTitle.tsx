import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function LogoTitle() {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 40,
  },
});
