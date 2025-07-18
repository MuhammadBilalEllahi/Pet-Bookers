import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '@ui-kitten/components';
import { useTheme } from '../theme/ThemeContext';

export const StarRating = ({ 
  rating, 
  onRatingChange, 
  size = 24, 
  maxRating = 5, 
  readonly = false,
  activeColor = '#FFD700',
  inactiveColor = '#E0E0E0'
}) => {
  const { theme, isDark } = useTheme();

  const handleStarPress = (selectedRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const isActive = starValue <= rating;
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStarPress(starValue)}
        disabled={readonly}
        style={styles.starContainer}
      >
        <Icon
          name={isActive ? 'star' : 'star-outline'}
          width={size}
          height={size}
          fill={isActive ? activeColor : inactiveColor}
          style={styles.star}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginRight: 4,
  },
  star: {
    // Additional styling if needed
  },
}); 