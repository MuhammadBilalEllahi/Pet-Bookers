import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  Layout,
  Text,
  Input,
  useTheme,
  Select,
  SelectItem,
} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Formik} from 'formik';
import {spacingStyles} from '../../utils/globalStyles';
import {InputError, SubmitButton, ImagePicker} from '../../components/form';

export const AddProductScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const onProductPostedSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'AddProductSuccess'}],
    });
  };

  const handleSubmit = values => {
    onProductPostedSuccess();
  };

  return (
    <Layout level="3" style={{flex: 1}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          spacingStyles.px16,
          spacingStyles.py8,
          {
            flexGrow: 1,
            justifyContent: 'flex-start',
          },
        ]}>
        <Layout
          level="1"
          style={[
            spacingStyles.p16,
            {
              flex: 1,
            },
          ]}>
          <Text
            category="h4"
            style={{
              fontWeight: '700',
              textAlign: 'center',
              textTransform: 'capitalize',
            }}>
            Add New
          </Text>
          <Text category="p1" style={styles.subTitle}>
            Fill in the form to add new product
          </Text>
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <Layout style={styles.inputContainer}>
                <Layout style={styles.input}>
                  <Text category="label" appearance="hint">
                    {t('form.category')}
                  </Text>
                  <Select
                    style={{marginTop: 4}}
                    placeholder={t('form.selectCategory')}>
                    <SelectItem title="Option 1" />
                    <SelectItem title="Option 2" />
                    <SelectItem title="Option 3" />
                  </Select>
                </Layout>
                <Layout style={styles.input}>
                  <Text category="label" appearance="hint">
                    {t('form.subcategory')}
                  </Text>
                  <Select
                    style={{marginTop: 4}}
                    placeholder={t('form.selectSubcategory')}>
                    <SelectItem title="Option 1" />
                    <SelectItem title="Option 2" />
                    <SelectItem title="Option 3" />
                  </Select>
                </Layout>
                <Input
                  label={t('form.title')}
                  style={styles.input}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  value={values.title}
                  caption={
                    touched.title && <InputError errorText={errors.title} />
                  }
                  status={errors.title && touched.title ? 'danger' : 'basic'}
                />
                <Input
                  label={t('form.description')}
                  multiline={true}
                  numberOfLines={10}
                  style={[styles.input]}
                  textStyle={styles.descriptionInput}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
                  caption={
                    touched.description && (
                      <InputError errorText={errors.description} />
                    )
                  }
                  status={
                    errors.description && touched.description
                      ? 'danger'
                      : 'basic'
                  }
                />
                <Input
                  label={t('form.price')}
                  style={styles.input}
                  onChangeText={handleChange('price')}
                  onBlur={handleBlur('price')}
                  value={values.price}
                  caption={
                    touched.price && <InputError errorText={errors.price} />
                  }
                  status={errors.price && touched.price ? 'danger' : 'basic'}
                />
                <ImagePicker title={t('form.uploadProductPics')} />
                <SubmitButton
                  btnText={t('submit')}
                  disabled={false}
                  onPress={handleSubmit}
                />
              </Layout>
            )}
          </Formik>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  subTitle: {
    marginVertical: 8,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'column',
    paddingVertical: 16,
  },
  input: {
    marginVertical: 8,
  },
  descriptionInput: {
    height: 120,
  },
});
