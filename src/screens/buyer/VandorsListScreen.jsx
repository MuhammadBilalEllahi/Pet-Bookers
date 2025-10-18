import React, {useEffect, useState} from 'react';
import {Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';
import {
  FlatList,
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {loadSellers, selectSellers} from '../../store/buyersHome';
import {selectBaseUrls} from '../../store/configs';

const {width: windowWidth} = Dimensions.get('screen');

export const VandorsListScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const dispatch = useDispatch();

  const baseUrls = useSelector(selectBaseUrls);
  const {sellers, sellersLoading, sellersError} = useSelector(selectSellers);

  useEffect(() => {
    dispatch(loadSellers());
  }, [dispatch]);

  const navigateToVandorDetail = sellerId => {
    navigation.navigate('VandorDetail', {sellerId});
  };

  const renderSellerItem = ({item}) => {
    const sellerImageUrl = `${baseUrls['shop_image_url']}/${item.image}`;

    return (
      <TouchableOpacity
        style={[styles.sellerCard]}
        onPress={() => navigateToVandorDetail(item.id)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#E5E5E5',
            },
          ]}>
          <Image
            source={{uri: sellerImageUrl}}
            style={styles.sellerImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.sellerInfo}>
          <Text
            style={[
              styles.sellerName,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}
            numberOfLines={2}>
            {item.name || 'Unknown Seller'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        {t('sellers.noSellersFound') || 'No sellers found'}
      </Text>
    </View>
  );

  return (
    <Layout
      level="3"
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <FlatList
        data={sellers || []}
        renderItem={renderSellerItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!sellersLoading ? renderEmptyState : null}
        refreshing={sellersLoading}
        onRefresh={() => dispatch(loadSellers())}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  sellerCard: {
    width: (windowWidth - 48) / 2, // Account for padding and gap

    padding: 12,
    marginBottom: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sellerImage: {
    width: '100%',
    height: '100%',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  sellerLocation: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
