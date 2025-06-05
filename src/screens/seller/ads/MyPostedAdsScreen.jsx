import React, { useEffect } from 'react';
import {Dimensions, ScrollView, View, Image, StyleSheet, TouchableOpacity, I18nManager, RefreshControl} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { axiosSellerClient } from '../../../utils/axiosClient';
import { BASE_URL } from '../../../utils/constants';
import { AppScreens } from '../../../navigators/AppNavigator';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const {width: windowWidth} = Dimensions.get('screen');

// Commenting out hardcoded data since we're getting it from API
/*
const ads = [
  {
    id: 1,
    user: 'Atif Maqsood',
    title: 'Big Furious Lion',
    price: 'Rs 345,000',
    created: '24 Sep 2024',
    views: 26,
    messages: 3,
    badge: 'Free Ad',
    featured: false,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    user: 'Atif Maqsood',
    title: 'Big Furious Lion',
    price: 'Rs 345,000',
    created: '24 Sep 2024',
    views: 1325,
    messages: 62,
    badge: 'Featured',
    featured: true,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
];
*/

const AdCardShimmer = ({ isDark, theme }) => {
  const isRTL = I18nManager.isRTL;
  
  return (
    <View style={[styles.card, { 
      backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
      borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
    }]}>
      <View style={[styles.cardTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={[styles.avatar, { 
            backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-300'],
            marginRight: isRTL ? 0 : 10,
            marginLeft: isRTL ? 10 : 0
          }]}
        />
        <View style={[styles.userInfoContainer, { flex: 1 }]}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{ width: '60%', height: 15, marginBottom: 8 }}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{ width: '80%', height: 15, marginBottom: 8 }}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={{ width: '40%', height: 15 }}
          />
        </View>
      </View>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={{ width: '30%', height: 12, marginBottom: 8, marginLeft: 2 }}
      />
      <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: '20%', height: 12, marginRight: 16 }}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={{ width: '20%', height: 12 }}
        />
      </View>
      <ShimmerPlaceholder
        LinearGradient={LinearGradient}
        style={[styles.featuredBtn, { marginTop: 8 }]}
      />
    </View>
  );
};

export const MyPostedAdsScreen = ({navigation}) => {
  const { isDark, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [ads, setAds] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchMyAds = async () => {
    try {
      const response = await axiosSellerClient.get(`products/list`);

      const checking = await axiosSellerClient.get(`products/details/49`);
      console.log('checking', checking.data);
      if (response.data) {
        // Transform API data to match our UI structure
        const transformedAds = response.data.map(ad => ({
          id: ad.id,
          user: 'Seller', // You might want to get this from user data
          title: ad.name || 'Untitled',
          price: `Rs ${ad.unit_price}`,
          created: new Date(ad.created_at).toLocaleDateString(),
          views: 0, // These might need to be added to the API
          messages: 0,
          badge: ad.featured_status ? 'Featured' : 'Free Ad',
          featured: ad.featured_status === 1,
          avatar: ad.thumbnail ? `${BASE_URL}/uploads/${ad.thumbnail}` : 'https://randomuser.me/api/portraits/men/32.jpg',
        }));
        setAds(transformedAds);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMyAds();
  }, []);

  const renderShimmer = () => {
    return Array(3).fill(0).map((_, index) => (
      <AdCardShimmer key={index} isDark={isDark} theme={theme} />
    ));
  };

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 16, paddingBottom: 52}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme['color-shadcn-primary']]}
            tintColor={theme['color-shadcn-primary']}
            progressBackgroundColor={isDark ? theme['color-shadcn-card'] : theme['color-basic-200']}
          />
        }
      >
        <Text style={[styles.header, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>{t('myAds.header')}</Text>
        <View style={[styles.tabRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={[styles.tab, styles.tabActive, { backgroundColor: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
            <Text style={[styles.tabTextActive, { color: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>{t('myAds.tabs.all')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-200'] }]}>
            <Text style={[styles.tabText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{t('myAds.tabs.active')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-200'] }]}>
            <Text style={[styles.tabText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{t('myAds.tabs.closed')}</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          renderShimmer()
        ) : (
          ads.map((ad, idx) => (
            <View key={ad.id} style={[styles.card, { 
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
            }]}>
              <TouchableOpacity onPress={() => navigation.navigate(AppScreens.PRODUCT_DETAIL, { productId: ad.id })}>
                <View style={[styles.cardTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Image source={{uri: ad.avatar}} style={[styles.avatar, { 
                    backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-300'],
                    marginRight: isRTL ? 0 : 10,
                    marginLeft: isRTL ? 10 : 0
                  }]} />
                  <View style={[styles.userInfoContainer, { flex: 1 }]}>
                    <Text style={[styles.userName, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>{ad.user}</Text>
                    <Text style={[styles.adTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>{ad.title}</Text>
                    <Text style={[styles.price, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{ad.price}</Text>
                  </View>
                  <TouchableOpacity style={{padding: 4}} onPress={() => navigation.navigate(AppScreens.PRODUCT_DETAIL_EDIT, { productId: ad.id })}>
                    <Icon name="more-vertical" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={{width: 22, height: 22}} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.created, { 
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                  textAlign: isRTL ? 'right' : 'left'
                }]}>{t('myAds.createdOn')} {ad.created}</Text>
                <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[styles.statItem, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Icon name="eye" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={[styles.statIcon, isRTL && { marginLeft: 3, marginRight: 0 }]} />
                    <Text style={[styles.statText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{ad.views} {t('myAds.views')}</Text>
                  </View>
                  <View style={[styles.statItem, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Icon name="message-circle" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={[styles.statIcon, isRTL && { marginLeft: 3, marginRight: 0 }]} />
                    <Text style={[styles.statText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>{ad.messages} {t('myAds.messages')}</Text>
                  </View>
                  <View style={{flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end'}}>
                    <View style={[
                      styles.badge, 
                      ad.featured ? styles.badgeFeatured : styles.badgeFree,
                      { backgroundColor: ad.featured ? theme['color-shadcn-primary'] : (isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']) }
                    ]}>
                      <Text style={[
                        styles.badgeText, 
                        { color: ad.featured ? theme['color-shadcn-primary-foreground'] : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']) }
                      ]}>{ad.featured ? t('myAds.badges.featured') : t('myAds.badges.free')}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.featuredBtn, { backgroundColor: theme['color-shadcn-primary'] }]}>
                <Text style={[styles.featuredBtnText, { color: theme['color-shadcn-primary-foreground'] }]}>{t('myAds.tryFeatured')}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#222',
  },
  tabText: {
    fontWeight: 'bold',
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userInfoContainer: {
    marginLeft: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  adTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  created: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    width: 18,
    height: 18,
    marginRight: 3,
  },
  statText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
  badgeFree: {
    backgroundColor: '#eee',
  },
  badgeFeatured: {
    backgroundColor: '#FFD600',
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  badgeTextFree: {
    color: '#888',
  },
  badgeTextFeatured: {
    color: '#222',
  },
  featuredBtn: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
