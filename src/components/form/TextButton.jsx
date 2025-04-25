import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text, Icon } from '@ui-kitten/components';

const TextButton = ({ title, onPress, style, textStyle, iconName , iconNameRight}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      {iconName && (
        <Icon
          name={iconName}
          style={styles.icon}
          fill='#27AE60'
        />
      )}
      <Text style={[styles.text, textStyle]}>{title}</Text>
      {iconNameRight && (
        <Icon
          name={iconNameRight}
          style={styles.icon}
          fill='#27AE60'
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  text: {
    color: '#27AE60',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TextButton;
