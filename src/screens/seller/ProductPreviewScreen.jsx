import {useState} from 'react';
import {Button, Divider, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {FlatList, ScrollView} from 'react-native';
import {AirbnbRating} from 'react-native-ratings';
import {ThemedIcon} from '../../components/Icon';
import {Price} from '../../components/Price';
import {ProductImagesSlider} from '../../components/product';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import FastImageWithFallback from '../../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';

const featuredImagesDummy = Array.from({length: 3}).map((_, i) => {
  return {
    id: i,
    image:
      'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
  };
});

export const ProductPreviewScreen = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <Layout level="3" style={{flex: 1}}>
      {isPreviewMode && (
        <Layout
          level="1"
          style={[
            spacingStyles.px16,
            spacingStyles.py8,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
          ]}>
          <Text category="label" status="primary">
            Preview mode is on.
          </Text>
          <Button size="tiny" appearance="outline" onPress={togglePreviewMode}>
            Off Preview
          </Button>
        </Layout>
      )}
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          spacingStyles.py8,
          {
            flexGrow: 1,
            justifyContent: 'flex-start',
          },
        ]}>
        {!isPreviewMode && (
          <Layout
            style={[
              spacingStyles.px16,
              {
                alignItems: 'flex-end',
                marginVertical: 8,
              },
            ]}>
            <Button
              appearance="outline"
              size="small"
              onPress={togglePreviewMode}>
              View as Customer
            </Button>
          </Layout>
        )}
        <ProductImagesSlider slideList={featuredImagesDummy} />
        <Layout level="1">
          <Layout
            style={[
              spacingStyles.px16,
              spacingStyles.py8,
              flexeStyles.row,
              flexeStyles.itemsCenter,
              flexeStyles.contentBetween,
            ]}>
            <Layout>
              <Price amount={250} />
              <Layout style={flexeStyles.row}>
                <Price amount={400} cross={true} />
                <Text style={{marginLeft: 4}}>-10%</Text>
              </Layout>
            </Layout>
            {isPreviewMode && (
              <Button
                accessoryLeft={<ThemedIcon name="heart" status="primary" />}
                size="small"
                appearance="ghost"
              />
            )}
          </Layout>
          <Divider />
          <Text style={[spacingStyles.px16, {marginTop: 10}]} category="h6">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
          </Text>
          <Layout
            style={[
              spacingStyles.px16,
              flexeStyles.row,
              flexeStyles.itemsCenter,
              {
                marginTop: 4,
              },
            ]}>
            <AirbnbRating
              count={5}
              defaultRating={3.4}
              showRating={false}
              size={18}
              isDisabled={true}
              selectedColor={theme['color-primary-default']}
            />
            <Text category="h6" style={{marginLeft: 4}}>
              3.4
            </Text>
          </Layout>
          <Divider />
          <Layout style={spacingStyles.p16} level="1">
            <Text
              category="p1"
              style={{
                marginBottom: 10,
                fontWeight: '700',
                textTransform: 'uppercase',
              }}>
              Description
            </Text>
            <Text>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi
              ducimus quae voluptatem consequatur perferendis illo, voluptates
              iusto expedita quidem impedit sit maxime harum nemo, magnam eos
              vitae accusantium minus id!
            </Text>
          </Layout>
        </Layout>
        {isPreviewMode && (
          <Layout
            level="1"
            style={[
              spacingStyles.px16,
              spacingStyles.py8,
              {
                marginVertical: 8,
              },
            ]}>
            <Layout
              style={[
                flexeStyles.row,
                flexeStyles.itemsCenter,
                flexeStyles.contentBetween,
              ]}>
              <Text
                category="p1"
                style={{
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}>
                Reviews
              </Text>
              <Text category="s2" status="primary">
                {t('viewAll')}
              </Text>
            </Layout>
            <Layout style={{marginTop: 8}}>
              {[1, 2, 3, 4].map(item => (
                <Layout style={{paddingVertical: 4}}>
                  <Layout
                    style={[
                      flexeStyles.row,
                      flexeStyles.contentBetween,
                      {
                        marginBottom: 4,
                      },
                    ]}>
                    <Text category="s1">{t('common.reviewName')}</Text>
                    <AirbnbRating
                      count={5}
                      defaultRating={3.4}
                      showRating={false}
                      size={14}
                      isDisabled={true}
                      selectedColor={theme['color-primary-default']}
                    />
                  </Layout>
                  <Text>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Itaque ratione, dicta, dignissimos omnis numquam sit enim,
                  </Text>
                  <Divider style={{marginTop: 8}} />
                </Layout>
              ))}
            </Layout>
          </Layout>
        )}
        {isPreviewMode && (
          <Layout level="1" style={[spacingStyles.px16, spacingStyles.py8]}>
            <Layout
              style={[
                flexeStyles.row,
                flexeStyles.itemsCenter,
                flexeStyles.contentBetween,
              ]}>
              <Layout
                style={[
                  flexeStyles.row,
                  flexeStyles.itemsCenter,
                  {
                    marginBottom: 8,
                  },
                ]}>
                <FastImageWithFallback
                  priority={FastImage.priority.high}
                  resizeMode={FastImage.resizeMode.cover}
                  source={{
                    uri: 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
                  }}
                  fallbackSource={{
                    uri: 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                    marginRight: 8,
                  }}
                />
                <Text category="s1" status="primary">
                  Pets Shot Store
                </Text>
              </Layout>
              <Button
                appearance="ghost"
                size="small"
                accessoryLeft={
                  <ThemedIcon name="message-square-outline" status="primary" />
                }>
                {t('common.chat')}
              </Button>
            </Layout>
            <Layout
              style={[
                flexeStyles.row,
                flexeStyles.itemsCenter,
                flexeStyles.contentBetween,
                {
                  marginBottom: 8,
                },
              ]}>
              <Layout style={{alignItems: 'center'}}>
                <Text category="h4" status="primary">
                  43
                </Text>
                <Text appearance="hint">{t('common.review')}</Text>
              </Layout>
              <Layout style={{alignItems: 'center'}}>
                <Text category="h4" status="primary">
                  12
                </Text>
                <Text appearance="hint">{t('common.products')}</Text>
              </Layout>
            </Layout>
            <Text
              style={{
                fontSize: 16,
                textTransform: 'uppercase',
                marginBottom: 4,
                fontWeight: '700',
              }}>
              {t('common.fromSameSeller')}
            </Text>
            <FlatList
              data={[1, 2, 3, 4]}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) => (
                <Layout
                  level="1"
                  style={{width: 130, marginHorizontal: 4, paddingBottom: 4}}>
                  <FastImageWithFallback
                    priority={FastImage.priority.high}
                    resizeMode={FastImage.resizeMode.cover}
                    source={{
                      uri: 'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
                    }}
                    fallbackSource={{
                      uri: 'https://petbookie.com/storage/app/public/product/thumbnail/2023-05-07-645829a70c659.png',
                    }}
                    style={{
                      width: 130,
                      height: 80,
                    }}
                  />
                  <Text category="p1" style={{fontSize: 16, marginVertical: 8}}>
                    Lorem ipsum dolor sit amet consectetur.
                  </Text>
                  <Price amount={230} />
                </Layout>
              )}
            />
          </Layout>
        )}
      </ScrollView>
      {isPreviewMode ? (
        <Layout
          level="1"
          style={[
            spacingStyles.px16,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            {
              paddingTop: 10,
            },
          ]}>
          <Button
            appearance="outline"
            style={{paddingHorizontal: 30, height: 45}}>
            Buy
          </Button>
          <Button
            accessoryLeft={
              <ThemedIcon name="shopping-cart-outline" fill="#fff" />
            }
            style={{height: 45, flexGrow: 1, marginLeft: 8}}>
            Add to Cart
          </Button>
        </Layout>
      ) : (
        <Layout
          level="1"
          style={[
            spacingStyles.px16,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            {
              paddingTop: 10,
            },
          ]}>
          <Button
            appearance="outline"
            size="small"
            style={{paddingHorizontal: 30}}
            accessoryLeft={
              <ThemedIcon
                name="trash-2-outline"
                status="primary"
                iconStyle={{width: 18, height: 18}}
              />
            }>
            Delete
          </Button>
          <Button
            size="small"
            accessoryLeft={
              <ThemedIcon
                name="edit-2-outline"
                fill="#fff"
                iconStyle={{width: 18, height: 18}}
              />
            }
            style={{flexGrow: 1, marginLeft: 8}}>
            Update Product
          </Button>
        </Layout>
      )}
    </Layout>
  );
};
