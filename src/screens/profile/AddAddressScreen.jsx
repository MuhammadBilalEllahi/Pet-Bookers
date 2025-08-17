import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
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

export const AddAddressScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { onAddressAdded } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contact_person_name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    address_type: 'home',
    is_billing: false,
    country: 'Pakistan'
  });
  
  const [selectedAddressType, setSelectedAddressType] = useState(new IndexPath(0));
  
  const addressTypes = [
    { title: 'Home', value: 'home' },
    { title: 'Office', value: 'office' }
  ];

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

  const validateForm = () => {
    const errors = [];
    
    if (!formData.contact_person_name.trim()) {
      errors.push('Contact person name is required');
    }
    
    if (!formData.address.trim()) {
      errors.push('Address is required');
    }
    
    if (!formData.city.trim()) {
      errors.push('City is required');
    }
    
    if (!formData.zip.trim()) {
      errors.push('ZIP code is required');
    }
    
    if (!formData.phone.trim()) {
      errors.push('Phone number is required');
    } else if (formData.phone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }
    
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append('contact_person_name', formData.contact_person_name);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('zip', formData.zip);
      submitData.append('phone', formData.phone);
      submitData.append('address_type', formData.address_type);
      submitData.append('is_billing', formData.is_billing ? '1' : '0');
      submitData.append('country', formData.country);

      const response = await axiosBuyerClient.post('customer/address/add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Address Added',
          text2: response.data.message || 'Address added successfully',
          position: 'top',
        });

        // Call the callback to refresh the address list
        if (onAddressAdded) {
          onAddressAdded();
        }
        
        // Navigate back
        navigation.goBack();
      }
    } catch (error) {
      console.error('Add address error:', error?.response?.data?.message || error?.data?.response || error || error?.message);
      Toast.show({
        type: 'error',
        text1: 'Add Address Failed',
        text2: error.response?.data?.message || 'Failed to add address',
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

  return (
    <Layout level="3" style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Layout style={[styles.header, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}>
          <Text category="h5" style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
            Add New Address
          </Text>
          <Text category="p2" style={[styles.subtitle, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
            Fill in the details below to add a new delivery address
          </Text>
        </Layout>

        <Card style={[styles.formCard, { backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}>
          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              Contact Person Name *
            </Text>
            <Input
              placeholder="Enter full name"
              value={formData.contact_person_name}
              onChangeText={(text) => handleInputChange('contact_person_name', text)}
              accessoryLeft={PersonIcon}
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              Address Type *
            </Text>
            <Select
              selectedIndex={selectedAddressType}
              onSelect={handleAddressTypeChange}
              value={addressTypes[selectedAddressType.row]?.title}
              accessoryLeft={HomeIcon}
              style={styles.input}
            >
              {addressTypes.map((type, index) => (
                <SelectItem key={index} title={type.title} />
              ))}
            </Select>
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              Street Address *
            </Text>
            <Input
              placeholder="Enter street address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              accessoryLeft={LocationIcon}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                City *
              </Text>
              <Input
                placeholder="Enter city"
                value={formData.city}
                onChangeText={(text) => handleInputChange('city', text)}
                accessoryLeft={LocationIcon}
                style={styles.input}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
                ZIP Code *
              </Text>
              <Input
                placeholder="Enter ZIP"
                value={formData.zip}
                onChangeText={(text) => handleInputChange('zip', text)}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              Phone Number *
            </Text>
            <Input
              placeholder="Enter phone number"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              accessoryLeft={PhoneIcon}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text category="label" style={[styles.label, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}>
              Country
            </Text>
            <Input
              placeholder="Country"
              value={formData.country}
              onChangeText={(text) => handleInputChange('country', text)}
              accessoryLeft={LocationIcon}
              style={styles.input}
            />
          </View>

          <CheckBox
            checked={formData.is_billing}
            onChange={(checked) => handleInputChange('is_billing', checked)}
            style={styles.checkbox}
          >
            <Text style={{ color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              Use as billing address
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
            Cancel
          </Button>
          
          <Button
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Address'}
          </Button>
        </View>
      </ScrollView>
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
}); 