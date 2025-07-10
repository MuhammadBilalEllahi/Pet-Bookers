import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, Image, TouchableOpacity } from 'react-native';
import { Button, Layout, Text, Input, Icon } from '@ui-kitten/components';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { InputError, BtnIndicator } from '../../components/form';
import { spacingStyles } from '../../utils/globalStyles';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCustomerInfo, 
  selectCustomerLoading, 
  selectCustomerError,
  fetchCustomerInfo,
  logout
} from '../../store/user';
import { axiosBuyerClient } from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';
import { launchImageLibrary } from 'react-native-image-picker';

const UpdateProfileSchema = Yup.object().shape({
  f_name: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  l_name: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^(\+92|0)?[0-9]{10,11}$/, 'Enter a valid Pakistani phone number'),
});

export const UpdateProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const customerInfo = useSelector(selectCustomerInfo);
  const customerLoading = useSelector(selectCustomerLoading);
  const customerError = useSelector(selectCustomerError);

  const [isBtnDisable, setIsBtnDisable] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!customerInfo) {
      dispatch(fetchCustomerInfo());
    }
  }, [dispatch, customerInfo]);

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
      
      const formData = new FormData();
      formData.append('f_name', values.f_name.trim());
      formData.append('l_name', values.l_name.trim());
      formData.append('phone', values.phone.trim());

      // Add image if selected
      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: selectedImage.type,
          name: selectedImage.fileName || 'profile.jpg',
        });
      }

      const response = await axiosBuyerClient.put('customer/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: response.data.message || 'Your profile has been updated successfully',
          position: 'top',
        });

        // Refresh customer info
        dispatch(fetchCustomerInfo());
        navigation.goBack();
      }
    } catch (error) {
      console.error('Update profile error:', error);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors[0].message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2: errorMessage,
        position: 'top',
      });
    } finally {
      setIsBtnDisable(false);
    }
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      
      const response = await axiosBuyerClient.get(`customer/account-delete/${customerInfo.id}`);

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: response.data.message || 'Your account has been deleted successfully',
          position: 'top',
        });

        // Logout user
        dispatch(logout());
      }
    } catch (error) {
      console.error('Delete account error:', error);
      
      let errorMessage = 'Failed to delete account';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Delete failed',
        text2: errorMessage,
        position: 'top',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
  };

  // Loading state
  if (customerLoading && !customerInfo) {
    return (
      <Layout level="3" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading profile...</Text>
      </Layout>
    );
  }

  // Error state
  if (customerError && !customerInfo) {
    return (
      <Layout level="3" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text status="danger">Error: {customerError}</Text>
        <Button 
          style={{ marginTop: 16 }}
          onPress={() => dispatch(fetchCustomerInfo())}
        >
          Retry
        </Button>
      </Layout>
    );
  }

  const profileImageUri = selectedImage?.uri || 
    (customerInfo?.image ? `https://petbookers.com.pk/storage/app/public/profile/${customerInfo.image}` : null);

  // Senior: Memoize icon for performance and consistency
  const LockIcon = React.useCallback(
    (props) => <Icon {...props} name="lock-outline" />,
    []
  );

  const TrashIcon = React.useCallback(
    (props) => <Icon {...props} name="trash-2-outline" />,
    []
  );

  const CameraIcon = React.useCallback(
    (props) => <Icon {...props} name="camera-outline" />,
    []
  );

  return (
    <Layout level="3" style={{ flex: 1 }}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          spacingStyles.px16,
          {
            flexGrow: 1,
            paddingTop: 16,
          },
        ]}
      >
        <Layout style={spacingStyles.p16} level="1">
          <Text>Fill up all the fields to update your profile</Text>
          
          {/* Profile Image Section */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={selectImage} style={styles.imageWrapper}>
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="person-outline" style={styles.placeholderIcon} />
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Icon name="camera-outline" style={styles.cameraIcon} />
              </View>
            </TouchableOpacity>
            <Text category="p2" style={styles.imageText}>
              Tap to change profile picture
            </Text>
          </View>

          <Formik
            initialValues={{
              f_name: customerInfo?.f_name || '',
              l_name: customerInfo?.l_name || '',
              email: customerInfo?.email || '',
              phone: customerInfo?.phone || '',
            }}
            enableReinitialize={true}
            validationSchema={UpdateProfileSchema}
            onSubmit={submitForm}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <Layout>
                <Input
                  label="First Name"
                  placeholder="First Name"
                  style={styles.input}
                  onChangeText={handleChange('f_name')}
                  onBlur={handleBlur('f_name')}
                  value={values.f_name}
                  caption={
                    touched.f_name && (
                      <InputError errorText={errors.f_name} />
                    )
                  }
                  status={
                    errors.f_name && touched.f_name ? 'danger' : 'basic'
                  }
                />
                <Input
                  label="Last Name"
                  placeholder="Last Name"
                  style={styles.input}
                  onChangeText={handleChange('l_name')}
                  onBlur={handleBlur('l_name')}
                  value={values.l_name}
                  caption={
                    touched.l_name && (
                      <InputError errorText={errors.l_name} />
                    )
                  }
                  status={
                    errors.l_name && touched.l_name ? 'danger' : 'basic'
                  }
                />
                <Input
                  label="Email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  placeholder="example@example.com"
                  value={values.email}
                  style={styles.input}
                  disabled
                  caption="You cannot change your email address."
                />
                <Input
                  label="Mobile No."
                  keyboardType="phone-pad"
                  placeholder="03001234567"
                  style={styles.input}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                  caption={
                    touched.phone && <InputError errorText={errors.phone} />
                  }
                  status={errors.phone && touched.phone ? 'danger' : 'basic'}
                />
                <Button
                  style={{ marginTop: 16, borderRadius: 100 }}
                  disabled={isBtnDisable}
                  accessoryRight={isBtnDisable && BtnIndicator}
                  onPress={handleSubmit}
                >
                  Update Profile
                </Button>
              </Layout>
            )}
          </Formik>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <Button
              appearance="outline"
              status="primary"
              accessoryLeft={LockIcon}
              style={styles.actionButton}
              onPress={navigateToPasswordUpdate}
            >
              Change Password
            </Button>
            
            <Button
              appearance="outline"
              status="danger"
              accessoryLeft={TrashIcon}
              style={[styles.actionButton, styles.deleteButton]}
              disabled={isDeletingAccount}
              accessoryRight={isDeletingAccount && BtnIndicator}
              onPress={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </View>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E4E9F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    tintColor: '#8F9BB3',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6D1A',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  imageText: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    marginTop: 30,
    gap: 16,
  },
  actionButton: {
    borderRadius: 100,
  },
  deleteButton: {
    borderColor: '#FF3D71',
  },
});
