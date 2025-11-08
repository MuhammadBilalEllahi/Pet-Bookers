import React from 'react';
import {Button, Alert} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {Share} from 'react-native';
import {useTranslation} from 'react-i18next';
import {axiosBuyerClient} from '../../utils/axiosClient';

export const ShareButton = ({product, size = 'small'}) => {
  const {t} = useTranslation();

  const handleShare = async () => {
    try {
      if (!product?.slug) {
        Alert.alert(t('common.error'), t('product.shareInfoNotAvailable'));
        return;
      }

      // Call the social-share-link API to get the shareable link
      const response = await axiosBuyerClient.get(
        `products/social-share-link/${product.slug}`,
      );
      const shareLink = response.data;

      const shareOptions = {
        title: t('product.shareTitle', {productName: product.name}),
        message: product.is_living
          ? t('product.shareMessagePet', {
              productName: product.name,
              price: product.unit_price.toLocaleString(),
              link: shareLink,
            })
          : t('product.shareMessage', {
              productName: product.name,
              price: product.unit_price.toLocaleString(),
              link: shareLink,
            }),
        url: shareLink,
      };

      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing product:', error);
      Alert.alert(t('common.error'), t('product.shareError'));
    }
  };

  return (
    <Button
      accessoryLeft={<ThemedIcon name="share" />}
      size={size}
      appearance="ghost"
      onPress={handleShare}
    />
  );
};

