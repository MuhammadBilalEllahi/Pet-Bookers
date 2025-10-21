import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Icon,
  CheckBox,
  Input,
  Select,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {AppScreens} from '../../../navigators/AppNavigator';
import {axiosBuyerClient} from '../../../utils/axiosClient';
import {useTheme} from '../../../theme/ThemeContext';
import Geolocation from '@react-native-community/geolocation';

export default function ShipingDetails({route}) {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();

  // Get checkout data from previous screen
  const checkoutData = route?.params?.checkoutData || null;

  // Address Management
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingIndex, setSelectedShippingIndex] = useState(
    new IndexPath(0),
  );
  const [loading, setLoading] = useState(true);

  // Billing Address
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    contact_person_name: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
  });

  // Add New Address Form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    contact_person_name: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    address_type: 'home',
    latitude: '0',
    longitude: '0',
    is_billing: 0,
  });

  // GPS Location
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showCoordinateInputs, setShowCoordinateInputs] = useState(false);

  // Payment handling
  const [easyPaisaNumber, setEasyPaisaNumber] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Cart Summary from checkout data or default
  const cartSummary = checkoutData
    ? checkoutData.totals
    : {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      };

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to autofill your address.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setLocationPermission(true);
          return true;
        } else {
          setLocationPermission(false);
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use GPS functionality',
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      // iOS permissions are handled automatically by Geolocation
      setLocationPermission(true);
      return true;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setFetchingLocation(true);

    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        // console.log('Current position:', latitude, longitude);

        // Update coordinates
        setNewAddress(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        // Get address from coordinates
        await getAddressFromCoordinates(latitude, longitude);
        // Hide coordinate inputs after getting GPS location
        setShowCoordinateInputs(false);
        // Open add address form if not already open
        if (!showAddAddress) {
          setShowAddAddress(true);
        }
        setFetchingLocation(false);
      },
      error => {
        console.error('Location error:', error);
        setFetchingLocation(false);
        Alert.alert(
          'Location Error',
          `Failed to get current location: ${error.message}`,
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  // Geocode coordinates to address using the API
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await axiosBuyerClient.get('mapapi/geocode-api', {
        params: {
          lat: lat,
          lng: lng,
        },
      });

      // console.log('Geocode response:', response.data);

      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        const addressComponents = response.data.results[0].address_components;
        const formattedAddress = response.data.results[0].formatted_address;

        // Parse address components
        let country = '';
        let city = '';
        let zip = '';

        addressComponents.forEach(component => {
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (
            component.types.includes('locality') ||
            component.types.includes('administrative_area_level_2')
          ) {
            city = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            zip = component.long_name;
          }
        });

        // Update address fields
        setNewAddress(prev => ({
          ...prev,
          address: formattedAddress || prev.address,
          city: city || prev.city,
          zip: zip || prev.zip,
          country: country || prev.country,
        }));

        Alert.alert(
          'Success',
          'Address automatically filled from your current location!',
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Geocoding Error',
        'Could not get address from coordinates, but GPS coordinates have been saved.',
      );
    }
  };

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosBuyerClient.get('customer/address/list');
      // console.log('Addresses Response:', response.data);
      setAddresses(response.data || []);

      // If addresses exist, select the first one by default
      if (response.data && response.data.length > 0) {
        setSelectedShippingIndex(new IndexPath(0));
        if (sameAsShipping) {
          setBillingAddress({
            contact_person_name: response.data[0].contact_person_name,
            phone: response.data[0].phone,
            address: response.data[0].address,
            city: response.data[0].city,
            zip: response.data[0].zip,
            country: response.data[0].country,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      Alert.alert('Error', 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  // Add new address
  const handleAddAddress = async () => {
    try {
      if (
        !newAddress.contact_person_name ||
        !newAddress.phone ||
        !newAddress.address ||
        !newAddress.city
      ) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const response = await axiosBuyerClient.post(
        'customer/address/add',
        newAddress,
      );
      // console.log('Add Address Response:', response.data);

      Alert.alert('Success', 'Address added successfully');
      setShowAddAddress(false);
      setNewAddress({
        contact_person_name: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: '',
        address_type: 'home',
        latitude: '0',
        longitude: '0',
        is_billing: 0,
      });

      // Refresh addresses
      await fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to add address',
      );
    }
  };

  // Handle shipping address selection
  const handleShippingAddressChange = index => {
    setSelectedShippingIndex(index);
    const selectedAddress = addresses[index.row];

    if (selectedAddress && sameAsShipping) {
      setBillingAddress({
        contact_person_name: selectedAddress.contact_person_name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        zip: selectedAddress.zip,
        country: selectedAddress.country,
      });
    }
  };

  // Handle same as shipping checkbox
  const handleSameAsShipping = checked => {
    setSameAsShipping(checked);

    if (checked && addresses[selectedShippingIndex.row]) {
      const selectedAddress = addresses[selectedShippingIndex.row];
      setBillingAddress({
        contact_person_name: selectedAddress.contact_person_name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        zip: selectedAddress.zip,
        country: selectedAddress.country,
      });
    } else if (!checked) {
      setBillingAddress({
        contact_person_name: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: '',
      });
    }
  };

  // Place order for Cash on Delivery
  const placeCODOrder = async billingAddressId => {
    try {
      setPlacingOrder(true);

      const orderData = {
        billing_address_id: billingAddressId,
        order_note: checkoutData?.orderNote || '',
      };

      const response = await axiosBuyerClient.get('customer/order/place', {
        params: orderData,
      });
      // console.log('COD Order response:', response.data);

      Alert.alert(
        'Order Placed Successfully!',
        'Your order has been placed. You will pay cash on delivery.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(AppScreens.BUYER_HOME_MAIN),
          },
        ],
      );
    } catch (error) {
      console.error('Error placing COD order:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to place order',
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // Place order for EasyPaisa using new mobile API
  const placeEasyPaisaOrder = async billingAddressId => {
    if (!easyPaisaNumber.trim()) {
      Alert.alert('Error', 'Please enter your EasyPaisa account number');
      return;
    }

    try {
      setPlacingOrder(true);

      // Step 1: Initiate payment to validate data
      // console.log('Initiating EasyPaisa payment...');
      const initiateResponse = await axiosBuyerClient.post(
        'payment/easypaisa/initiate',
        {
          mobile_number: easyPaisaNumber,
          billing_address_id: billingAddressId,
        },
      );

      // console.log('EasyPaisa initiate response:', initiateResponse.data, initiateResponse.data?.message, initiateResponse.status, initiateResponse.data?.data);

      if (initiateResponse.data.status !== 'success') {
        Alert.alert(
          'Error',
          initiateResponse.data.message || 'Failed to initiate payment',
        );
        return;
      }
      // console.log("insitalREspone", initiateResponse.data?.data)
      const paymentData = initiateResponse.data.data;

      // Show confirmation dialog with payment details
      const confirmPayment = await new Promise(resolve => {
        Alert.alert(
          'Confirm EasyPaisa Payment',
          `Amount: Rs ${cartSummary.total.toLocaleString()}\nMobile: ${easyPaisaNumber}\nItems: ${
            paymentData.cart_items_count
          }\n\nProceed with payment?`,
          [
            {text: 'Cancel', onPress: () => resolve(false)},
            {text: 'Confirm Payment', onPress: () => resolve(true)},
          ],
        );
      });

      if (!confirmPayment) {
        return;
      }

      // Step 2: Complete payment processing
      // console.log('Completing EasyPaisa payment...');
      const completeResponse = await axiosBuyerClient.post(
        'payment/easypaisa/complete',
        {
          mobile_number: easyPaisaNumber,
          amount: Number(cartSummary.total),
          billing_address_id: billingAddressId,
          order_note: checkoutData?.orderNote || '',
        },
      );

      // console.log('EasyPaisa complete response:', completeResponse.data, completeResponse.data?.message, completeResponse.status, completeResponse.data?.data);

      if (completeResponse.data.status === 'success') {
        const orderData = completeResponse.data.data;

        Alert.alert(
          'Payment Successful!',
          `Your order has been placed successfully!\n\nOrder Group ID: ${
            orderData.order_group_id
          }\nTransaction ID: ${
            orderData.transaction_id
          }\nTotal Amount: Rs ${orderData.total_amount.toLocaleString()}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate(AppScreens.BUYER_HOME_MAIN),
            },
          ],
        );
      } else {
        console.error('error', completeResponse.data.message);
        Alert.alert(
          'Payment Failed',
          completeResponse.data.message ||
            'Payment processing failed. Please try again.',
        );
      }
    } catch (error) {
      console.error(
        'Error processing EasyPaisa payment:',
        error,
        error?.response?.data?.message,
        error?.response?.data?.errors,
      );

      // Handle different types of errors
      let errorMessage = 'Failed to process payment';

      if (error?.response?.data) {
        if (error.response.data.payment_response) {
          errorMessage = `Payment failed: ${error.response.data.payment_response}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors)
            .flat()
            .join(', ');
        }
      }
      console.error('error', error);
      console.error('error', error?.response?.data?.message);
      console.error('error', error?.response?.data?.errors);
      console.error('error', error?.response?.data?.payment_response);
      console.error('error', error?.response?.data?.payment_response);
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleContinue = () => {
    if (addresses.length === 0) {
      Alert.alert('Error', 'Please add a shipping address first');
      return;
    }

    if (!sameAsShipping) {
      if (
        !billingAddress.contact_person_name ||
        !billingAddress.phone ||
        !billingAddress.address
      ) {
        Alert.alert('Error', 'Please fill in billing address details');
        return;
      }
    }

    if (!checkoutData) {
      Alert.alert('Error', 'No checkout data found. Please go back to cart.');
      return;
    }

    const billingAddressId = sameAsShipping
      ? addresses[selectedShippingIndex.row]?.id
      : billingAddress.id;

    if (!billingAddressId) {
      Alert.alert('Error', 'Please select a valid billing address');
      return;
    }

    const paymentMethod =
      checkoutData.selectedPaymentMethod.title.toLowerCase();

    if (paymentMethod.includes('cod') || paymentMethod.includes('cash')) {
      // Cash on Delivery - place order directly
      placeCODOrder(billingAddressId);
    } else if (paymentMethod.includes('easypaisa')) {
      // EasyPaisa - place order with payment details
      placeEasyPaisaOrder(billingAddressId);
    } else {
      // Other payment methods - go to payment page
      const shippingBillingData = {
        shippingAddress: addresses[selectedShippingIndex.row],
        billingAddress: billingAddress,
        sameAsShipping: sameAsShipping,
        checkoutData,
      };

      navigation.navigate(AppScreens.PAYMENT_PAGE, {shippingBillingData});
    }
  };

  useEffect(() => {
    fetchAddresses();
    // Check location permission on mount
    if (Platform.OS === 'ios') {
      setLocationPermission(true);
    }
  }, []);

  if (loading) {
    return (
      <Layout
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <Icon
          name="loader-outline"
          fill={theme['color-shadcn-primary']}
          style={{width: 40, height: 40}}
        />
        <Text
          style={{
            marginTop: 16,
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          }}>
          Loading addresses...
        </Text>
      </Layout>
    );
  }

  return (
    <ScrollView>
      <Layout
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        {/* Progress Bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressStepActive}>
            <Icon
              name="person-outline"
              fill="#fff"
              style={styles.progressIcon}
            />
          </View>
          <View style={styles.progressLineActive} />
          <View style={styles.progressStepActive}>
            <Icon
              name="shopping-bag-outline"
              fill="#fff"
              style={styles.progressIcon}
            />
          </View>
          <View style={styles.progressLineInactive} />
          <View style={styles.progressStepInactive}>
            <Icon
              name="credit-card-outline"
              fill="#bbb"
              style={styles.progressIcon}
            />
          </View>
        </View>

        {/* Shipping Address */}
        <View
          style={[
            styles.sectionBox,
            {
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
            },
          ]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('shippingDetails.chooseShippingAddress')}
          </Text>

          {addresses.length > 0 ? (
            <>
              <Select
                style={[
                  styles.addressSelect,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-card']
                      : theme['color-basic-100'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-400'],
                  },
                ]}
                value={
                  addresses[selectedShippingIndex.row]?.contact_person_name ||
                  'Select Address'
                }
                selectedIndex={selectedShippingIndex}
                onSelect={handleShippingAddressChange}
                placeholder="Select Shipping Address">
                {addresses.map((address, i) => (
                  <SelectItem
                    key={i}
                    title={`${address.contact_person_name} - ${address.address_type}`}
                  />
                ))}
              </Select>

              {/* Display Selected Address Details */}
              {addresses[selectedShippingIndex.row] && (
                <View
                  style={[
                    styles.addressDetails,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-secondary']
                        : theme['color-basic-200'],
                    },
                  ]}>
                  <View style={styles.addressRow}>
                    <Icon
                      name="checkmark-circle-2-outline"
                      fill="#43a047"
                      style={{width: 18, height: 18, marginRight: 4}}
                    />
                    <Text style={[styles.verifiedText, {color: '#43a047'}]}>
                      Verified
                    </Text>
                    <Icon
                      name="phone-outline"
                      fill={
                        isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900']
                      }
                      style={{
                        width: 18,
                        height: 18,
                        marginLeft: 12,
                        marginRight: 4,
                      }}
                    />
                    <Text
                      style={[
                        styles.phoneText,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {addresses[selectedShippingIndex.row].phone}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.addressText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    <Text style={{fontWeight: 'bold'}}>Contact: </Text>
                    {addresses[selectedShippingIndex.row].contact_person_name}
                  </Text>
                  <Text
                    style={[
                      styles.addressText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    <Text style={{fontWeight: 'bold'}}>Address: </Text>
                    {addresses[selectedShippingIndex.row].address},{' '}
                    {addresses[selectedShippingIndex.row].city}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text
              style={[
                styles.noAddressText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('shippingDetails.noAddresses')}
            </Text>
          )}

          {/* GPS Location Button - Always Visible */}
          <View style={styles.gpsContainer}>
            {/* <Text style={[styles.gpsHelperText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Get your current location to auto-fill address details
            </Text> */}

            {/* <Button
              style={[styles.gpsButton, {
                backgroundColor: fetchingLocation ? theme['color-shadcn-secondary'] : theme['color-success-default']
              }]}
              onPress={getCurrentLocation}
              disabled={fetchingLocation}
              accessoryLeft={fetchingLocation ? 
                <Icon name="loader-outline" fill={theme['color-basic-100']} style={styles.gpsIcon} /> :
                <Icon name="navigation-2-outline" fill={theme['color-basic-100']} style={styles.gpsIcon} />
              }
            >
              {fetchingLocation ? 'Getting Location...' : 'Use Current Location'}
            </Button> */}

            {newAddress.latitude !== '0' && newAddress.longitude !== '0' && (
              <Text
                style={[
                  styles.coordinatesText,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                📍 {parseFloat(newAddress.latitude).toFixed(6)},{' '}
                {parseFloat(newAddress.longitude).toFixed(6)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.addAddressBtn,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-primary']
                  : '#e8f5e9',
              },
            ]}
            onPress={() => setShowAddAddress(!showAddAddress)}>
            <Text
              style={[
                styles.addAddressText,
                {
                  color: showAddAddress
                    ? theme['color-basic-100']
                    : isDark
                    ? theme['color-basic-100']
                    : '#388e3c',
                },
              ]}>
              {showAddAddress
                ? `- ${t('buttons.cancel')}`
                : `+ ${t('shippingDetails.addNewAddress')}`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add New Address Form */}
        {showAddAddress && (
          <View
            style={[
              styles.sectionBox,
              {
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shippingDetails.addNewAddress')}
            </Text>

            <Input
              label={t('shippingDetails.contactPersonName') + ' *'}
              value={newAddress.contact_person_name}
              onChangeText={val =>
                setNewAddress({...newAddress, contact_person_name: val})
              }
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
            />
            <Input
              label={t('shippingDetails.phone') + ' *'}
              value={newAddress.phone}
              onChangeText={val => setNewAddress({...newAddress, phone: val})}
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
              keyboardType="phone-pad"
            />
            <Input
              label={t('shippingDetails.address') + ' *'}
              value={newAddress.address}
              onChangeText={val => setNewAddress({...newAddress, address: val})}
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
              multiline
            />
            <Input
              label={t('shippingDetails.city') + ' *'}
              value={newAddress.city}
              onChangeText={val => setNewAddress({...newAddress, city: val})}
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
            />
            <Input
              label={t('shippingDetails.zipCode')}
              value={newAddress.zip}
              onChangeText={val => setNewAddress({...newAddress, zip: val})}
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
            />
            <Input
              label={t('shippingDetails.country')}
              value={newAddress.country}
              onChangeText={val => setNewAddress({...newAddress, country: val})}
              style={[
                styles.input,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-background']
                    : theme['color-basic-100'],
                },
              ]}
            />

            <Button
              style={[
                styles.saveAddressBtn,
                {
                  backgroundColor: theme['color-shadcn-primary'],
                },
              ]}
              onPress={handleAddAddress}>
              {t('shippingDetails.saveAddress')}
            </Button>
          </View>
        )}

        {/* Billing Address */}
        <View
          style={[
            styles.sectionBox,
            {
              borderColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
            },
          ]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('shippingDetails.chooseBillingAddress')}
          </Text>

          <CheckBox
            checked={sameAsShipping}
            onChange={handleSameAsShipping}
            style={styles.checkbox}>
            {evaProps => (
              <Text
                {...evaProps}
                style={[
                  styles.checkboxText,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shippingDetails.sameAsShipping')}
              </Text>
            )}
          </CheckBox>

          {!sameAsShipping && (
            <View>
              <Input
                label={t('shippingDetails.contactPersonName')}
                value={billingAddress.contact_person_name}
                onChangeText={val =>
                  setBillingAddress({
                    ...billingAddress,
                    contact_person_name: val,
                  })
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-100'],
                  },
                ]}
              />
              <Input
                label={t('shippingDetails.phone')}
                value={billingAddress.phone}
                onChangeText={val =>
                  setBillingAddress({...billingAddress, phone: val})
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-100'],
                  },
                ]}
                keyboardType="phone-pad"
              />
              <Input
                label={t('shippingDetails.address')}
                value={billingAddress.address}
                onChangeText={val =>
                  setBillingAddress({...billingAddress, address: val})
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-100'],
                  },
                ]}
                multiline
              />
              <Input
                label={t('shippingDetails.city')}
                value={billingAddress.city}
                onChangeText={val =>
                  setBillingAddress({...billingAddress, city: val})
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-100'],
                  },
                ]}
              />
              <Input
                label={t('shippingDetails.zipCode')}
                value={billingAddress.zip}
                onChangeText={val =>
                  setBillingAddress({...billingAddress, zip: val})
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-100'],
                  },
                ]}
              />
              <Input
                label={t('shippingDetails.country')}
                value={billingAddress.country}
                onChangeText={val =>
                  setBillingAddress({...billingAddress, country: val})
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-background']
                      : theme['color-basic-100'],
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Order Summary & Payment */}
        {checkoutData && (
          <View
            style={[
              styles.sectionBox,
              {
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shippingDetails.orderSummary')}
            </Text>

            {/* Payment Method Info */}
            <View
              style={[
                styles.paymentMethodBox,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  borderColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}>
              <Text
                style={[
                  styles.paymentMethodTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('shippingDetails.paymentMethod')}:{' '}
                {checkoutData.selectedPaymentMethod.title}
              </Text>
              <Text
                style={[
                  styles.paymentMethodDesc,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('shippingDetails.duration')}:{' '}
                {checkoutData.selectedPaymentMethod.duration}
              </Text>
            </View>

            {/* EasyPaisa Input - Only show for EasyPaisa payment */}
            {checkoutData.selectedPaymentMethod.title
              .toLowerCase()
              .includes('easypaisa') && (
              <View style={styles.paymentInputSection}>
                <Text
                  style={[
                    styles.paymentInputLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('shippingDetails.easyPaisaMobileAccount')} *
                </Text>
                <Input
                  placeholder={t('shippingDetails.easyPaisaPlaceholder')}
                  value={easyPaisaNumber}
                  onChangeText={setEasyPaisaNumber}
                  keyboardType="phone-pad"
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-background']
                        : theme['color-basic-100'],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.paymentHelperText,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  {t('shippingDetails.easyPaisaHelperText')}
                </Text>
              </View>
            )}

            {/* Order Totals */}
            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('shippingDetails.subtotal')}
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  Rs {cartSummary.subtotal.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('shippingDetails.tax')}
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  Rs {cartSummary.tax.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('shippingDetails.shipping')}
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  Rs {cartSummary.shipping.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('shippingDetails.discount')}
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  - Rs {cartSummary.discount.toLocaleString()}
                </Text>
              </View>
              {checkoutData.couponDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('shippingDetails.coupon')} ({checkoutData.couponCode})
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: theme['color-success-default'],
                      },
                    ]}>
                    - Rs {checkoutData.couponDiscount.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text
                  style={[
                    styles.summaryLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                      fontWeight: 'bold',
                      fontSize: 18,
                    },
                  ]}>
                  {t('shippingDetails.total')}
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: theme['color-shadcn-primary'],
                      fontWeight: 'bold',
                      fontSize: 18,
                    },
                  ]}>
                  Rs {cartSummary.total.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Icon
              name="car-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shippingDetails.features.freeDelivery')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="award-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shippingDetails.features.originalProducts')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="credit-card-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shippingDetails.features.moneyBack')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="shield-outline"
              fill={
                isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900']
              }
              style={styles.featureIcon}
            />
            <Text
              style={[
                styles.featureText,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('shippingDetails.features.safePayments')}
            </Text>
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footerRow}>
          <Button
            style={[
              styles.farmCartBtn,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-100'],
                borderColor: isDark ? theme['color-shadcn-border'] : '#d35400',
              },
            ]}
            onPress={() => navigation.goBack()}
            appearance="outline">
            <Text
              style={{
                color: isDark ? theme['color-shadcn-foreground'] : '#d35400',
                fontWeight: 'bold',
              }}>
              « {t('shippingDetails.farmCart')}
            </Text>
          </Button>
          <Button
            style={[
              styles.checkoutBtn,
              {
                backgroundColor: theme['color-shadcn-primary'],
              },
            ]}
            onPress={handleContinue}
            disabled={addresses.length === 0 || placingOrder}
            accessoryLeft={
              placingOrder ? (
                <Icon
                  name="loader-outline"
                  fill={theme['color-basic-100']}
                  style={{width: 20, height: 20}}
                />
              ) : null
            }>
            {placingOrder
              ? t('shippingDetails.processingPayment')
              : checkoutData?.selectedPaymentMethod?.title
                  ?.toLowerCase()
                  .includes('cod')
              ? t('shippingDetails.placeOrder')
              : checkoutData?.selectedPaymentMethod?.title
                  ?.toLowerCase()
                  .includes('easypaisa')
              ? t('shippingDetails.payViaEasyPaisa')
              : t('shippingDetails.payment') + ' »'}
          </Button>
        </View>
      </Layout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    justifyContent: 'center',
  },
  progressStepActive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#43a047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepInactive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIcon: {width: 22, height: 22},
  progressLineActive: {width: 40, height: 4, backgroundColor: '#43a047'},
  progressLineInactive: {width: 40, height: 4, backgroundColor: '#bbb'},
  sectionBox: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
  },
  sectionTitle: {fontWeight: 'bold', fontSize: 16, marginBottom: 8},
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    marginRight: 8,
  },
  verifiedText: {color: '#43a047', fontWeight: 'bold', fontSize: 12},
  phoneText: {fontWeight: 'bold', color: '#222'},
  addressDetails: {marginBottom: 8},
  addAddressBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  addAddressText: {color: '#388e3c', fontWeight: 'bold', fontSize: 13},
  checkbox: {marginVertical: 8},
  checkboxText: {color: '#222', fontWeight: 'bold'},
  input: {marginBottom: 8, backgroundColor: '#f5f5f5', borderRadius: 4},
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  farmCartBtn: {
    flex: 1,
    borderRadius: 8,
    marginRight: 4,
    borderColor: '#d35400',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  checkoutBtn: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 4,
    backgroundColor: '#43a047',
    borderWidth: 0,
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {fontSize: 15, fontWeight: 'bold'},
  summaryValue: {fontSize: 15},
  couponInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 15,
    marginBottom: 8,
    marginTop: 8,
  },
  couponBtn: {
    borderRadius: 4,
    backgroundColor: '#43a047',
    borderWidth: 0,
    marginBottom: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  feature: {alignItems: 'center', width: '48%', marginBottom: 8},
  featureIcon: {width: 28, height: 28, marginBottom: 4},
  featureText: {fontSize: 12, textAlign: 'center'},
  addressSelect: {
    marginBottom: 16,
    borderRadius: 8,
  },
  addressText: {
    marginBottom: 8,
  },
  noAddressText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  saveAddressBtn: {
    borderRadius: 4,
    backgroundColor: '#43a047',
    borderWidth: 0,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  verifiedText: {
    color: '#43a047',
    fontWeight: 'bold',
    fontSize: 12,
  },
  phoneText: {
    fontWeight: 'bold',
    color: '#222',
  },
  addressDetails: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
  gpsContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  gpsHelperText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  gpsButton: {
    borderRadius: 8,
    borderWidth: 0,
    marginBottom: 8,
    width: '100%',
  },
  gpsIcon: {
    width: 20,
    height: 20,
  },
  coordinatesText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  coordinatesContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  coordinatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  coordinatesDisplay: {
    marginBottom: 8,
  },
  coordinateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  coordinateLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  noCoordinatesText: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  coordinatesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  coordinateInput: {
    flex: 1,
  },
  coordinatesHelp: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  paymentMethodBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 14,
  },
  paymentInputSection: {
    marginBottom: 16,
  },
  paymentInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  paymentHelperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  summarySection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
