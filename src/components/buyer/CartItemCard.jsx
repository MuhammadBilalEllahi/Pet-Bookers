import {Button, Layout, Text, useTheme} from '@ui-kitten/components';
import {Image, StyleSheet} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';
import {Price} from '../Price';
import FastImage from '@d11/react-native-fast-image';

export const CartItemCard = () => {
  const theme = useTheme();
  return (
    <Layout style={[styles.card, flexeStyles.row]}>
      <FastImageWithFallback
        style={[styles.image]}
        source={{
          uri: 'https://repository-images.githubusercontent.com/260096455/47f1b200-8b2e-11ea-8fa1-ab106189aeb0',
        }}
        priority={FastImage.priority.high}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Layout style={[flexeStyles.contentBetween, {flexShrink: 1}]}>
        <Layout style={[flexeStyles.row, flexeStyles.contentBetween]}>
          <Text category="h6" style={[styles.title]}>
            Lorem, ipsum dolor sit amet consectetur
          </Text>
          <Button
            appearance="ghost"
            size="small"
            accessoryLeft={
              <ThemedIcon name="trash-2-outline" status="primary" />
            }
            style={{width: 20, height: 20}}
          />
        </Layout>
        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}>
          <Price amount={200} />
          <Layout
            style={[
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
            ]}>
            <Button
              appearance="ghost"
              size="small"
              accessoryLeft={<ThemedIcon name="minus-outline" />}
              style={{width: 16, height: 16}}
            />
            <Text category="h6" style={{marginHorizontal: 4}}>
              3
            </Text>
            <Button
              appearance="ghost"
              size="small"
              accessoryLeft={<ThemedIcon name="plus-outline" />}
              style={{width: 16, height: 16}}
            />
          </Layout>
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
