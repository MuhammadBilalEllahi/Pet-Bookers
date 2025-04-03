import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {Icon, useTheme} from '@ui-kitten/components';

export const ThemedIcon = ({name, fill, status, iconStyle}) => {
  const theme = useTheme();
  const iconFill = useMemo(() => {
    if (fill) return fill;
    if (status) {
      return status === 'primary'
        ? theme['color-primary-default']
        : theme[status];
    }
    return theme['text-hint-color'];
  }, []);

  return (
    <Icon style={[styles.icon, {...iconStyle}]} fill={iconFill} name={name} />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
});
