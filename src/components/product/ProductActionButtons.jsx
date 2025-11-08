import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Button} from '@ui-kitten/components';

export const ProductActionButtons = ({
  product,
  onBuyNow,
  onAddToCart,
  onChat,
  addingToCart = false,
  addedToCart = false,
  isDark,
  theme,
  t,
  style,
}) => {
  const isOutOfStock = product?.current_stock === 0;

  return (
    <View style={[styles.container, style]}>
      <Button
        onPress={onBuyNow}
        style={[
          styles.button,
          styles.buyNowButton,
          {
            backgroundColor: theme['color-shadcn-primary'],
            opacity: isOutOfStock ? 0.5 : 1,
          },
        ]}
        textStyle={[
          styles.buttonText,
          {color: theme['color-shadcn-primary-foreground']},
        ]}
        appearance="filled"
        disabled={addingToCart || isOutOfStock}
        accessoryLeft={
          addingToCart
            ? () => (
                <ActivityIndicator
                  size="small"
                  color={theme['color-shadcn-primary-foreground']}
                />
              )
            : undefined
        }>
        {isOutOfStock
          ? t('product.outOfStock')
          : addingToCart
          ? ''
          : t('product.buyNow')}
      </Button>

      <Button
        onPress={onAddToCart}
        style={[
          styles.button,
          styles.addToCartButton,
          {
            backgroundColor: theme['color-shadcn-primary'],
            opacity: isOutOfStock ? 0.5 : 1,
          },
        ]}
        textStyle={[
          styles.buttonText,
          {color: theme['color-shadcn-primary-foreground']},
        ]}
        appearance="filled"
        disabled={addingToCart || isOutOfStock}
        accessoryLeft={
          addingToCart
            ? () => (
                <ActivityIndicator
                  size="small"
                  color={theme['color-shadcn-primary-foreground']}
                />
              )
            : undefined
        }>
        {isOutOfStock
          ? t('product.outOfStock')
          : addingToCart
          ? ''
          : addedToCart
          ? t('product.addedToCart')
          : t('product.addToCart')}
      </Button>

      <Button
        onPress={onChat}
        style={[
          styles.button,
          styles.chatButton,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}
        textStyle={[
          styles.buttonText,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}
        appearance="outline">
        {t('product.chat')}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0,
    height: 48,
    minHeight: 48,
  },
  buyNowButton: {
    marginRight: 4,
  },
  addToCartButton: {
    marginRight: 4,
  },
  chatButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});

