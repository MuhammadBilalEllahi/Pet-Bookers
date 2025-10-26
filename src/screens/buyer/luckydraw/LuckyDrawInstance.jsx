import React, {useState, useEffect} from 'react';
import {Input, Button, Text, Layout, Icon} from '@ui-kitten/components';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {LinearGradient} from 'react-native-linear-gradient';
import {axiosBuyerClient} from '../../../utils/axiosClient';
import CustomAlert from './CustomAlert';
import {useTheme} from '../../../theme/ThemeContext';
import {
  selectCustomerInfo,
  selectIsBuyerAuthenticated,
} from '../../../store/user';
import {BASE_URLS} from '../../../store/configs';
import {Dimensions} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import FastImageWithFallback from '../../../components/common/FastImageWithFallback';
import {citiesByState, COUNTRY_CODES} from '../../../utils/constants';

const {width: screenWidth} = Dimensions.get('window');
const imageWidth = screenWidth; // 16px padding on each side
const imageHeight = (imageWidth * 4) / 9; // 16:9 ratio

// Dummy data for testing
// const dummyLuckyDraw = {
//   id: 1,
//   title: "Shahzaib New Farm Lucky Draw",
//   date: "15 April"
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  iconImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  welcomeText: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  infoBox: {
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
  },
  form: {
    marginHorizontal: 24,
  },
  input: {
    marginBottom: 16,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 15,
  },
  gradientButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  participationStatus: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
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
  cityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cityModalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  cityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  cityModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cityModalSearchContainer: {
    padding: 16,
    paddingTop: 12,
  },
  cityModalSearchInput: {
    borderRadius: 4,
  },
  cityModalList: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  cityModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  cityModalOptionText: {
    fontSize: 16,
  },
  phoneRowImproved: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  countryCodeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    minWidth: 90,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCodeDropdownIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  phoneInputImproved: {
    flex: 1,
    marginVertical: 0,
    marginLeft: 0,
    borderWidth: 0,
    paddingLeft: 2,
  },
  countryModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryModal: {
    borderRadius: 10,
    width: 280,
    maxHeight: 350,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  countryModalItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  countryModalItemText: {
    fontSize: 16,
  },
});

export default function LuckyDrawInstance() {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {luckyDraw} = useRoute()?.params;
  const {theme, isDark} = useTheme();

  // Get user data from Redux store
  const customerInfo = useSelector(selectCustomerInfo);
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+92');
  const [submitting, setSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [luckyNumber, setLuckyNumber] = useState(null);
  const [participationStatus, setParticipationStatus] = useState(null);
  const [checkingParticipation, setCheckingParticipation] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Get all cities from constants
  const getAllCities = () => {
    const allCities = [];
    Object.values(citiesByState).forEach(stateCities => {
      allCities.push(...stateCities);
    });
    return allCities.sort();
  };

  // Filter cities based on search query
  const getFilteredCities = () => {
    const allCities = getAllCities();
    if (!citySearchQuery.trim()) {
      return allCities;
    }
    return allCities.filter(cityName =>
      cityName.toLowerCase().includes(citySearchQuery.toLowerCase()),
    );
  };

  // Handle city selection
  const handleCitySelect = selectedCity => {
    setCity(selectedCity);
    setShowCityModal(false);
    setCitySearchQuery('');
  };

  // Check participation status when component mounts
  useEffect(() => {
    checkParticipationStatus();
  }, [luckyDraw?.id]);

  // Populate form with user data when component mounts or user data changes
  useEffect(() => {
    if (isBuyerAuthenticated && customerInfo) {
      // Extract name from f_name and l_name, or use existing name field
      const fullName =
        customerInfo.f_name && customerInfo.l_name
          ? `${customerInfo.f_name} ${customerInfo.l_name}`.trim()
          : customerInfo.name || '';

      setName(fullName);

      // Parse phone number to extract country code and phone number
      const userPhone = customerInfo.phone || '';
      if (userPhone) {
        // Try to find matching country code
        const foundCountry = COUNTRY_CODES.find(code =>
          userPhone.startsWith(code.code),
        );
        if (foundCountry) {
          setCountryCode(foundCountry.code);
          setPhone(userPhone.substring(foundCountry.code.length));
        } else {
          // Default to Pakistan code if no match
          setCountryCode('+92');
          setPhone(userPhone);
        }
      }

      // If customer has city information, use it
      // Check for various possible city field names
      const userCity =
        customerInfo.city ||
        customerInfo.address?.city ||
        customerInfo.shipping_address?.city ||
        '';
      setCity(userCity);
    }
  }, [isBuyerAuthenticated, customerInfo]);

  const checkParticipationStatus = async () => {
    if (!luckyDraw?.id) return;

    try {
      setCheckingParticipation(true);
      const response = await axiosBuyerClient.get(
        `customer/can-participate?event_id=${luckyDraw.id}`,
      );

      setParticipationStatus({
        canParticipate: response.data?.can_participate || false,
        alreadyParticipated: !response.data?.can_participate || false,
        luckyNumber: response.data?.lucky_no || null,
        message: response.data?.message || null,
      });

      // If already participated, show the lucky number
      if (!response.data?.can_participate && response.data?.lucky_no) {
        setLuckyNumber(response.data.lucky_no);
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error checking participation status:', error);
      setParticipationStatus({
        canParticipate: true, // Default to true if API fails
        alreadyParticipated: false,
        luckyNumber: null,
        message: null,
      });
    } finally {
      setCheckingParticipation(false);
    }
  };

  const handleSubmit = async () => {
    // Check if already participated
    if (participationStatus?.alreadyParticipated) {
      Alert.alert(
        t('common.error'),
        t('luckyDrawInstance.form.alreadyParticipated') ||
          'You have already participated in this lucky draw',
      );
      return;
    }

    // Validate required fields
    if (!name.trim()) {
      Alert.alert(
        t('common.error'),
        t('luckyDrawInstance.form.nameRequired') || 'Name is required',
      );
      return;
    }

    if (!city.trim()) {
      Alert.alert(
        t('common.error'),
        t('luckyDrawInstance.form.cityRequired') || 'City is required',
      );
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        t('common.error'),
        t('luckyDrawInstance.form.phoneRequired') || 'Phone number is required',
      );
      return;
    }

    setSubmitting(true);
    try {
      const fullPhoneNumber = `${countryCode}${phone.trim()}`;
      const response = await axiosBuyerClient.post('luckydraw/submit', {
        event_id: luckyDraw.id,
        name: name.trim(),
        city: city.trim(),
        phone: fullPhoneNumber,
      });
      const luckyNumber = response?.data?.lucky_no;
      setLuckyNumber(luckyNumber);
      setShowAlert(true);

      CustomAlert({
        visible: true,
        luckyNumber: luckyNumber,
        onClose: () => {
          setSubmitting(false);
          navigation.goBack();
        },
      });

      // console.log("Lucky Draw Submission Response: ", response);
    } catch (error) {
      console.error('Error submitting lucky draw: ', error, error?.response);
      Alert.alert(
        t('common.error'),
        error?.response?.data?.message ||
          t('luckyDrawInstance.form.submitError') ||
          'Failed to submit. Please try again.',
      );
    }
    setSubmitting(false);
  };

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
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
          },
        ]}>
        <Icon
          name="close-outline"
          fill={
            isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600']
          }
          style={styles.closeIcon}
          onPress={() => navigation.goBack()}
        />
        <Text
          style={[
            styles.headerText,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('luckyDrawInstance.title')}
        </Text>
      </View>
      {luckyDraw.image && (
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
            onLoadStart={() => console.log('🟡 FastImage loading started')}
            onLoad={() => console.log('✅ FastImage loaded successfully')}
            onError={error => console.log('❌ FastImage load error:', error)}
            onLoadEnd={() => console.log('⚪ FastImage load ended')}
            source={{
              uri: `${BASE_URLS.lucky_draw_url}/${luckyDraw.image}`,
              priority: FastImage.priority.high,
            }}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 100, // Ensure minimum height
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 50}}>
        {/* Icon and Welcome */}
        <View style={styles.iconContainer}>
          <FastImage
            onLoadStart={() => console.log('🟡 FastImage loading started')}
            onLoad={() => console.log('✅ FastImage loaded successfully')}
            onError={error => console.log('❌ FastImage load error:', error)}
            onLoadEnd={() => console.log('⚪ FastImage load ended')}
            source={require('../../../../assets/new/bottom_nav/lucky_draw.png')}
            style={styles.iconImage}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text
            style={[
              styles.welcomeText,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('luckyDrawInstance.welcomeMessage')}
          </Text>
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-200'],
            },
          ]}>
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('luckyDrawInstance.infoLabels.title')}
            </Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {luckyDraw.title}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('luckyDrawInstance.infoLabels.description')}
            </Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {luckyDraw.description}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text
              style={[
                styles.infoLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('luckyDrawInstance.infoLabels.date')}
            </Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {new Date(luckyDraw.updated_at).toDateString()}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Info message for user data pre-population */}
          {isBuyerAuthenticated && customerInfo && (
            <View
              style={[
                styles.infoMessage,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-primary-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-primary-200'],
                },
              ]}>
              <Icon
                name="info"
                style={styles.infoIcon}
                fill={
                  isDark
                    ? theme['color-shadcn-primary']
                    : theme['color-primary-500']
                }
              />
              <Text
                style={[
                  styles.infoText,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-primary-700'],
                  },
                ]}>
                {t('luckyDrawInstance.form.dataPreFilled') ||
                  'Your profile data has been filled automatically. You can edit any field if needed.'}
              </Text>
            </View>
          )}

          <Input
            label={t('luckyDrawInstance.form.nameLabel')}
            placeholder={t('luckyDrawInstance.form.namePlaceholder')}
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
              },
            ]}
            textStyle={{
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}
            placeholderTextColor={
              isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600']
            }
            size="large"
          />
          <TouchableOpacity
            onPress={() => setShowCityModal(true)}
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                borderWidth: 1,
                borderRadius: 4,
                paddingHorizontal: 12,
                paddingVertical: 14,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            ]}>
            <View style={{flex: 1}}>
              <Text
                style={{
                  fontSize: 12,
                  marginBottom: 4,
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                }}>
                {t('luckyDrawInstance.form.cityLabel')}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: city
                    ? isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900']
                    : isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                }}>
                {city || t('luckyDrawInstance.form.cityPlaceholder')}
              </Text>
            </View>
            <Icon
              name="search-outline"
              fill={
                isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600']
              }
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>
          <View style={{marginBottom: 16}}>
            <View
              style={[
                styles.phoneRowImproved,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}>
              <TouchableOpacity
                style={[
                  styles.countryCodeTouchable,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-secondary']
                      : theme['color-basic-200'],
                    borderRightColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                onPress={() => setCountryModalVisible(true)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.countryCodeText,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {COUNTRY_CODES.find(c => c.code === countryCode)?.label ||
                    '+92'}
                </Text>
                <Text
                  style={[
                    styles.countryCodeDropdownIcon,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  ▼
                </Text>
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <View style={{paddingHorizontal: 12, paddingVertical: 0}}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    }}>
                    {t('luckyDrawInstance.form.phoneLabel')}
                  </Text>
                </View>
                <Input
                  placeholder={t('luckyDrawInstance.form.phonePlaceholder')}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  textStyle={[
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}
                  style={[
                    styles.phoneInputImproved,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                    },
                  ]}
                  placeholderTextColor={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  maxLength={15}
                />
              </View>
            </View>
          </View>
          {/* Show participation status if already participated */}
          {participationStatus?.alreadyParticipated && (
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
              {participationStatus?.luckyNumber && (
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
                  : {participationStatus.luckyNumber}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.gradientButton,
              participationStatus?.alreadyParticipated && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={
              submitting ||
              participationStatus?.alreadyParticipated ||
              checkingParticipation
            }
            activeOpacity={participationStatus?.alreadyParticipated ? 1 : 0.8}>
            <LinearGradient
              colors={
                participationStatus?.alreadyParticipated
                  ? [theme['color-basic-400'], theme['color-basic-500']]
                  : [theme['color-shadcn-primary'], theme['color-primary-400']]
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text
                style={[
                  styles.buttonText,
                  participationStatus?.alreadyParticipated &&
                    styles.disabledButtonText,
                ]}>
                {checkingParticipation
                  ? t('common.loading') || 'Checking...'
                  : submitting
                  ? t('luckyDrawInstance.form.submitting')
                  : participationStatus?.alreadyParticipated
                  ? t('luckyDrawInstance.form.alreadyParticipated') ||
                    'Already Participated'
                  : t('luckyDrawInstance.form.submit')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <CustomAlert
            visible={showAlert}
            luckyNumber={luckyNumber}
            onClose={() => setShowAlert(false)}
          />
        </View>
      </ScrollView>

      {/* City Selection Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}>
        <TouchableOpacity
          style={styles.cityModalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowCityModal(false);
            setCitySearchQuery('');
          }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={[
              styles.cityModalContent,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            {/* Modal Header */}
            <View
              style={[
                styles.cityModalHeader,
                {
                  borderBottomColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-300'],
                },
              ]}>
              <Text
                style={[
                  styles.cityModalTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('luckyDrawInstance.form.selectCity') || 'Select City'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCityModal(false);
                  setCitySearchQuery('');
                }}>
                <Icon
                  name="close"
                  fill={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  style={{width: 24, height: 24}}
                />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.cityModalSearchContainer}>
              <Input
                placeholder={
                  t('luckyDrawInstance.form.searchCityPlaceholder') ||
                  'Search city...'
                }
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                accessoryLeft={props => (
                  <Icon
                    {...props}
                    name="search-outline"
                    fill={
                      isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                  />
                )}
                style={[
                  styles.cityModalSearchInput,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-200'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                textStyle={{
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600']
                }
              />
            </View>

            {/* City List */}
            <FlatList
              data={getFilteredCities()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.cityModalOption,
                    {
                      backgroundColor:
                        city === item
                          ? isDark
                            ? theme['color-shadcn-secondary']
                            : theme['color-primary-100']
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleCitySelect(item)}>
                  <Text
                    style={[
                      styles.cityModalOptionText,
                      {
                        color:
                          city === item
                            ? theme['color-shadcn-primary']
                            : isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        fontWeight: city === item ? '600' : '400',
                      },
                    ]}>
                    {item}
                  </Text>
                  {city === item && (
                    <Icon
                      name="checkmark"
                      fill={theme['color-shadcn-primary']}
                      style={{width: 20, height: 20}}
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.cityModalList}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Country Code Selection Modal */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}>
        <TouchableOpacity
          style={[
            styles.countryModalOverlay,
            {
              backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
            },
          ]}
          activeOpacity={1}
          onPressOut={() => setCountryModalVisible(false)}>
          <View
            style={[
              styles.countryModal,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.code}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.countryModalItem,
                    {
                      borderBottomColor: isDark
                        ? theme['color-shadcn-border']
                        : theme['color-basic-400'],
                    },
                  ]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.countryModalItemText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </Layout>
  );
}
