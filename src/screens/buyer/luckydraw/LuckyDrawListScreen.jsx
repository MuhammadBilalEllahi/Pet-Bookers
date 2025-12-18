import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Text, Card, Layout, Spinner} from '@ui-kitten/components';
import {View, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';
import {axiosBuyerClient} from '../../../utils/axiosClient';
import {selectLuckyDraws, loadLuckyDraws} from '../../../store/buyersHome';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useTheme} from '../../../theme/ThemeContext';
import {Image} from 'react-native';
import {BASE_URLS} from '../../../store/configs';
import FastImageWithFallback from '../../../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';
import {Dimensions} from 'react-native';

const {width: screenWidth} = Dimensions.get('window');
const imageWidth = screenWidth; // 16px padding on each side
const imageHeight = (imageWidth * 4) / 9; // 16:9 ratio

// Dummy data for testing

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  date: {
    marginBottom: 8,
    fontSize: 14,
  },
  description: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  prizeContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  prizeLabel: {
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  prizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    borderRadius: 12,
    borderWidth: 0,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
  },
  gradientButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    width: '100%',
    alignSelf: 'stretch',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
  participationStatus: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  participationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  luckyNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default function LuckyDrawListScreen() {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {luckyDraws, luckyDrawsLoading, luckyDrawsError} =
    useSelector(selectLuckyDraws);
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const [participationStatus, setParticipationStatus] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(loadLuckyDraws());
  }, [dispatch]);

  // Check participation status for each lucky draw
  useEffect(() => {
    if (displayLuckyDraws.length > 0) {
      checkParticipationStatus();
    }
  }, [displayLuckyDraws]);

  const checkParticipationStatus = async () => {
    const statusMap = {};

    for (const luckyDraw of displayLuckyDraws) {
      try {
        const response = await axiosBuyerClient.get(
          `customer/can-participate?event_id=${luckyDraw.id}`,
        );
        // console.log('RESPOSNE', response);
        statusMap[luckyDraw.id] = {
          canParticipate: response.data?.can_participate || false,
          alreadyParticipated: !response.data?.can_participate || false,
          luckyNumber: response.data?.lucky_no || null,
          message: response.data?.message || null,
        };
      } catch (error) {
        console.error(
          `Error checking participation for event ${luckyDraw.id}:`,
          error,
        );
        statusMap[luckyDraw.id] = {
          canParticipate: true, // Default to true if API fails
          alreadyParticipated: false,
          message: null,
        };
      }
    }

    setParticipationStatus(statusMap);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(loadLuckyDraws());
    } catch (error) {
      console.error('Error refreshing lucky draws:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const displayLuckyDraws = Array.isArray(luckyDraws)
    ? luckyDraws
    : luckyDraws?.event
    ? [luckyDraws.event]
    : [];
  // console.log("displayLuckyDraws", displayLuckyDraws)
  if (luckyDrawsLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        {[0, 1, 2].map((_, index) => (
          <ShimmerCard key={index} />
        ))}
      </View>
    );
  }

  return (
    <Layout
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerText,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('luckyDrawListScreen.title')}
        </Text>
      </View>
      <FlatList
        data={displayLuckyDraws}
        contentContainerStyle={{paddingBottom: 80}}
        keyExtractor={item => item.id?.toString() || item.title}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({item}) => (
          <Card
            style={[
              styles.card,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
                shadowColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
              },
            ]}>
            {/* {console.log(`${BASE_URLS.lucky_draw_url}/${item.image}`)} */}
            <View style={styles.cardContent}>
              <View
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  backgroundColor: '#f0f0f0',
                  marginBottom: 12,
                  alignSelf: 'center',
                }}>
                <FastImageWithFallback
                  source={{
                    uri: `${BASE_URLS.lucky_draw_url}/${item.image}`,
                  }}
                  style={{width: '100%', height: '100%'}}
                  resizeMode={FastImage.resizeMode.cover}
                  resizeMethod="auto"
                  priority={FastImage.priority.high}
                />
              </View>
              <Text
                style={[
                  styles.title,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.date,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {' '}
                {new Date(item.updated_at).toDateString()}
              </Text>
              <Text
                style={[
                  styles.description,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {item.description}
              </Text>
              {/* Participation Status */}
              {participationStatus[item.id]?.alreadyParticipated && (
                <View
                  style={[
                    styles.participationStatus,
                    {
                      backgroundColor: isDark
                        ? theme['color-success-100']
                        : theme['color-success-200'],
                      borderColor: isDark
                        ? theme['color-success-300']
                        : theme['color-success-400'],
                    },
                  ]}>
                  <Text
                    style={[
                      styles.participationText,
                      {
                        color: isDark
                          ? theme['color-success-700']
                          : theme['color-success-800'],
                      },
                    ]}>
                    ✅{' '}
                    {t('luckyDrawInstance.form.alreadyParticipated') ||
                      'Already Participated'}
                  </Text>
                  {participationStatus[item.id]?.luckyNumber && (
                    <Text
                      style={[
                        styles.luckyNumberText,
                        {
                          color: isDark
                            ? theme['color-success-600']
                            : theme['color-success-700'],
                        },
                      ]}>
                      {t('luckyDrawInstance.form.yourLuckyNumber') ||
                        'Your Lucky Number'}
                      : {participationStatus[item.id].luckyNumber}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.gradientButton,
                  participationStatus[item.id]?.alreadyParticipated &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  if (!participationStatus[item.id]?.alreadyParticipated) {
                    navigation.navigate('LuckyDrawInstance', {luckyDraw: item});
                  }
                }}
                activeOpacity={
                  participationStatus[item.id]?.alreadyParticipated ? 1 : 0.8
                }
                disabled={participationStatus[item.id]?.alreadyParticipated}>
                <LinearGradient
                  colors={
                    participationStatus[item.id]?.alreadyParticipated
                      ? [theme['color-basic-400'], theme['color-basic-500']]
                      : [
                          theme['color-shadcn-primary'],
                          theme['color-primary-400'],
                        ]
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={{width: '100%'}}>
                  <Text
                    style={[
                      styles.buttonText,
                      participationStatus[item.id]?.alreadyParticipated &&
                        styles.disabledButtonText,
                    ]}>
                    {participationStatus[item.id]?.alreadyParticipated
                      ? t('luckyDrawInstance.form.alreadyParticipated') ||
                        'Already Participated'
                      : t('luckyDrawListScreen.applyNow')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text
            style={[
              styles.emptyText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {t('luckyDrawListScreen.noLuckyDraws')}
          </Text>
        }
      />
    </Layout>
  );
}

const ShimmerCard = () => {
  const {theme, isDark} = useTheme();
  const shimmerColors = isDark
    ? [
        theme['color-shadcn-card'],
        theme['color-shadcn-secondary'],
        theme['color-shadcn-card'],
      ]
    : [
        theme['color-basic-200'],
        theme['color-basic-300'],
        theme['color-basic-200'],
      ];

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-card']
            : theme['color-basic-100'],
          shadowColor: isDark
            ? theme['color-shadcn-border']
            : theme['color-basic-400'],
        },
      ]}>
      <View style={styles.cardContent}>
        <ShimmerPlaceholder
          style={{height: 20, width: '60%', marginBottom: 12, borderRadius: 8}}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={{height: 14, width: '40%', marginBottom: 8, borderRadius: 6}}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={{height: 60, width: '100%', marginBottom: 12, borderRadius: 6}}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={{height: 44, width: '100%', borderRadius: 12}}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
      </View>
    </Card>
  );
};
