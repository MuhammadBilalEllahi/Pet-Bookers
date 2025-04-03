import {Text} from '@ui-kitten/components';
import {View} from 'react-native';
import {flexeStyles} from '../utils/globalStyles';

export const Price = ({amount, cross}) => {
  return cross ? (
    <Text
      style={[
        flexeStyles.row,
        {
          alignItems: 'baseline',
          textDecorationLine: 'line-through',
        },
      ]}>
      <Text category="label" appearance="hint">
        PKR
      </Text>
      <Text category="p1" appearance="hint">
        {amount}
      </Text>
    </Text>
  ) : (
    <Text
      style={[
        flexeStyles.row,
        {
          alignItems: 'baseline',
        },
      ]}>
      <Text category="label" status={'primary'}>
        PKR
      </Text>
      <Text category="h6" status={'primary'}>
        {amount}
      </Text>
    </Text>
  );
};
