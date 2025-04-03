import React from 'react';
import {Spinner} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';

export const BtnIndicator = () => (
  <View style={styles.indicator}>
    <Spinner size="small" status="control" />
  </View>
);

const styles = StyleSheet.create({
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
