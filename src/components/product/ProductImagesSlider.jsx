import {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  View,
  Text,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';

const {width: windowWidth} = Dimensions.get('window');
const height = (windowWidth - 16) / 1.77;

let slideChangRef = null;

export const ProductImagesSlider = ({slideList}) => {
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
        renderItem={({item}) => {
          return <ProductImageSlide data={item} />;
        }}
        pagingEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
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

const ProductImageSlide = ({data}) => {
  return (
    <View
      style={{
        width: windowWidth,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        source={{uri: data.image}}
        style={{width: windowWidth - 16, height: height}}></Image>
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
