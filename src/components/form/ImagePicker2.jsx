// components/form/ImagePicker.js
import React from 'react';
import { Layout, Text, Icon } from '@ui-kitten/components';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export const ImagePicker2 = ({ title, onPress, imageUri }) => {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.wrapper}>
      {imageUri ? (
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Image 
            source={{ uri: imageUri }} 
            style={[
              styles.previewImage,
              { 
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
              }
            ]} 
          />
          <View style={[
            styles.overlay,
            { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }
          ]}>
            <Icon 
              name="edit-outline" 
              style={[
                styles.editIcon,
                { 
                  tintColor: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[
            styles.pickerContainer,
            { 
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            }
          ]} 
          onPress={onPress} 
          activeOpacity={0.8}
        >
          <Layout 
            level="3" 
            style={[
              styles.pickerInner,
              { 
                backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-primary-100'],
              }
            ]}
          >
            <Icon 
              name="image-outline" 
              style={[
                styles.icon,
                { 
                  tintColor: isDark ? theme['color-shadcn-primary'] : theme['color-primary-500'],
                }
              ]} 
            />
            <Text 
              style={[
                styles.pickerTitle,
                { 
                  color: isDark ? theme['color-shadcn-primary'] : theme['color-primary-500'],
                }
              ]} 
              category="label"
            >
              {title}
            </Text>
          </Layout>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    alignItems: 'center',
  },
  pickerContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pickerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  pickerTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    width: 150,
    height: 150,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    width: 32,
    height: 32,
  },
});
