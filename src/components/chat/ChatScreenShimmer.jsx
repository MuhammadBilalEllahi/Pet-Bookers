import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';

const {width: screenWidth} = Dimensions.get('window');

const ChatItemShimmer = () => {
  const {theme, isDark} = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const baseColor = isDark ? '#2D2D2D' : '#E5E5E5';
  const shimmerColor = isDark ? '#3D3D3D' : '#F0F0F0';

  return (
    <View
      style={[
        styles.chatItem,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
        },
      ]}>
      {/* Profile Image Shimmer */}
      <View
        style={[styles.profileImageContainer, {backgroundColor: baseColor}]}>
        <Animated.View
          style={[
            styles.profileImageShimmer,
            {
              backgroundColor: shimmerColor,
              opacity: shimmerOpacity,
            },
          ]}
        />
      </View>

      {/* Content Shimmer */}
      <View style={styles.contentContainer}>
        {/* Title Shimmer */}
        <View style={[styles.titleContainer, {backgroundColor: baseColor}]}>
          <Animated.View
            style={[
              styles.titleShimmer,
              {
                backgroundColor: shimmerColor,
                opacity: shimmerOpacity,
              },
            ]}
          />
        </View>

        {/* Subtitle Shimmer */}
        <View style={[styles.subtitleContainer, {backgroundColor: baseColor}]}>
          <Animated.View
            style={[
              styles.subtitleShimmer,
              {
                backgroundColor: shimmerColor,
                opacity: shimmerOpacity,
              },
            ]}
          />
        </View>

        {/* Message Shimmer */}
        <View style={[styles.messageContainer, {backgroundColor: baseColor}]}>
          <Animated.View
            style={[
              styles.messageShimmer,
              {
                backgroundColor: shimmerColor,
                opacity: shimmerOpacity,
              },
            ]}
          />
        </View>
      </View>

      {/* Right Side Info */}
      <View style={styles.rightContainer}>
        {/* Time Shimmer */}
        <View style={[styles.timeContainer, {backgroundColor: baseColor}]}>
          <Animated.View
            style={[
              styles.timeShimmer,
              {
                backgroundColor: shimmerColor,
                opacity: shimmerOpacity,
              },
            ]}
          />
        </View>

        {/* Status Icon Shimmer */}
        <View style={[styles.statusContainer, {backgroundColor: baseColor}]}>
          <Animated.View
            style={[
              styles.statusShimmer,
              {
                backgroundColor: shimmerColor,
                opacity: shimmerOpacity,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export const ChatScreenShimmer = () => {
  const {theme, isDark} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      {/* Tab Bar Shimmer */}
      <View style={styles.tabBarContainer}>
        {[1, 2, 3].map(index => (
          <View key={index} style={styles.tabShimmer}>
            <View
              style={[
                styles.tabTextShimmer,
                {backgroundColor: isDark ? '#2D2D2D' : '#E5E5E5'},
              ]}
            />
            {index === 1 && (
              <View
                style={[
                  styles.tabUnderlineShimmer,
                  {backgroundColor: theme['color-primary-500']},
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Chip Row Shimmer */}
      <View style={styles.chipRowContainer}>
        {[1, 2, 3].map(index => (
          <View
            key={index}
            style={[
              styles.chipShimmer,
              {
                backgroundColor:
                  index === 1
                    ? theme['color-primary-500']
                    : isDark
                    ? '#2D2D2D'
                    : '#E5E5E5',
              },
            ]}
          />
        ))}
      </View>

      {/* Chat Items Shimmer */}
      <View style={styles.chatListContainer}>
        {[1, 2, 3, 4, 5, 6].map(index => (
          <ChatItemShimmer key={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  tabShimmer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabTextShimmer: {
    width: 60,
    height: 16,
    borderRadius: 8,
  },
  tabUnderlineShimmer: {
    height: 3,
    width: '80%',
    marginTop: 4,
    borderRadius: 2,
  },
  chipRowContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 5,
  },
  chipShimmer: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    width: 80,
    height: 28,
  },
  chatListContainer: {
    marginTop: 10,
    marginHorizontal: 10,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    overflow: 'hidden',
  },
  profileImageShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleContainer: {
    height: 18,
    borderRadius: 9,
    marginBottom: 6,
    overflow: 'hidden',
    width: '60%',
  },
  titleShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 9,
  },
  subtitleContainer: {
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
    overflow: 'hidden',
    width: '40%',
  },
  subtitleShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  messageContainer: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    width: '80%',
  },
  messageShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
  },
  timeContainer: {
    height: 12,
    width: 40,
    borderRadius: 6,
    overflow: 'hidden',
  },
  timeShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  statusContainer: {
    height: 16,
    width: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusShimmer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
