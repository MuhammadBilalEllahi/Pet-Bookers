import React, {useState} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {Button, Layout, Text, Input} from '@ui-kitten/components';
import {Formik} from 'formik';
import {InputError, BtnIndicator} from '../../components/form';
import {spacingStyles} from '../../utils/globalStyles';

export const UpdatePasswordScreen = ({navigation}) => {
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

  return (
    <Layout level="3" style={{flex: 1}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          spacingStyles.px16,
          {
            flexGrow: 1,
            paddingTop: 16,
          },
        ]}>
        <Layout style={spacingStyles.p16} level="1">
          <Text category="p1">Fill up all the fields to update password</Text>
          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPass: '',
            }}
            onSubmit={submitForm}>
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
                  label="Current Password"
                  secureTextEntry={true}
                  style={styles.input}
                  onChangeText={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                  value={values.currentPassword}
                  caption={
                    touched.currentPassword && (
                      <InputError errorText={errors.currentPassword} />
                    )
                  }
                  status={
                    errors.currentPassword && touched.currentPassword
                      ? 'danger'
                      : 'basic'
                  }
                />
                <Input
                  label="New Password"
                  secureTextEntry={true}
                  style={styles.input}
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  value={values.newPassword}
                  caption={
                    touched.newPassword && (
                      <InputError errorText={errors.newPassword} />
                    )
                  }
                  status={
                    errors.newPassword && touched.newPassword
                      ? 'danger'
                      : 'basic'
                  }
                />
                <Input
                  label="Repeat New Password"
                  secureTextEntry={true}
                  style={styles.input}
                  onChangeText={handleChange('confirmPass')}
                  onBlur={handleBlur('confirmPass')}
                  value={values.confirmPass}
                  caption={
                    touched.confirmPass && (
                      <InputError errorText={errors.confirmPass} />
                    )
                  }
                  status={
                    errors.confirmPass && touched.confirmPass
                      ? 'danger'
                      : 'basic'
                  }
                />
                <Button
                  style={{marginTop: 16, borderRadius: 100}}
                  disabled={isBtnDisable}
                  accessoryRight={isBtnDisable && BtnIndicator}
                  onPress={handleSubmit}>
                  Update Password
                </Button>
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
});
