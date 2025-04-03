import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Card, Layout, Spinner, Text, useTheme} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

export const HorizontalItemsList = ({
  list,
  listTitle,
  loading,
  loadingError,
  containerStyle,
  roundedImage,
  onItemPress,
  onViewAll,
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
        {!(loading || loadingError) && (
          <TouchableOpacity
            style={[flexeStyles.row, flexeStyles.itemsCenter]}
            onPress={onViewAll}>
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
          renderItem={({item}) => {
            return (
              <Card style={styles.card} onPress={() => onItemPress(item.id)}>
                <Image
                  style={[styles.image, roundedImage && {borderRadius: 100}]}
                  source={{
                    uri: item.image,
                  }}
                />
                <Text category="h6" style={styles.text}>
                  {item.name}
                </Text>
              </Card>
            );
          }}
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
    maxWidth: 150,
  },
  image: {
    width: 100,
    height: 100,
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
