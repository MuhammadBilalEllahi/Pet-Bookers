import {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, View, Dimensions, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {Layout, Spinner, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {selectImageUrls} from '../../store/configs';
import {flexeStyles} from '../../utils/globalStyles';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import FastImageWithFallback from '../common/FastImageWithFallback';

const {width: windowWidth} = Dimensions.get('window');
const height = (windowWidth - 16) / 1.9;

let slideChangRef = null;

export const FeaturedImages = ({slideList, loading, error}) => {
  const {t} = useTranslation();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const carouselRef = useRef();
  const imageUrls = useSelector(selectImageUrls);

  const theme = useTheme();

  const onScroll = useCallback(
    event => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / slideSize;
      const roundIndex = Math.round(index);

      const distance = Math.abs(roundIndex - index);

      // Prevent one pixel triggering setActiveSlideIndex in the middle
      // of the transition. With this we have to scroll a bit
      // more to trigger the index change.
      const isNoMansLand = 0.4 < distance;

      if (roundIndex !== activeSlideIndex && !isNoMansLand) {
        setActiveSlideIndex(roundIndex);
      }
    },
    [activeSlideIndex],
  );

  // Preload banner images when slideList changes
  useEffect(() => {
    if (slideList && slideList.length > 0 && imageUrls.banner_image_url) {
      const imageUrlsToPreload = slideList.map(slide => ({
        uri: `${imageUrls.banner_image_url}/${slide.photo}`,
        priority: FastImageWithFallback.priority?.high || 'high',
      }));

      // console.log('Preloading banner images:', imageUrlsToPreload);
      // Note: FastImageWithFallback doesn't have preload method, 
      // but individual images will load with retry mechanism
    }
  }, [slideList, imageUrls]);

  useEffect(() => {
    if (slideChangRef) {
      clearTimeout(slideChangRef);
      slideChangRef = null;
    }

    if (slideList.length === 1) {
      return;
    }
    // console.log('slide list', slideList);

    slideChangRef = setTimeout(() => {
      const nextIndex = activeSlideIndex + 1;
      const slideToActivate = nextIndex === slideList.length ? 0 : nextIndex;
      carouselRef.current?.scrollToIndex({
        index: slideToActivate,
        animated: true,
      });
    }, 5000);
  }, [activeSlideIndex, slideList]);

  return (
    <View
      style={{
        position: 'relative',
        height: height,
      }}>
      {loading || error || slideList.length === 0 ? (
        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.contentCenter,
            flexeStyles.itemsCenter,
            {height: height},
          ]}>
          {loading && (
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={{height: '100%', width: '95%', borderRadius: 15}}
            />
          )}
          {error && <Text>{error}</Text>}
          {!loading && !error && (
            <Text>
              {t(
                'common.noDataAvailable',
                'No Data to display yet, please refresh later.',
              )}
            </Text>
          )}
        </Layout>
      ) : (
        <FlatList
          ref={carouselRef}
          data={slideList}
          renderItem={({item}) => {
            return (
              <Slide data={item} imageBaseUrl={imageUrls.banner_image_url} />
            );
          }}
          pagingEnabled={true}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          getItemLayout={(data, index) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
          })}
          onScrollToIndexFailed={info => {
            console.warn('ScrollToIndex failed:', info);
          }}
        />
      )}
      {/* <View
        style={[
          styles.sliderDotContainer,
          flexeStyles.row,
          flexeStyles.itemsCenter,
        ]}>
        {slideList.map((_, slideIndex) => (
          <View
            key={slideIndex}
            style={[
              styles.sliderDot,
              slideIndex === activeSlideIndex && {
                backgroundColor: theme['color-primary-default'],
              },
            ]}
          />
        ))}
      </View> */}
    </View>
  );
};

const Slide = ({data, imageBaseUrl}) => {
  // console.log('data,imageBAseurl', `${imageBaseUrl}/${data.photo}`);
  
  // Fallback image source
  const fallbackSource = {
    uri: 'https://via.placeholder.com/400x200/cccccc/666666?text=Image+Not+Available',
  };

  return (
    <View
      style={{
        width: windowWidth,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FastImageWithFallback
        source={{
          uri: `${imageBaseUrl}/${data.photo}`,
          priority: 'high',
        }}
        fallbackSource={fallbackSource}
        resizeMode="cover"
        style={[
          {width: windowWidth - 16, height: height},
          styles.containerBorder,
        ]}
        showDebugLogs={true}
        maxRetries={3}
        retryDelay={2000}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerBorder: {
    borderRadius: 10,
  },
  sliderDotContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    justifyContent: 'center',
  },
  sliderDot: {
    width: 10,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginHorizontal: 3,
  },
});
