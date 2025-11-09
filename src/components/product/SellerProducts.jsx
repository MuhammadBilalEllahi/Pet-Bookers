import React, {useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {ProductsList} from '../buyer/ProductsList';
import {
  loadSellerProducts,
  selectSellerProducts,
} from '../../store/sellerDetails';
import {calculateDiscountedPrice} from '../../utils/products';
import {BASE_URLS} from '../../store/configs';

export const SellerProducts = ({
  productId,
  sellerId,
  shopName,
  onProductDetail,
  navigation,
}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {sellerProducts, sellerProductsLoading} =
    useSelector(selectSellerProducts);

  const parsedProducts = useCallback(list => {
    if (!Array.isArray(list)) return [];
    return list.map(productItem => ({
      id: productItem.id,
      name: productItem.name,
      image: productItem.thumbnail
        ? `${BASE_URLS.product_thumbnail_url}/${
            productItem.thumbnail?.split('/')?.pop() || ''
          }`
        : '',
      price:
        productItem.discount > 0
          ? calculateDiscountedPrice(
              productItem.unit_price,
              productItem.discount,
              productItem.discount_type,
            )
          : productItem.unit_price,
      oldPrice: productItem.discount > 0 ? productItem.unit_price : 0,
      isSoldOut: productItem.current_stock === 0,
      discountType: productItem.discount_type,
      discount: productItem.discount,
      rating: 0,
      slug: productItem?.slug || '',
    }));
  }, []);

  useEffect(() => {
    if (sellerId) {
      dispatch(loadSellerProducts({sellerId, limit: 10, offset: 0}));
    }
  }, [sellerId, dispatch]);

  if (!sellerId) {
    return null;
  }

  return (
    <View style={{marginTop: 20, marginBottom: 20}}>
      <ProductsList
        listTitle={t('product.fromSeller')}
        loading={sellerProductsLoading}
        list={parsedProducts(
          sellerProducts.products.filter(p => p.id !== productId),
        )}
        onProductPress={onProductDetail}
        onProductDetail={onProductDetail}
        onViewAll={() =>
          navigation.navigate('AllProductsScreen', {
            productType: 'seller',
            sellerId: sellerId,
            title: shopName || t('product.fromSeller'),
          })
        }
      />
    </View>
  );
};

