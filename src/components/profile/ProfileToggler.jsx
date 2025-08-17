import React, { useState } from 'react';
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Icon, Text } from '@ui-kitten/components';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated 
} from '../../store/user';

export const ProfileToggler = ({ 
  currentProfileType, // 'buyer' or 'seller'
  onProfileSwitch, // callback when profile is switched
  style = {} // additional styles
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);
  
  // Check if both profiles are authenticated
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  
  // Only show toggler if both profiles are authenticated
  const shouldShowToggler = isBuyerAuthenticated && isSellerAuthenticated;
  
  if (!shouldShowToggler) {
    return null;
  }

  const getCurrentProfileIcon = () => {
    return currentProfileType === 'seller' ? 'shopping-bag' : 'person';
  };

  const getCurrentProfileText = () => {
    return currentProfileType === 'seller' ? t('seller') : t('buyer');
  };

  const handleProfileSwitch = (newProfileType) => {
    setUserTypeModalVisible(false);
    if (onProfileSwitch && newProfileType !== currentProfileType) {
      onProfileSwitch(newProfileType);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.userTypeButton, { 
          backgroundColor: isDark ? theme['color-shadcn-secondary'] : 'rgba(39, 174, 96, 0.1)',
          borderColor: theme['color-shadcn-primary'],
          borderWidth: 1,
          borderRadius: 20,
          paddingVertical: 6,
          paddingHorizontal: 16,
          minWidth: 120,
          ...style
        }]}
        onPress={() => setUserTypeModalVisible(true)}
      >
        <View style={styles.userTypeButtonContent}>
          <Icon
            name={getCurrentProfileIcon()}
            fill={theme['color-shadcn-primary']}
            style={{ width: 16, height: 16, marginRight: 8 }}
          />
          <Text style={[styles.userTypeButtonText, { 
            color: theme['color-shadcn-primary']
          }]}>
            {getCurrentProfileText()}
          </Text>
        </View>
        <Icon
          name="chevron-down"
          fill={theme['color-shadcn-primary']}
          style={{ width: 16, height: 16 }}
        />
      </TouchableOpacity>

      <Modal
        visible={userTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserTypeModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { 
            backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.25)'
          }]}
          activeOpacity={1}
          onPressOut={() => setUserTypeModalVisible(false)}
        >
          <View style={[styles.userTypeModal, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            {isSellerAuthenticated && (
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  currentProfileType === 'seller' && styles.userTypeOptionSelected
                ]}
                onPress={() => handleProfileSwitch('seller')}
              >
                <Icon
                  name="shopping-bag"
                  fill={currentProfileType === 'seller' ? theme['color-basic-100'] : theme['color-shadcn-primary']}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                <Text style={[
                  styles.userTypeOptionText,
                  { color: currentProfileType === 'seller' ? theme['color-basic-100'] : theme['color-shadcn-primary'] }
                ]}>
                  {t('seller')}
                </Text>
              </TouchableOpacity>
            )}
            
            {isBuyerAuthenticated && (
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  currentProfileType === 'buyer' && styles.userTypeOptionSelected
                ]}
                onPress={() => handleProfileSwitch('buyer')}
              >
                <Icon
                  name="person"
                  fill={currentProfileType === 'buyer' ? theme['color-basic-100'] : theme['color-shadcn-primary']}
                  style={{ width: 16, height: 16, marginRight: 8 }}
                />
                <Text style={[
                  styles.userTypeOptionText,
                  { color: currentProfileType === 'buyer' ? theme['color-basic-100'] : theme['color-shadcn-primary'] }
                ]}>
                  {t('buyer')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  userTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userTypeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeModal: {
    borderRadius: 12,
    width: 200,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userTypeOptionSelected: {
    backgroundColor: '#27AE60',
  },
  userTypeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
