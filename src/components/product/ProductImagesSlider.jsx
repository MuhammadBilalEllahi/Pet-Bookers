import {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';
import FastImageWithFallback from '../common/FastImageWithFallback';

const {width: windowWidth} = Dimensions.get('window');
const height = (windowWidth - 16) / 1.77;

let slideChangRef = null;

export const ProductImagesSlider = ({slideList, onImagePress}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const carouselRef = useRef();

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

  useEffect(() => {
    if (slideChangRef) {
      clearTimeout(slideChangRef);
      slideChangRef = null;
    }

    if (slideList.length === 1) {
      return;
    }

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
      <FlatList
        ref={carouselRef}
        data={slideList}
        renderItem={({item, index}) => {
          return (
            <ProductImageSlide
              data={item}
              index={index}
              onImagePress={onImagePress}
            />
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
      <View
        style={[
          styles.sliderCounterContainer,
          flexeStyles.row,
          flexeStyles.itemsCenter,
        ]}>
        <View style={[styles.counter, flexeStyles.itemsCenter]}>
          <Text style={styles.counterText}>
            {activeSlideIndex + 1}/{slideList.length}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ProductImageSlide = ({data, index, onImagePress}) => {
  return (
    <View
      style={{
        width: windowWidth,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        onPress={() => onImagePress && onImagePress(index)}
        style={{width: windowWidth - 16, height: height}}>
        <FastImageWithFallback
          source={{
            uri: data.image,
            priority: 'high',
          }}
          fallbackSource={{
            uri: 'https://via.placeholder.com/400x225/cccccc/666666?text=Product+Image',
          }}
          style={{width: windowWidth - 16, height: height}}
          resizeMode="cover"
          showDebugLogs={false}
          maxRetries={2}
          retryDelay={1500}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderCounterContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 10,
    justifyContent: 'center',
  },
  counter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  counterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
