import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, View, TouchableOpacity } from 'react-native';
import { 
  Layout, 
  Text, 
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  Icon,
  IndexPath
} from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createSmartBuyerClient } from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';
import { smartBuyerClient } from '../../utils/authAxiosClient';
import { LinearGradient } from 'react-native-linear-gradient';

const CreateSupportTicketScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ticketTypes = [
    'general',
    'technical', 
    'billing',
    'order',
    'account',
    'feature',
    'bug',
    'other'
  ];

  const priorities = [
    'low',
    'medium', 
    'high',
    'urgent'
  ];

  const validationSchema = Yup.object().shape({
    subject: Yup.string()
      .required(t('messages.inputrequired'))
      .min(5, 'Subject must be at least 5 characters')
      .max(100, 'Subject must be less than 100 characters'),
    type: Yup.string()
      .required(t('messages.inputrequired')),
    description: Yup.string()
      .required(t('messages.inputrequired'))
      .min(20, 'Description must be at least 20 characters')
      .max(1000, 'Description must be less than 1000 characters'),
    priority: Yup.string()
      .required(t('messages.inputrequired'))
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setIsSubmitting(true);
      setSubmitting(true);

      
      
      const formData = new FormData();
      formData.append('subject', values.subject);
      formData.append('type', values.type);
      formData.append('description', values.description);
      // Priority is handled by backend (defaults to 'low')

      const response = await smartBuyerClient.post('customer/support-ticket/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: response.data.message || t('supportTickets.createForm.success'),
        position: 'top',
      });

      resetForm();
      navigation.goBack();

    } catch (error) {
      console.error('Error creating support ticket:',  error?.response?.data?.message || error?.message || error);
      
      let errorMessage = t('supportTickets.createForm.error');
      if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(
        t('common.error'),
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const renderSelectOption = (title, index) => (
    <SelectItem key={index} title={title} />
  );

  return (
    <Layout style={[styles.container, {
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={[styles.formCard, {
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
        }]}>
          <Text category="h5" style={[styles.formTitle, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            {t('supportTickets.createForm.title')}
          </Text>

          <Formik
            initialValues={{
              subject: '',
              type: '',
              description: '',
              priority: 'low'
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              isSubmitting: formSubmitting
            }) => (
              <Layout style={styles.form}>
                {/* Subject */}
                <Layout style={styles.fieldContainer}>
                  <Text category="label" style={[styles.fieldLabel, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>
                    {t('supportTickets.createForm.subject')} *
                  </Text>
                  <Input
                    style={styles.input}
                    placeholder={t('supportTickets.createForm.subjectPlaceholder')}
                    value={values.subject}
                    onChangeText={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    status={errors.subject && touched.subject ? 'danger' : 'basic'}
                    caption={touched.subject && errors.subject ? errors.subject : ''}
                  />
                </Layout>

                {/* Type */}
                <Layout style={styles.fieldContainer}>
                  <Text category="label" style={[styles.fieldLabel, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>
                    {t('supportTickets.createForm.type')} *
                  </Text>
                  <Select
                    style={styles.input}
                    placeholder={t('supportTickets.createForm.selectType')}
                    value={values.type ? t(`supportTickets.types.${values.type}`) : ''}
                    selectedIndex={values.type ? new IndexPath(ticketTypes.indexOf(values.type)) : null}
                    onSelect={(index) => {
                      const selectedType = ticketTypes[index.row];
                      setFieldValue('type', selectedType);
                    }}
                    status={errors.type && touched.type ? 'danger' : 'basic'}
                    caption={touched.type && errors.type ? errors.type : ''}
                  >
                    {ticketTypes.map((type, index) => 
                      renderSelectOption(t(`supportTickets.types.${type}`), index)
                    )}
                  </Select>
                </Layout>

                {/* Priority */}
                <Layout style={styles.fieldContainer}>
                  <Text category="label" style={[styles.fieldLabel, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>
                    {t('supportTickets.createForm.priority')} *
                  </Text>
                  <Select
                    style={styles.input}
                    value={t(`supportTickets.priority.${values.priority}`)}
                    selectedIndex={new IndexPath(priorities.indexOf(values.priority))}
                    onSelect={(index) => {
                      const selectedPriority = priorities[index.row];
                      setFieldValue('priority', selectedPriority);
                    }}
                    status={errors.priority && touched.priority ? 'danger' : 'basic'}
                    caption={touched.priority && errors.priority ? errors.priority : ''}
                  >
                    {priorities.map((priority, index) => 
                      renderSelectOption(t(`supportTickets.priority.${priority}`), index)
                    )}
                  </Select>
                </Layout>

                {/* Description */}
                <Layout style={styles.fieldContainer}>
                  <Text category="label" style={[styles.fieldLabel, {
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>
                    {t('supportTickets.createForm.description')} *
                  </Text>
                  <Input
                    style={styles.textArea}
                    textStyle={styles.textAreaContent}
                    placeholder={t('supportTickets.createForm.descriptionPlaceholder')}
                    multiline={true}
                    numberOfLines={6}
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    status={errors.description && touched.description ? 'danger' : 'basic'}
                    caption={touched.description && errors.description ? errors.description : ''}
                  />
                </Layout>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.gradientButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting || formSubmitting}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme['color-shadcn-primary'], theme['color-primary-400']]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>
                      {isSubmitting ? t('supportTickets.createForm.submitting') : t('supportTickets.createForm.submit')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Layout>
            )}
          </Formik>
        </Card>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  fieldContainer: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
    borderRadius: 8,
    fontSize: 15,
  },
  textArea: {
    marginBottom: 4,
    borderRadius: 8,
  },
  textAreaContent: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  gradientButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export { CreateSupportTicketScreen };
