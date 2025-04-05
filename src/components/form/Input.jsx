import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

const Input = ({
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  value,
  onChangeText,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        placeholderTextColor="#aaa"
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  input: {
    fontSize: 16,
    color: '#000',
  },
});

export default Input;
