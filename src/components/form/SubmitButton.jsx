import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import {BtnIndicator} from './BtnIndicator';
import {Button} from '@ui-kitten/components';

export const SubmitButton = ({btnText, disabled, onPress}) => (
  <Button
    style={styles.actionBtn}
    onPress={onPress}
    disabled={disabled}
    accessoryRight={disabled && BtnIndicator}
    textStyle={styles.buttonText}>
    {btnText}
  </Button>
);

SubmitButton.propTypes = {
  btnText: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionBtn: {
    backgroundColor: '#27AE60',
    borderRadius: 12,
    borderColor: '#27AE60',
    marginTop: 30,
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
