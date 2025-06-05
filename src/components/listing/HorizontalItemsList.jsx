import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Spinner, Text } from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedIcon } from '../Icon';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ITEM_HORIZONTAL_MARGIN = 6;
const ITEM_PADDING = 6;
const NUM_ITEMS_VISIBLE = 5;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_SIDE_PADDING = 16;
const ITEM_WIDTH =
  (SCREEN_WIDTH - CONTAINER_SIDE_PADDING * 2 - ITEM_HORIZONTAL_MARGIN * 2 * NUM_ITEMS_VISIBLE) /
  NUM_ITEMS_VISIBLE;

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
  const {theme, isDark} = useTheme();
  const { t, i18n } = useTranslation();

  return (
    <View style={[styles.outerContainer, containerStyle]}>
      <View
        style={[
          styles.listHeader,
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
        ]}>
        <Text 
          category="s1" 
          style={[
            styles.listTitle,
            {color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']}
          ]}>
          {listTitle}
        </Text>
        {!(loading || loadingError) && (
          <TouchableOpacity
            style={[flexeStyles.row, flexeStyles.itemsCenter]}
            onPress={onViewAll}
            activeOpacity={0.7}
          >
            <Text 
              category="label" 
              status="primary" 
              style={[
                styles.viewAllText,
                {color: theme['color-shadcn-primary']}
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
              style={{ marginLeft: 2, marginRight: 2 }}
            />
          </TouchableOpacity>
        )}
      </View>
      {loading || loadingError || list.length === 0 ? (
        <View
          style={[
            flexeStyles.row,
            flexeStyles.contentCenter,
            flexeStyles.itemsCenter,
            spacingStyles.py8,
          ]}>
          {loading && (
             <>
            { [...Array(5)].map((_, idx) => (
          <View key={idx} style={{ flexDirection: 'column', marginHorizontal: 8 , alignItems: 'center'}}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{ height: 60, width: 60, borderRadius: 100, marginBottom: 5 }}
              shimmerColors={isDark ? 
                [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
                [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
              }
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{ height: 10, width: 40, borderRadius: 2 }}
              shimmerColors={isDark ? 
                [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']] :
                [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]
              }
            />
          </View>
          ))}</>
          )}
          {loadingError && (
            <Text 
              appearance="hint" 
              style={[
                styles.errorText,
                {color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
              ]}>
              {loadingError}
            </Text>
          )}
          {!loading && !loadingError && (
            <Text 
              appearance="hint" 
              style={[
                styles.errorText,
                {color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
              ]}>
              {t('messages.noData') || 'No data to display yet, please refresh later.'}
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          showsHorizontalScrollIndicator={false}
          style={styles.listContainer}
          horizontal
          contentContainerStyle={styles.flatListContent}
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemTouchable}
              onPress={() => onItemPress(item.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.imageWrapper,
                {backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-200']}
              ]}>
                <Image
                  style={[
                    styles.image,
                    roundedImage && { borderRadius: ITEM_WIDTH / 2 },
                    {backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-300']}
                  ]}
                  source={{ uri: item.image }}
                  resizeMode="cover"
                />
              </View>
              <Text
                category="c1"
                numberOfLines={2}
                style={[
                  styles.text,
                  {color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']}
                ]}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          snapToInterval={ITEM_WIDTH + ITEM_HORIZONTAL_MARGIN * 2}
          decelerationRate="fast"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingLeft: CONTAINER_SIDE_PADDING,
    paddingRight: CONTAINER_SIDE_PADDING,
    backgroundColor: 'transparent',
  },
  listHeader: {
    paddingHorizontal: 0,
    marginBottom: 4,
  },
  listTitle: {
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontWeight: '600',
    fontSize: 13,
    marginRight: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  listContainer: {
    flexGrow: 0,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  flatListContent: {
    paddingVertical: 2,
  },
  itemTouchable: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginHorizontal: ITEM_HORIZONTAL_MARGIN,
    padding: ITEM_PADDING,
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    width: ITEM_WIDTH - 4,
    height: ITEM_WIDTH - 4,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: ITEM_WIDTH - 8,
    height: ITEM_WIDTH - 8,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'capitalize',
    minHeight: 32,
    maxWidth: ITEM_WIDTH - 2,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 8,
  },
});
