import React from 'react';
import {View, StyleSheet} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../theme/ThemeContext';

export const WishlistButtonShimmer = ({size = 'small'}) => {
  const {theme, isDark} = useTheme();

  const shimmerColors = isDark
    ? [
        theme['color-shadcn-card'],
        theme['color-shadcn-secondary'],
        theme['color-shadcn-card'],
      ]
    : [
        theme['color-basic-200'],
        theme['color-basic-300'],
        theme['color-basic-200'],
      ];

  const buttonSize = size === 'small' ? 24 : 32;

  return (
    <View style={styles.container}>
      <ShimmerPlaceholder
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
        ]}
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
        shimmerStyle={{
          borderRadius: buttonSize / 2,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    // Size will be set dynamically
  },
});

