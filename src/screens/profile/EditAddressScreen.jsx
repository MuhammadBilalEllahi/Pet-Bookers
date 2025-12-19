import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, Modal, FlatList, TouchableOpacity } from 'react-native';
import { 
  Button, 
  Layout, 
  Text, 
  Input, 
  Select, 
  SelectItem, 
  IndexPath, 
  CheckBox, 
  Card,
  Icon 
} from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { axiosBuyerClient } from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { COUNTRY_CODES, stateKeys, citiesByState, COUNTRIES } from '../../utils/constants';

export const EditAddressScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const { address, onAddressUpdated } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    contact_person_name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    countryCode: COUNTRY_CODES[0].code,
    state: '',
    address_type: 'home',
    is_billing: false,
    country: 'Pakistan'
  });
  
  const [selectedAddressType, setSelectedAddressType] = useState(new IndexPath(0));
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const pakistanIndex = COUNTRIES.findIndex(country => country === 'Pakistan');
    return pakistanIndex >= 0 ? new IndexPath(pakistanIndex) : new IndexPath(0);
  });
  
  const addressTypes = [
    { title: 'Home', value: 'home' },
    { title: 'Office', value: 'office' }
  ];

  // Pre-populate form with existing address data
  useEffect(() => {
    if (address) {
      // Extract country code from phone if it exists
      let countryCode = COUNTRY_CODES[0].code;
      let phoneNumber = address.phone || '';
      
      // Try to extract country code from phone
      if (phoneNumber) {
        const foundCode = COUNTRY_CODES.find(code => phoneNumber.startsWith(code.code));
        if (foundCode) {
          countryCode = foundCode.code;
          phoneNumber = phoneNumber.replace(foundCode.code, '').trim();
        }
      }
      
      // Find state from city if city exists
      let state = '';
      if (address.city) {
        for (const [stateKey, cities] of Object.entries(citiesByState)) {
          if (cities.includes(address.city)) {
            state = stateKey;
            break;
          }
        }
      }
      
      setFormData({
        contact_person_name: address.contact_person_name || '',
        address: address.address || '',
        city: address.city || '',
        zip: address.zip || '',
        phone: phoneNumber,
        countryCode: countryCode,
        state: state,
        address_type: address.address_type || 'home',
        is_billing: address.is_billing === 1 ||address.is_billing === '1' ||  address.is_billing === true,
        country: address.country || 'Pakistan'
      });
      
      // Set the address type selector
      const typeIndex = addressTypes.findIndex(type => type.value === (address.address_type || 'home'));
      setSelectedAddressType(new IndexPath(typeIndex >= 0 ? typeIndex : 0));
      
      // Set state and city selectors
      if (state) {
        const stateIndex = stateKeys.findIndex(key => key === state);
        setSelectedState(stateIndex >= 0 ? new IndexPath(stateIndex) : null);
        
        if (address.city && citiesByState[state]) {
          const cityIndex = citiesByState[state].findIndex(city => city === address.city);
          setSelectedCity(cityIndex >= 0 ? new IndexPath(cityIndex) : null);
        }
      }
      
      // Set country selector
      if (address.country) {
        const countryIndex = COUNTRIES.findIndex(country => country === address.country);
        setSelectedCountry(countryIndex >= 0 ? new IndexPath(countryIndex) : new IndexPath(0));
      }
    }
  }, [address]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressTypeChange = (index) => {
    setSelectedAddressType(index);
    const selectedType = addressTypes[index.row];
    handleInputChange('address_type', selectedType.value);
  };

  const handleStateChange = (index) => {
    setSelectedState(index);
    const selectedStateKey = stateKeys[index.row];
    handleInputChange('state', selectedStateKey);
    // Reset city when state changes
    handleInputChange('city', '');
    setSelectedCity(null);
  };

  const handleCityChange = (index) => {
    setSelectedCity(index);
    if (formData.state && citiesByState[formData.state]) {
      const selectedCityKey = citiesByState[formData.state][index.row];
      handleInputChange('city', selectedCityKey);
    }
  };

  const handleCountryChange = (index) => {
    setSelectedCountry(index);
    const selectedCountryName = COUNTRIES[index.row];
    handleInputChange('country', selectedCountryName);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.contact_person_name.trim()) {
      errors.push(t('editAddressScreen.contactNameRequired'));
    }
    
    if (!formData.address.trim()) {
      errors.push(t('editAddressScreen.addressRequired'));
    }
    
    if (!formData.state) {
      errors.push(t('validation.stateRequired'));
    }
    
    if (!formData.city.trim()) {
      errors.push(t('editAddressScreen.cityRequired'));
    }
    
    if (!formData.zip.trim()) {
      errors.push(t('editAddressScreen.zipRequired'));
    }
    
    if (!formData.phone.trim()) {
      errors.push(t('editAddressScreen.phoneRequired'));
    } else if (formData.phone.length < 10) {
      errors.push(t('editAddressScreen.phoneMinLength'));
    }
    
    if (errors.length > 0) {
      Alert.alert(t('editAddressScreen.validationError'), errors.join('\n'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const submitData=
     { 'address_id': address.id,
      'id': address.id,
      'contact_person_name': formData.contact_person_name,
      'address': formData.address,
      'city': formData.city,
      'zip': formData.zip,
      'phone': formData.countryCode + formData.phone,
      'countryCode': formData.countryCode,
      'address_type': formData.address_type,
      'latitude': "0",
      'longitude': "0",
      'is_billing': formData.is_billing ? 1 : 0,
      'country': formData.country}

      console.log('submitData', submitData);

      const response = await axiosBuyerClient.put('customer/address/update', submitData);

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('editAddressScreen.addressUpdatedTitle'),
          text2: t('editAddressScreen.addressUpdatedMessage') || response?.data?.message ,
          position: 'top',
        });

        // Call the callback to refresh the address list
        if (onAddressUpdated) {
          onAddressUpdated();
        }
        
        // Navigate back
        navigation.goBack();
      }
    } catch (error) {
      console.error('Update address error:', error);
      Toast.show({
        type: 'error',
        text1: t('editAddressScreen.updateAddressFailedTitle'),
        text2: error.response?.data?.message || t('editAddressScreen.updateAddressFailedMessage'),
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const PersonIcon = (props) => <Icon {...props} name="person-outline" />;
  const LocationIcon = (props) => <Icon {...props} name="pin-outline" />;
  const PhoneIcon = (props) => <Icon {...props} name="phone-outline" />;
  const HomeIcon = (props) => <Icon {...props} name="home-outline" />;

  if (!address) {
    return (
      <Layout level="3" style={[styles.container, styles.errorContainer]}>
        <Text category="h6">{t('editAddressScreen.errorTitle')}</Text>
        <Button onPress={() => navigation.goBack()} style={styles.errorButton}>
          {t('editAddressScreen.goBack')}
        </Button>
      </Layout>
    );
  }

  return (
    <Layout level="3" style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Layout style={[styles.header, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}>
          <Text category="h5" style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
            {t('editAddressScreen.title')}
          </Text>
          <Text category="p2" style={[styles.subtitle, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
            {t('editAddressScreen.subtitle')}
          </Text>
        </Layout>

        <Card style={[styles.formCard, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}>
          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editAddressScreen.contactPersonNameLabel')}
            </Text>
            <Input
              placeholder={t('editAddressScreen.contactPersonNamePlaceholder')}
              value={formData.contact_person_name}
              onChangeText={(text) => handleInputChange('contact_person_name', text)}
              accessoryLeft={PersonIcon}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                {t('editAddressScreen.phoneNumberLabel')}
              </Text>
              <Text style={[styles.countryCodeNote, { color: theme['color-danger-500'] }]}>
                {t('countryCodeNote')}
              </Text>
            </View>
            <View style={[styles.phoneRow, {
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            }]}>
              <TouchableOpacity
                style={[styles.countryCodeTouchable, {
                  backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
                  borderRightColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                }]}
                onPress={() => setCountryModalVisible(true)}
                activeOpacity={0.7}>
                <Text style={[styles.countryCodeText, {
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
                }]}>
                  {COUNTRY_CODES.find(c => c.code === formData.countryCode)?.label || COUNTRY_CODES[0].label}
                </Text>
                <Text style={[styles.countryCodeDropdownIcon, {
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                }]}>
                  ▼
                </Text>
              </TouchableOpacity>
              <Input
                placeholder={t('editAddressScreen.phoneNumberPlaceholder')}
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
                style={styles.phoneInput}
                maxLength={15}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editAddressScreen.addressTypeLabel')}
            </Text>
            <Select
              selectedIndex={selectedAddressType}
              onSelect={handleAddressTypeChange}
              value={t(`editAddressScreen.addressType${addressTypes[selectedAddressType.row]?.title}`)}
              accessoryLeft={HomeIcon}
              style={styles.input}
            >
              {addressTypes.map((type, index) => (
                <SelectItem key={index} title={t(`editAddressScreen.addressType${type.title}`)} />
              ))}
            </Select>
          </View>

         

        

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editAddressScreen.countryLabel')}
            </Text>
            <Select
              selectedIndex={selectedCountry}
              onSelect={handleCountryChange}
              value={formData.country || t('selectOption')}
              placeholder={t('selectOption')}
              accessoryLeft={LocationIcon}
              style={styles.input}
            >
              {COUNTRIES.map((country, index) => (
                <SelectItem key={index} title={country} />
              ))}
            </Select>
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('state')}
            </Text>
            <Select
              selectedIndex={selectedState}
              onSelect={handleStateChange}
              value={formData.state ? t(formData.state) : t('selectOption')}
              style={styles.input}
            >
              {stateKeys.map((stateKey, index) => (
                <SelectItem key={index} title={t(stateKey)} />
              ))}
            </Select>
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editAddressScreen.cityLabel')}
            </Text>
            <Select
              disabled={!formData.state}
              selectedIndex={selectedCity}
              onSelect={handleCityChange}
              value={formData.city ? t(formData.city) : t('selectOption')}
              placeholder={t('selectOption')}
              style={styles.input}
            >
              {(citiesByState[formData.state] || []).map((cityKey, index) => (
                <SelectItem key={index} title={t(cityKey)} />
              ))}
            </Select>
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editAddressScreen.streetAddressLabel')}
            </Text>
            <Input
              placeholder={t('editAddressScreen.streetAddressPlaceholder')}
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              accessoryLeft={LocationIcon}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              {t('editAddressScreen.zipCodeLabel')}
            </Text>
            <Input
              placeholder={t('editAddressScreen.zipCodePlaceholder')}
              value={formData.zip}
              onChangeText={(text) => handleInputChange('zip', text)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

         

          <CheckBox
            checked={formData.is_billing}
            onChange={(checked) => handleInputChange('is_billing', checked)}
            style={styles.checkbox}
          >
            <Text style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              {t('editAddressScreen.useAsBilling')}
            </Text>
          </CheckBox>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, styles.cancelButton]}
            appearance="outline"
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            {t('editAddressScreen.cancel')}
          </Button>
          
          <Button
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? t('editAddressScreen.updating') : t('editAddressScreen.updateAddress')}
          </Button>
        </View>
      </ScrollView>

      {/* Country Code Modal */}
      <Modal
        visible={countryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCountryModalVisible(false)}>
        <TouchableOpacity
          style={[styles.modalOverlay, {
            backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)',
          }]}
          activeOpacity={1}
          onPressOut={() => setCountryModalVisible(false)}>
          <View style={[styles.countryModal, {
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          }]}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.code}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[styles.countryModalItem, {
                    borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                  }]}
                  onPress={() => {
                    handleInputChange('countryCode', item.code);
                    setCountryModalVisible(false);
                  }}>
                  <Text style={[styles.countryModalItemText, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
                  }]}>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  formCard: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  checkbox: {
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  cancelButton: {
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorButton: {
    marginTop: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
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
  phoneInput: {
    flex: 1,
    marginVertical: 0,
    marginLeft: 0,
    borderWidth: 0,
    paddingLeft: 10,
    backgroundColor: 'transparent',
  },
  countryCodeNote: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  modalOverlay: {
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