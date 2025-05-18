// components/form/ImagePicker.js
import React from 'react';
import { Layout, Text, Icon } from '@ui-kitten/components';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';

export const ImagePicker = ({ title, onPress, imageUri }) => (
  <View style={styles.wrapper}>
    <TouchableOpacity style={styles.pickerContainer} onPress={onPress} activeOpacity={0.8}>
      <Layout level="3" style={styles.pickerInner}>
        <Icon name="cloud-upload-outline" style={styles.icon} />
        <Text style={styles.pickerTitle} category="label">
          {title}
        </Text>
      </Layout>
    </TouchableOpacity>
    {imageUri && (
      <Image source={{ uri: imageUri }} style={styles.previewImage} />
    )}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    alignItems: 'center',
  },
  pickerContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pickerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#fcfcfc',
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#121212',
    marginRight: 10,
  },
  pickerTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#121212',
  },
  previewImage: {
    marginTop: 8,
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

// import React from 'react';
// import {Layout, Text, Icon} from '@ui-kitten/components';
// import {TouchableOpacity, StyleSheet} from 'react-native';

// export const ImagePicker = ({title, onPress}) => (
//   <TouchableOpacity style={styles.pickerContainer} onPress={onPress}>
//     <Layout level="3" style={styles.pickerInner}>
//       <Icon name="cloud-upload-outline" style={styles.icon} />
//       <Text style={styles.pickerTitle} category="label">
//         {title}
//       </Text>
//     </Layout>
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   pickerContainer: {
//     marginVertical: 10,
//     backgroundColor: 'white'
//   },
//   pickerInner: {
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#fcfcfc'
//   },
//   icon: {
//     width: 30,
//     height: 30,
//     tintColor: '#121212',
//   },
//   pickerTitle: {
//     marginTop: 6,
//     fontWeight: '700',
//   },
// });
