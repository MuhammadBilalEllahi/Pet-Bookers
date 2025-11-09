import React from 'react';
import {View, StyleSheet} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../theme/ThemeContext';

export const SellerInfoCardShimmer = () => {
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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
          borderColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
        },
      ]}>
      {/* Shop Header */}
      <View style={styles.header}>
        <ShimmerPlaceholder
          style={styles.shopImage}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
          shimmerStyle={styles.shopImageShimmer}
        />
        <View style={styles.headerText}>
          <ShimmerPlaceholder
            style={styles.shopName}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.sellerInfo}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </View>
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}
      />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}>
          <ShimmerPlaceholder
            style={styles.statNumber}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.statLabel}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </View>
        <View
          style={[
            styles.statBox,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-secondary']
                : theme['color-basic-200'],
            },
          ]}>
          <ShimmerPlaceholder
            style={styles.statNumber}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={styles.statLabel}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </View>
      </View>

      {/* Visit Store Button */}
      <ShimmerPlaceholder
        style={styles.button}
        LinearGradient={LinearGradient}
        shimmerColors={shimmerColors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 0,
    marginBottom: 16,
    marginTop: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  shopImageShimmer: {
    borderRadius: 24,
  },
  headerText: {
    flex: 1,
  },
  shopName: {
    width: 200,
    height: 16,
    borderRadius: 4,
    marginBottom: 10,
  },
  sellerInfo: {
    width: 150,
    height: 14,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 6,
    paddingVertical: 12,
  },
  statNumber: {
    width: 40,
    height: 28,
    borderRadius: 4,
    marginBottom: 8,
  },
  statLabel: {
    width: 60,
    height: 15,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 45,
    borderRadius: 8,
    marginTop: 2,
  },
});

