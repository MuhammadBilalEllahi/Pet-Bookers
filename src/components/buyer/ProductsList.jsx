import {FlatList, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Layout, Spinner, Text, useTheme} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {ProductCard} from '../product/ProductCard';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

const {width: windowWidth} = Dimensions.get('screen');

// Define a smaller card width for the ProductCard
const SMALL_CARD_WIDTH = windowWidth * 0.48; // Decrease card width for smaller image

export const ProductsList = ({
  list,
  loading,
  loadingError,
  listTitle,
  hideViewAllBtn,
  containerStyle,
  onProductDetail,
}) => {
  const theme = useTheme();
  const {t, i18n} = useTranslation();

  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.listHeader,
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}>
        <Text category="p1" style={styles.listTitle}>
          {listTitle}
        </Text>
        {!(hideViewAllBtn || loading || loadingError || list.length === 0) && (
          <TouchableOpacity style={[flexeStyles.row, flexeStyles.itemsCenter]}>
            <Text category="label" status="primary" style={styles.listTitle}>
              {t('viewAll')}
            </Text>
            <ThemedIcon
              name={
                i18n.dir() === 'rtl'
                  ? 'arrow-ios-back-outline'
                  : 'arrow-ios-forward-outline'
              }
              fill={theme['color-primary-default']}
            />
          </TouchableOpacity>
        )}
      </View>
      {loading || loadingError || list.length === 0 ? (
        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.contentCenter,
            flexeStyles.itemsCenter,
            spacingStyles.py8,
          ]}>
          {loading && <Spinner />}
          {loadingError && <Text>{loadingError}</Text>}
          {!loading && !loadingError && (
            <Text>No Data to display yet, please refresh later.</Text>
          )}
        </Layout>
      ) : (
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={styles.listContainer}
          horizontal={true}
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <ProductCard {...item} onProductDetail={onProductDetail} cardWidth={SMALL_CARD_WIDTH} />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listHeader: {
    paddingHorizontal: 10,
  },
  listTitle: {textTransform: 'uppercase', fontWeight: '700'},
  listContainer: {
    flexGrow: 0,
    marginTop: 8,
  },
  card: {
    marginHorizontal: 4,
    padding: 10,
    maxWidth: 140, // Decreased maxWidth for smaller card
  },
  image: {
    width: 90, // Decreased image width
    height: 90, // Decreased image height
    alignSelf: 'center',
    borderRadius: 4,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
});
