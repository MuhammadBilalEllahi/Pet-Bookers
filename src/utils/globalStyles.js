import {StyleSheet} from 'react-native';

export const spacingStyles = StyleSheet.create({
  p8: {padding: 8},
  p16: {padding: 16},
  px16: {paddingHorizontal: 16},
  py8: {paddingVertical: 8},
});

export const flexeStyles = StyleSheet.create({
  row: {flexDirection: 'row'},
  grow1: {flexGrow: 1},
  itemsCenter: {alignItems: 'center'},
  contentBetween: {justifyContent: 'space-between'},
  contentCenter: {justifyContent: 'center'},
});
