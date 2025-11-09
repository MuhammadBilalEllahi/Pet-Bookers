import React, {useEffect, useState, useCallback} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ProductsList} from '../buyer/ProductsList';
import {axiosBuyerClient} from '../../utils/axiosClient';
import {calculateDiscountedPrice} from '../../utils/products';
import {BASE_URLS} from '../../store/configs';

export const RelatedProducts = ({productId, onProductDetail, navigation}) => {
  const {t} = useTranslation();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await axiosBuyerClient.get(
          `products/related-products/${productId}`,
        );
        setRelatedProducts(response.data || []);
      } catch (error) {
        console.error(
          'Error fetching related products:',
          error || error?.message || error?.response?.data?.message,
        );
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  if (!productId) {
    return null;
  }

  return (
    <View style={{marginTop: 20, marginBottom: 20}}>
      <ProductsList
        listTitle={t('product.relatedProducts')}
        loading={loading}
        list={parsedProducts(relatedProducts.filter(p => p.id !== productId))}
        onProductDetail={onProductDetail}
        onViewAll={() =>
          navigation.navigate('AllProductsScreen', {
            productType: 'related',
            title: t('product.relatedProducts'),
          })
        }
      />
    </View>
  );
};

