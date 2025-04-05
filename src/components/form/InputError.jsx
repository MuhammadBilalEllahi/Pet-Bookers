import React from 'react';
import {Text} from 'react-native';

export const InputError = ({errorText}) =>
  errorText ? (
    <Text category="c2" status="danger">
      {errorText}
    </Text>
  ) : null;
