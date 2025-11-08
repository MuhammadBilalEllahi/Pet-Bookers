import React, {useState, useRef} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {Icon} from '@ui-kitten/components';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ProductActionButtons} from './ProductActionButtons';
import {useTheme} from '../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

export const FullscreenImageCarousel = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onImageIndexChange,
  product,
  onBuyNow,
  onAddToCart,
  onChat,
  addingToCart = false,
  addedToCart = false,
}) => {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageViewerRef = useRef();

  // Format images for the ImageViewer component
  const formattedImages = images.map(item => ({
    url: item.image || item.uri || item.url,
    // You can add additional props like:
    // width: item.width,
    // height: item.height,
    // props: { source: { uri: item.image } }
  }));

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
    if (onImageIndexChange) {
      onImageIndexChange(index);
    }
  };

  const handleSwipeDown = () => {
    // This is called when user swipes down - you can use it to close or just log
    console.log('Swiped down');
    // Optional: handleClose();
  };

  const handleMove = (position) => {
    // position will be undefined when not zoomed
    setIsZoomed(!!position);
  };

  const resetZoom = () => {
    if (imageViewerRef.current) {
      // The ImageViewer doesn't have a direct reset method, but we can change index to force reset
      // Alternatively, you can use the double tap handler built into the component
      console.log('Reset zoom functionality may vary by library version');
    }
  };

  const handleDoubleTap = () => {
    // This is handled automatically by the ImageViewer component
    console.log('Double tap handled by ImageViewer');
  };

  const handleClose = () => {
    setIsZoomed(false);
    if (onClose) {
      onClose();
    }
  };

  // Custom header component
  const renderHeader = () => {
    const overlayColor = isDark
      ? 'rgba(18, 18, 18, 0.8)' // color-shadcn-background with opacity
      : 'rgba(0, 0, 0, 0.5)';
    const textColor = isDark
      ? theme['color-shadcn-foreground']
      : '#FFFFFF';

    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
      }}>
        {/* Image Counter */}
        <View style={{
          backgroundColor: overlayColor,
          borderRadius: 15,
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}>
          <Text style={{color: textColor, fontSize: 14, fontWeight: 'bold'}}>
            {currentImageIndex + 1} / {images.length}
          </Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          style={{
            backgroundColor: overlayColor,
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={handleClose}>
          <Icon name="close" fill={textColor} style={{width: 24, height: 24}} />
        </TouchableOpacity>
      </View>
    );
  };

  // Custom footer component
  const renderFooter = () => {
    const dotActiveColor = isDark
      ? theme['color-shadcn-foreground']
      : '#FFFFFF';
    const dotInactiveColor = isDark
      ? theme['color-shadcn-muted-foreground']
      : 'rgba(255,255,255,0.3)';
    const instructionTextColor = isDark
      ? theme['color-shadcn-muted-foreground']
      : 'rgba(255,255,255,0.7)';

    return (
      <View style={styles.footerContainer}>
        {/* Navigation Dots */}
        {images.length > 1 && !isZoomed && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentImageIndex
                        ? dotActiveColor
                        : dotInactiveColor,
                  },
                ]}
                onPress={() => handleImageChange(index)}
              />
            ))}
          </View>
        )}

        {/* Zoom Instructions */}
        {!isZoomed && !product && (
          <Text style={[styles.zoomInstructions, {color: instructionTextColor}]}>
            Double tap to zoom • Pinch to zoom
          </Text>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleClose}>
      <View style={{
        flex: 1,
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : '#000000',
      }}>
        <ImageViewer
          ref={imageViewerRef}
          imageUrls={formattedImages}
          index={initialIndex}
          onSwipeDown={handleSwipeDown}
          onMove={handleMove}
          onChange={handleImageChange}
          enableSwipeDown={true}
          enablePreload={true}
          saveToLocalByLongPress={false}
          menuContext={{saveToLocal: 'Save Image', cancel: 'Cancel'}}
          flipThreshold={100}
          maxOverflow={300}
          renderHeader={renderHeader}
          renderFooter={renderFooter}
          // Custom image component props
          // renderImage={(props) => <Image {...props} />}
          // Image style props
          style={{
            flex: 1,
          }}
          // Loading component
          loadingRender={() => (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={{
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : '#FFFFFF',
                }}>
                Loading...
              </Text>
            </View>
          )}
          // Double click config (for web, but some mobile implementations use it)
          doubleClickInterval={300}
        />

        {/* Reset Zoom Button - Show only when zoomed */}
        {isZoomed && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              right: 70,
              zIndex: 1001,
              backgroundColor: isDark
                ? 'rgba(18, 18, 18, 0.8)' // color-shadcn-background with opacity
                : 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={resetZoom}>
            <Icon
              name="maximize"
              fill={isDark ? theme['color-shadcn-foreground'] : 'white'}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
        )}

        {/* Action Buttons - OLX style bottom bar (rendered outside ImageViewer) */}
        {product && (
          <View
            style={[
              styles.actionButtonsContainer,
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
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    marginBottom: 6,
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  actionButtons: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
  },
  zoomInstructions: {
    fontSize: 12,
    marginBottom: 50,
  },
});