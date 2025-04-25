import React from 'react';
import { Input, Icon, Text } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { InputError } from './InputError'; // or wherever your error component is
import { useTranslation } from 'react-i18next';

/**
 * A reusable Formik-connected Input field using UI Kitten.
 * @param {string} name - Formik field name.
 * @param {object} formik - Formik props (from render prop).
 * @param {string} placeholder - Placeholder text.
 * @param {string} [label] - Optional label.
 * @param {string} [keyboardType] - e.g. 'email-address', 'phone-pad'
 * @param {boolean} [secureTextEntry] - Password input toggle
 * @param {JSX.Element} [icon] - Left icon
 * @returns {JSX.Element}
 */
const FormInputField = ({
  name,
  formik,
  placeholder,
  label,
  keyboardType = 'default',
  secureTextEntry = false,
  icon,
}) => {
  const { t } = useTranslation();
  const { handleChange, handleBlur, values, errors, touched } = formik;
  const hasError = errors[name] && touched[name];

  return (
    <Input
      label={label ? () => <Text style={styles.label}>{t(label)}</Text> : undefined}
      placeholder={t(placeholder)}
      textStyle={styles.text}
      style={[styles.input]}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        value={values[name]}
        caption={hasError && <InputError errorText={errors[name]} />}
        status={hasError ? 'danger' : 'basic'}
      accessoryLeft={icon}
    />
  );
};

export default FormInputField;

const styles = StyleSheet.create({
  input: {
    marginVertical: 10,
    borderRadius: 10,
    borderColor: '#C1C1C1',
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: 'red',
  },
  text: {
    fontSize: 14,
    paddingVertical: 4,
  },
  label: {
    color: '#121212',
    fontSize: 16,
    marginBottom: 7,
  },
});
