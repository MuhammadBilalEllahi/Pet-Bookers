import {Button, Card, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Dimensions, FlatList, Image, ScrollView} from 'react-native';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {selectBaseUrls} from '../../store/configs';
import {selectProductCategories} from '../../store/productCategories';
import {useState} from 'react';

const {width: windowWidth} = Dimensions.get('screen');

export const CategoriesListScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const baseUrls = useSelector(selectBaseUrls);
  const {categories} = useSelector(selectProductCategories);

  const [selectedCategory, setSelectedCategory] = useState(0);

  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail');
  };


  return (
    <Layout
      level="3"
      style={[
        flexeStyles.row,
        flexeStyles.contentBetween,
        {
          flex: 1,
          marginHorizontal: 10, 
        },
      ]}>
      <Layout style={{width: windowWidth / 4}}>
        <FlatList
          data={categories}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 10}}
          renderItem={({item, index}) => (
            <Card
              style={[
                {
                  padding: 8,
                  marginVertical: 4,
                },
                index === selectedCategory && {
                  borderWidth: 2,
                  borderColor: theme['color-primary-default'],
                },
              ]}
              onPress={() => setSelectedCategory(index)}>
              <Image
                source={{uri: `${baseUrls['category_image_url']}/${item.icon}`}}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: 4 / 3,
                  marginBottom: 4,
                }}
              />
              <Text category="s1" style={{textAlign: 'center'}}>
                {item.name}
              </Text>
            </Card>
          )}
        />
      </Layout>
      <Layout style={{width: windowWidth * 0.75 - 52, marginTop: 10}}>
        {categories[selectedCategory].childes.length > 0 ? (
          <ScrollView
            contentContainerStyle={[
              flexeStyles.row,
              {
                flexWrap: 'wrap',
              },
            ]}
            showsVerticalScrollIndicator={false}>
            {categories[selectedCategory].childes.map((subCategory, index) => (
              <Card key={index} style={{padding: 10, margin: 4}}>
                <Text style={{fontSize: 18}}>{subCategory.name}</Text>
              </Card>
            ))}
          </ScrollView>
        ) : (
          <Layout
            style={[
              spacingStyles.p8,
              flexeStyles.grow1,
              flexeStyles.itemsCenter,
              flexeStyles.contentCenter,
            ]}>
            <Text category="s1" style={{textAlign: 'center'}}>
              {t('messages.noSubCategoryFound')}
            </Text>
            <Text category="s2" style={{textAlign: 'center', marginTop: 8}}>
              {t('messages.noSubCategoryAction')}
            </Text>
            <Button appearance="ghost">
              {categories[selectedCategory]?.name}
            </Button>
          </Layout>
        )}
      </Layout>
    </Layout>
  );
};
