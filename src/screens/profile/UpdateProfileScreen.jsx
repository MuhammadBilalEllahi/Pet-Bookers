import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Button, Layout, Text, Input, Icon } from '@ui-kitten/components';
import { Formik } from 'formik';
import { InputError, BtnIndicator } from '../../components/form';
import { spacingStyles } from '../../utils/globalStyles';

export const UpdateProfileScreen = ({ navigation }) => {
  const [isBtnDisable, setIsBtnDisable] = useState(false);

  const submitForm = async values => {
    try {
      setIsBtnDisable(true);
      // await updatePassword(values);
      navigation.goBack();
    } catch (error) {
      // console.log('SUBMISSION ERR:::', error);
    } finally {
      setIsBtnDisable(false);
    }
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
  };

  // Senior: Memoize icon for performance and consistency
  const LockIcon = React.useCallback(
    (props) => <Icon {...props} name="lock-outline" />,
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
          <Formik
            initialValues={{
              firstName: 'John',
              lastName: 'Deo',
              email: 'johndoe@gamil.com',
              phone: '+92 340 1234567',
            }}
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
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                  caption={
                    touched.firstName && (
                      <InputError errorText={errors.firstName} />
                    )
                  }
                  status={
                    errors.firstName && touched.firstName ? 'danger' : 'basic'
                  }
                />
                <Input
                  label="Last Name"
                  placeholder="Last Name"
                  style={styles.input}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value={values.lastName}
                  caption={
                    touched.lastName && (
                      <InputError errorText={errors.lastName} />
                    )
                  }
                  status={
                    errors.lastName && touched.lastName ? 'danger' : 'basic'
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
                  caption="You can not change email address."
                />
                <Input
                  label="Mobile No."
                  keyboardType="decimal-pad"
                  placeholder="03051234567"
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
                <View style={styles.changePasswordContainer}>
                  <Button
                    appearance="outline"
                    status="primary"
                    accessoryLeft={LockIcon}
                    style={styles.changePasswordBtn}
                    onPress={navigateToPasswordUpdate}
                  >
                    Change Password
                  </Button>
                </View>
              </Layout>
            )}
          </Formik>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
  changePasswordContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  changePasswordBtn: {
    borderRadius: 100,
    minWidth: 180,
  },
});
