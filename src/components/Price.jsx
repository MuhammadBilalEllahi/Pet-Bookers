import {Text} from '@ui-kitten/components';
import {View, StyleSheet} from 'react-native';
import {flexeStyles} from '../utils/globalStyles';

export const Price = ({amount, cross, color}) => {
  // Default colors
  const crossedColor = color || '#afafaf'; // Muted gray for crossed price
  const normalColor = color || '#888'; // Default color for normal price

  // Define font sizes for consistency
  const PKR_FONT_SIZE = 15;
  const AMOUNT_FONT_SIZE = 15;

  // Margin between PKR and price
  const PKR_MARGIN_RIGHT = 4;
  const AMOUNT_MARGIN_LEFT = 2;

  if (cross) {
    return (
      <View style={styles.rowAlign}>
        <Text
          style={{
            color: crossedColor,
            fontSize: PKR_FONT_SIZE,
            fontWeight: '500',
            marginRight: PKR_MARGIN_RIGHT,
            textDecorationLine: 'line-through',
          }}
        >
          PKR
        </Text>
        <Text
          style={{
            color: crossedColor,
            fontSize: AMOUNT_FONT_SIZE,
            fontWeight: '500',
            marginLeft: AMOUNT_MARGIN_LEFT,
            textDecorationLine: 'line-through',
          }}
        >
          {amount}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.rowAlign}>
      <Text
        style={{
          color: normalColor,
          fontSize: PKR_FONT_SIZE,
          fontWeight: '700',
          marginRight: PKR_MARGIN_RIGHT,
        }}
      >
        PKR
      </Text>
      <Text
        style={{
          color: normalColor,
          fontSize: AMOUNT_FONT_SIZE,
          fontWeight: '700',
          marginLeft: AMOUNT_MARGIN_LEFT,
        }}
      >
        {amount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
