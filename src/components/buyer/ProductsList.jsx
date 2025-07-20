import { FlatList, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Layout, Spinner, Text } from '@ui-kitten/components';
import { ThemedIcon } from '../Icon';
import { useTheme } from '../../theme/ThemeContext';
import { ProductCard } from '../product/ProductCard';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import { useCallback } from 'react';
import { ProductCardShimmer } from '../ProductCardShimmer';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { width: windowWidth } = Dimensions.get('screen');

// Define a smaller card width for the ProductCard
const SMALL_CARD_WIDTH = windowWidth * 0.45; // Decrease card width for smaller image

export const ProductsList = ({
  list,
  loading,
  loadingError,
  listTitle,
  hideViewAllBtn,
  containerStyle,
  onProductDetail,
  onLoadMore,
  hasMore,
  onViewAll,
  productType,
  categoryId,
}) => {
  const { theme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return <ProductCardShimmer />;
  }, [loading]);

  if (!loading && !loadingError && (!list || list.length === 0)) {
    return null;
  }

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.listHeader,
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}>
        <Text 
          category="p1" 
          style={[
            styles.listTitle,
            { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }
          ]}>
          {listTitle}
        </Text>

        {!(hideViewAllBtn || loading || loadingError || list.length === 0) && (
          <TouchableOpacity 
            style={[flexeStyles.row, flexeStyles.itemsCenter]}
            activeOpacity={0.7}
            onPress={onViewAll}
          >
            <Text 
              category="label" 
              style={[
                styles.listTitle,
                { color: theme['color-shadcn-primary'] }
              ]}>
              {t('viewAll')}
            </Text>
            <ThemedIcon
              name={
                i18n.dir() === 'rtl'
                  ? 'arrow-ios-back-outline'
                  : 'arrow-ios-forward-outline'
              }
              fill={theme['color-shadcn-primary']}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View style={styles.shimmerContainer}>
          {[...Array(2)].map((_, idx) => (
            <ProductCardShimmer 
              key={idx}
              shimmerColors={isDark ? 
                [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
                [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
              }
            />
          ))}
        </View>
      ) : (
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={styles.listContainer}
          horizontal={true}
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard 
              {...item} 
              onProductDetail={onProductDetail} 
              cardWidth={SMALL_CARD_WIDTH}
              isDark={isDark}
              theme={theme}
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !loading) {
              onLoadMore();
            }
          }}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listHeader: {
    paddingHorizontal: 10,
  },
  listTitle: { 
    textTransform: 'uppercase', 
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  listContainer: {
    flexGrow: 0,
    marginTop: 8,
  },
  shimmerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});
