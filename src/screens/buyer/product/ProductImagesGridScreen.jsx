import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import {BackButton} from '../../../components/BackButton';
import {WishlistButton} from '../../../components/product/WishlistButton';
import {ShareButton} from '../../../components/product/ShareButton';
import {ProductActionButtons} from '../../../components/product/ProductActionButtons';
import {FullscreenImageCarousel} from '../../../components/product/FullscreenImageCarousel';
import {Price} from '../../../components/Price';
import {useTheme} from '../../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {calculateDiscountedPrice} from '../../../utils/products';
import {BASE_URLS} from '../../../store/configs';
import FastImageWithFallback from '../../../components/common/FastImageWithFallback';

const {width: screenWidth} = Dimensions.get('window');
const GRID_GAP = 1;
const FULL_WIDTH = screenWidth - GRID_GAP * 2; // Full width minus padding
const HALF_WIDTH = (screenWidth - GRID_GAP * 3) / 2; // Half width for two images side by side

export const ProductImagesGridScreen = ({route, navigation}) => {
  const {
    product,
    productImages,
    currentImageIndex: initialImageIndex = 0,
    onBuyNow,
    onAddToCart,
    onChat,
    addingToCart,
    addedToCart,
  } = route.params || {};
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const [showFullscreenCarousel, setShowFullscreenCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);

  if (!product || !productImages) {
    return (
      <Layout
        style={{
          flex: 1,
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text>Product data not available</Text>
      </Layout>
    );
  }

  const openFullscreenCarousel = (index = 0) => {
    setCurrentImageIndex(index);
    setShowFullscreenCarousel(true);
  };

  const closeFullscreenCarousel = () => {
    setShowFullscreenCarousel(false);
  };

  const getProductThumbnail = () => {
    if (product.thumbnail && BASE_URLS.product_thumbnail_url) {
      return `${BASE_URLS.product_thumbnail_url}/${product.thumbnail}`;
    }
    return productImages[0]?.image || '';
  };

  return (
    <Layout
      style={{
        flex: 1,
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
      }}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
            borderBottomColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
            paddingTop: Math.max(insets.top, 10),
          },
        ]}>
        <View style={styles.topBarContent}>
          {/* Left: Back Button */}
          <View style={styles.backButtonContainer}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>

          {/* Middle: Product Info */}
          <View style={styles.productInfoContainer}>
            <Image
              source={{uri: getProductThumbnail()}}
              style={[
                styles.thumbnail,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-200'],
                },
              ]}
              resizeMode="cover"
            />
            <View style={styles.productTextContainer}>
              <Text
                style={[
                  styles.productName,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
                numberOfLines={1}>
                {product.name}
              </Text>
              <View style={styles.priceContainer}>
                {product.discount > 0 ? (
                  <Price
                    fontSize={14}
                    amount={calculateDiscountedPrice(
                      product.unit_price,
                      product.discount,
                      product.discount_type,
                    )}
                  />
                ) : (
                  <Price fontSize={14} amount={product.unit_price} />
                )}
              </View>
            </View>
          </View>

          {/* Right: Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <WishlistButton product={product} navigation={navigation} />
            <ShareButton product={product} />
          </View>
        </View>
      </View>

      {/* Image Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.gridContainer,
          {
            paddingBottom: Math.max(insets.bottom, 100),
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.gridWrapper}>
          {productImages.map((item, index) => {
            const isFullWidth = index % 3 === 0;
            const isFirstHalf = index % 3 === 1;
            const isSecondHalf = index % 3 === 2;

            // Calculate image dimensions
            const imageWidth = isFullWidth ? FULL_WIDTH : HALF_WIDTH;
            const imageHeight = isFullWidth 
              ? FULL_WIDTH * 0.75 // 4:3 aspect ratio for full width
              : HALF_WIDTH * 1.2; // Slightly taller for half width images

            return (
              <TouchableOpacity
                key={`image-${index}`}
                style={[
                  styles.imageContainer,
                  {
                    width: imageWidth,
                    height: imageHeight,
                    backgroundColor: isDark
                      ? theme['color-shadcn-card']
                      : theme['color-basic-200'],
                    marginRight: isFirstHalf ? GRID_GAP : 0, // Add right margin only for first half
                    marginBottom: GRID_GAP,
                  },
                ]}
                onPress={() => openFullscreenCarousel(index)}
                activeOpacity={0.8}>
                <FastImageWithFallback
                  source={{
                    uri: item.image,
                    priority: 'high',
                  }}
                  fallbackSource={{
                    uri: 'https://via.placeholder.com/400x400/cccccc/666666?text=Image',
                  }}
                  style={styles.image}
                  resizeMode="cover"
                  showDebugLogs={false}
                  maxRetries={2}
                  retryDelay={1500}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
            borderTopColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}>
        <ProductActionButtons
          product={product}
          onBuyNow={onBuyNow}
          onAddToCart={onAddToCart}
          onChat={onChat}
          addingToCart={addingToCart}
          addedToCart={addedToCart}
          isDark={isDark}
          theme={theme}
          t={t}
          style={styles.actionButtons}
        />
      </View>

      {/* Fullscreen Image Carousel */}
      <FullscreenImageCarousel
        visible={showFullscreenCarousel}
        images={productImages}
        initialIndex={currentImageIndex}
        onClose={closeFullscreenCarousel}
        onImageIndexChange={setCurrentImageIndex}
        product={product}
        onBuyNow={onBuyNow}
        onAddToCart={onAddToCart}
        onChat={onChat}
        addingToCart={addingToCart}
        addedToCart={addedToCart}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  topBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonContainer: {
    marginRight: 12,
  },
  productInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productTextContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    padding: GRID_GAP,
    // padding: 0
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  imageContainer: {
    // borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtons: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

