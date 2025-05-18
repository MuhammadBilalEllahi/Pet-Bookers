// ProductCardShimmer.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { width: windowWidth } = Dimensions.get('screen');
const SMALL_CARD_WIDTH = windowWidth * 0.42;

export const ProductCardShimmer = () => {
  return (
    <View style={styles.card}>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.image}
        delay={200}
        
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={styles.textLine}
        delay={200}
      />
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        delay={200}
        style={styles.textLineSmall}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SMALL_CARD_WIDTH,
    marginHorizontal: 4,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 4,
    marginBottom: 8,
  },
  textLine: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: 6,
  },
  textLineSmall: {
    width: '60%',
    height: 14,
    borderRadius: 4,
  },
});
