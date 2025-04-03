import React from 'react';
import {Layout, Text, Icon} from '@ui-kitten/components';
import {TouchableOpacity, StyleSheet} from 'react-native';

export const ImagePicker = ({title}) => (
  <TouchableOpacity style={styles.pickerContainer}>
    <Layout level="3" style={styles.pickerInner}>
      <Icon name="cloud-upload-outline" style={styles.icon} />
      <Text style={styles.pickerTitle} category="label">
        {title}
      </Text>
    </Layout>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pickerContainer: {
    marginVertical: 10,
  },
  pickerInner: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: '#8F9BB3',
  },
  pickerTitle: {
    marginTop: 6,
    fontWeight: '700',
  },
});
