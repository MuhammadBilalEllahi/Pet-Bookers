import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Layout, Text, useTheme, Icon} from '@ui-kitten/components';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {Dimensions} from 'react-native';
const {width} = Dimensions.get('window');

export default AddProductSuccessAndShowFeaturedButton = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {t} = useTranslation();

  const handleClose = () => {
    navigation.goBack();
  };
  const handleTryFeatured = () => {
    navigation.navigate('ProductFeatureCheckoutScreen');
  };
  return (
    <Layout style={styles.container} level="3">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Success Checkmark */}
        <View style={styles.checkmarkContainer}>
          <Image
            source={require('../../../../assets/new/icons/check-mark.png')}
            style={styles.checkmark}
            resizeMode="contain"
          />
          <Text style={styles.successText}>{t('common.yourAdWas')}</Text>
          <Text style={styles.successTextBold}>
            {t('common.successfullyPosted')}
          </Text>
        </View>
        {/* Divider */}
        <View style={styles.divider} />
        {/* Featured Ads Section */}
        <Text style={[styles.featuredTitle, {marginBottom: 25}]}>
          {t('common.getBetterAndQuickerDeals')}
          {'\n'} {t('common.with')}{' '}
          <Text style={styles.featuredBadge}>{t('common.featured')}</Text>{' '}
          {t('common.featuredAds')}
        </Text>
        <View style={styles.featuredCardsRow}>
          {[1, 2].map((item, idx) => (
            <View key={idx} style={styles.featuredCard}>
              <View style={styles.featuredImageBox}>
                <Image
                  source={require('../../../../assets/new/icons/check-mark.png')}
                  style={styles.featuredImage}
                  resizeMode="contain"
                />
                <View style={styles.featuredLabel}>
                  <Text style={styles.featuredLabelText}>
                    {t('common.featured')}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{t('common.yourListing')}</Text>
              <Text style={styles.cardPrice}>PKR 120,000</Text>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardLocation}>
                  📍 {idx === 0 ? 'Saddar, Karachi' : 'Malir, Karachi'}
                </Text>
                <Text style={styles.cardDate}>
                  {idx === 0 ? '22 Sep' : '24 Sep'}
                </Text>
              </View>
            </View>
          ))}
        </View>
        {/* Try Featured Ads Button */}
        <TouchableOpacity
          style={styles.tryFeaturedBtn}
          onPress={handleTryFeatured}>
          <Text style={styles.tryFeaturedBtnText}>{t('tryFeatured')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
    backgroundColor: '#fff',
  },
  closeBtn: {
    padding: 4,
    marginRight: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginLeft: 2,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  checkmark: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  successText: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 0,
  },
  successTextBold: {
    fontSize: 22,
    color: '#444',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#eee',
    marginVertical: 18,
  },
  featuredTitle: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: 'bold',
  },
  featuredBadge: {
    backgroundColor: '#FFD600',
    color: '#222',
    borderRadius: 4,
    paddingHorizontal: 6,
    fontWeight: 'bold',
    fontSize: 16,
    overflow: 'hidden',
  },
  featuredCardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    width: width * 0.45,
    alignItems: 'flex-start',
    padding: 0,
    marginHorizontal: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  featuredImageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#acacac',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  featuredImage: {
    width: 120,
    height: 120,
    tintColor: '#888',
  },
  featuredLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: '#FFE082',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  featuredLabelText: {
    color: '#222',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'none',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 0,
  },
  cardPrice: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#888',
    marginLeft: 10,
    marginBottom: 0,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 9,
  },
  cardLocation: {
    fontSize: 11,
    color: '#888',
  },
  cardDate: {
    fontSize: 8,
    color: '#222',
    fontWeight: '400',
  },
  tryFeaturedBtn: {
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FF512F',
    shadowColor: '#FF512F',
  },
  tryFeaturedBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
