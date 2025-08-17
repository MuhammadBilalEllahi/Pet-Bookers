import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, RefreshControl, Dimensions } from 'react-native';
import { Button, Layout, Text, Card, Icon, List, ListItem } from '@ui-kitten/components';
import { spacingStyles } from '../../utils/globalStyles';
import { axiosBuyerClient } from '../../utils/axiosClient';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const AddressListScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosBuyerClient.get('customer/address/list');
      console.log("ADDRESS LIST", response.data);
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Load addresses error:', error);
      Toast.show({
        type: 'error',
        text1: t('addressListScreen.alerts.loadFailedTitle'),
        text2: error.response?.data?.message || t('addressListScreen.alerts.loadFailedMessage'),
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert(
      t('addressListScreen.alerts.deleteTitle'),
      t('addressListScreen.alerts.deleteMessage'),
      [
        {
          text: t('addressListScreen.alerts.cancel'),
          style: 'cancel',
        },
        {
          text: t('addressListScreen.alerts.delete'),
          style: 'destructive',
          onPress: () => confirmDeleteAddress(addressId),
        },
      ]
    );
  };

  const confirmDeleteAddress = async (addressId) => {
    try {
      setDeletingId(addressId);
      
      const formData = new FormData();
      formData.append('address_id', addressId);

      const response = await axiosBuyerClient.delete('customer/address/', {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('addressListScreen.alerts.deleteSuccessTitle'),
          text2: response.data.message || t('addressListScreen.alerts.deleteSuccessMessage'),
          position: 'top',
        });

        // Remove from local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      }
    } catch (error) {
      console.error('Delete address error:', error);
      Toast.show({
        type: 'error',
        text1: t('addressListScreen.alerts.deleteFailedTitle'),
        text2: error.response?.data?.message || t('addressListScreen.alerts.deleteFailedMessage'),
        position: 'top',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const navigateToAddAddress = () => {
    navigation.navigate('AddAddress', {
      onAddressAdded: loadAddresses
    });
  };

  const navigateToEditAddress = (address) => {
    navigation.navigate('EditAddress', {
      address,
      onAddressUpdated: loadAddresses
    });
  };

  const renderAddressItem = ({ item }) => {
    const isDeleting = deletingId === item.id;
    
    return (
      <Layout
        style={[
          styles.addressCard,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-300'],
          },
        ]}
        level="1"
      >
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeContainer}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-muted']
                    : theme['color-basic-200'],
                },
              ]}
            >
              <Icon 
                name={item.address_type === 'home' ? 'home-outline' : 'briefcase-outline'} 
                style={[
                  styles.addressTypeIcon,
                  {
                    tintColor: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-700'],
                  },
                ]}
              />
            </View>
            <View style={styles.addressInfo}>
              <Text
                category="h6"
                style={[
                  styles.addressType,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}
              >
                {item.address_type === 'home' 
                  ? t('addressListScreen.addressTypes.home')
                  : t('addressListScreen.addressTypes.office')
                }
              </Text>
              {item.is_billing === '1' && (
                <View style={styles.billingBadge}>
                  <Text category="c2" style={styles.billingText}>
                    {t('addressListScreen.addressTypes.billing')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actionButtons}>
            <Button
              appearance="ghost"
              status="primary"
              size="small"
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  marginRight: 8,
                },
              ]}
              accessoryLeft={(props) => (
                <Icon
                  {...props}
                  name="edit-outline"
                  style={{
                    tintColor: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-700'],
                  }}
                />
              )}
              onPress={() => navigateToEditAddress(item)}
              disabled={isDeleting}
            />
            <Button
              appearance="ghost"
              status="danger"
              size="small"
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(239, 68, 68, 0.05)',
                },
              ]}
              accessoryLeft={(props) => (
                <Icon
                  {...props}
                  name="trash-2-outline"
                  style={{
                    tintColor: theme['color-danger-500'],
                  }}
                />
              )}
              onPress={() => handleDeleteAddress(item.id)}
              disabled={isDeleting}
            />
          </View>
        </View>
        
        <View style={styles.addressDetails}>
          <Text
            category="s1"
            style={[
              styles.contactName,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}
          >
            {item.contact_person_name}
          </Text>
          <Text
            category="p2"
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}
          >
            {item.address}
          </Text>
          <Text
            category="p2"
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}
          >
            {item.city}, {item.zip}, {item.country}
          </Text>
          <Text
            category="p2"
            style={[
              styles.phoneText,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-700'],
              },
            ]}
          >
            {item.phone}
          </Text>
        </View>
      </Layout>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-muted']
              : theme['color-basic-200'],
          },
        ]}
      >
        <Icon
          name="map-outline"
          style={[
            styles.emptyIcon,
            {
              tintColor: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-500'],
            },
          ]}
        />
      </View>
      <Text
        category="h6"
        style={[
          styles.emptyTitle,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}
      >
        {t('addressListScreen.emptyState.title')}
      </Text>
      <Text
        category="p2"
        style={[
          styles.emptyText,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}
      >
        {t('addressListScreen.emptyState.message')}
      </Text>
      <Button
        style={[
          styles.emptyButton,
          {
            backgroundColor: theme['color-primary-500'],
          },
        ]}
        onPress={navigateToAddAddress}
      >
        {t('addressListScreen.emptyState.addButton')}
      </Button>
    </View>
  );

  if (loading) {
    return (
      <Layout
        level="1"
        style={[
          styles.loadingContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}
      >
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}
        >
          {t('addressListScreen.loading')}
        </Text>
      </Layout>
    );
  }

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <Layout
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}
        level="1"
      >
        <Text
          category="h5"
          style={[
            styles.headerTitle,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}
        >
          {t('addressListScreen.title')}
        </Text>
        <Text
          category="p2"
          style={[
            styles.subtitle,
            {
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}
        >
          {t('addressListScreen.subtitle')}
        </Text>
      </Layout>

      <Button
        style={[
          styles.addButton,
          {
            backgroundColor: theme['color-primary-500'],
            borderColor: theme['color-primary-500'],
          },
        ]}
        accessoryLeft={(props) => (
          <Icon
            {...props}
            name="plus-outline"
            style={{ tintColor: theme['color-basic-100'] }}
          />
        )}
        onPress={navigateToAddAddress}
      >
        {evaProps => (
          <Text
            {...evaProps}
            style={[
              evaProps.style,
              { color: theme['color-basic-100'], fontWeight: '600' },
            ]}
          >
            {t('addressListScreen.addNewAddress')}
          </Text>
        )}
      </Button>
    </View>
  );

  if (addresses.length === 0 && !loading) {
    return (
      <Layout
        level="1"
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}
      >
        {renderListHeader()}
        <EmptyState />
      </Layout>
    );
  }

  return (
    <Layout
      level="1"
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}
    >
      <List
        data={addresses}
        renderItem={renderAddressItem}
        ListHeaderComponent={renderListHeader}
        style={[
          styles.addressList,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    minHeight: windowHeight,
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButton: {
    marginBottom: 24,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 0,
    shadowOpacity: 0,
    height: 56, // Fixed height to prevent expansion
    marginHorizontal: 0,
  },
  addressList: {
    backgroundColor: 'transparent',
  },
  addressCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTypeIcon: {
    width: 20,
    height: 20,
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  billingBadge: {
    backgroundColor: '#FF6D1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  billingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressDetails: {
    paddingTop: 8,
  },
  contactName: {
    fontWeight: '600',
    fontSize: 16,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    width: 40,
    height: 40,
  },
  emptyTitle: {
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
});