import React from 'react';
import {Button} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {useSelector, useDispatch} from 'react-redux';
import {
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
  selectWishlistLoading,
} from '../../store/wishlist';
import {
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
} from '../../store/user';
import {Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme as useUIKittenTheme} from '@ui-kitten/components';
import {useTheme} from '../../theme/ThemeContext';
import {AppScreens} from '../../navigators/AppNavigator';
import {WishlistButtonShimmer} from './WishlistButtonShimmer';

export const WishlistButton = ({product, navigation, size = 'small'}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const uiKittenTheme = useUIKittenTheme();
  const dispatch = useDispatch();

  const isInWishlist = useSelector(state =>
    selectIsInWishlist(state, product?.id),
  );
  const wishlistLoading = useSelector(selectWishlistLoading);

  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);

  const handleWishlistToggle = () => {
    if (!isBuyerAuthenticated) {
      const message = isSellerAuthenticated
        ? t('product.wishlistAuth')
        : t('product.addToWishlistAuth');

      Alert.alert(t('product.buyerAuthRequired'), message, [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('product.signInAsBuyer'),
          onPress: () =>
            navigation.navigate(AppScreens.LOGIN, {isItSeller: false}),
        },
      ]);
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist({productId: product.id}));
    } else {
      dispatch(
        addToWishlist({
          productId: product.id,
          productData: product,
        }),
      );
    }
  };

  // Show shimmer while loading or if product is not available
  if (wishlistLoading || !product?.id) {
    return <WishlistButtonShimmer size={size} />;
  }

  return (
    <Button
      accessoryLeft={
        <ThemedIcon
          name={isInWishlist ? 'heart' : 'heart-outline'}
          fill={
            isInWishlist
              ? uiKittenTheme['color-danger-default']
              : isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600']
          }
        />
      }
      size={size}
      appearance="ghost"
      onPress={handleWishlistToggle}
    />
  );
};

