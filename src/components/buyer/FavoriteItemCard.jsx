import {Button, Icon, Layout, Text, useTheme} from '@ui-kitten/components';
import {Image, StyleSheet} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';
import {Price} from '../Price';

export const FavoriteItemCard = () => {
  const theme = useTheme();

  const renderHeartIcon = props => (
    <ThemedIcon {...props} name="close" fill={theme['color-primary-default']} />
  );
  const renderCartIcon = props => (
    <Icon {...props} name="shopping-cart-outline" />
  );
  return (
    <Layout style={[styles.card, flexeStyles.row]}>
      <Image
        style={[styles.image]}
        source={{
          uri: 'https://repository-images.githubusercontent.com/260096455/47f1b200-8b2e-11ea-8fa1-ab106189aeb0',
        }}
      />
      <Layout style={{flexShrink: 1, justifyContent: 'space-between'}}>
        <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
          <Text category="h6" style={[styles.title]}>
            Lorem, ipsum dolor sit amet consectetur
          </Text>
          <Button
            appearance="ghost"
            accessoryLeft={renderHeartIcon}
            style={{width: 20, height: 20}}
          />
        </Layout>
        <Price amount={200} />
        <Layout
          style={[
            flexeStyles.row,
            {
              justifyContent: 'flex-end',
            },
          ]}>
          <Button
            accessoryLeft={renderCartIcon}
            size="small"
            appearance="outline">
            ADD TO CART
          </Button>
        </Layout>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
    borderRadius: 4,
    resizeMode: 'cover',
    marginRight: 8,
  },
  title: {
    fontWeight: '500',
    fontSize: 18,
    marginBottom: 10,
    flexShrink: 1,
  },
});
