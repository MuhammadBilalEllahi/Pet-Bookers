import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert, RefreshControl } from 'react-native';
import { Button, Layout, Text, Card, Icon, List, ListItem } from '@ui-kitten/components';
import { spacingStyles } from '../../utils/globalStyles';
import { axiosBuyerClient } from '../../utils/axiosClient';
import Toast from 'react-native-toast-message';

export const AddressListScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosBuyerClient.get('customer/address/list');
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Load addresses error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load addresses',
        text2: error.response?.data?.message || 'Something went wrong',
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
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
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
          text1: 'Address Deleted',
          text2: response.data.message || 'Address deleted successfully',
          position: 'top',
        });

        // Remove from local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      }
    } catch (error) {
      console.error('Delete address error:', error);
      Toast.show({
        type: 'error',
        text1: 'Delete failed',
        text2: error.response?.data?.message || 'Failed to delete address',
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
      <Card style={styles.addressCard} disabled={isDeleting}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeContainer}>
            <Icon 
              name={item.address_type === 'home' ? 'home-outline' : 'briefcase-outline'} 
              style={styles.addressTypeIcon}
            />
            <Text category="h6" style={styles.addressType}>
              {item.address_type?.charAt(0).toUpperCase() + item.address_type?.slice(1)}
            </Text>
            {item.is_billing === '1' && (
              <View style={styles.billingBadge}>
                <Text category="c2" style={styles.billingText}>Billing</Text>
              </View>
            )}
          </View>
          <View style={styles.actionButtons}>
            <Button
              appearance="ghost"
              status="primary"
              size="small"
              accessoryLeft={(props) => <Icon {...props} name="edit-outline" />}
              onPress={() => navigateToEditAddress(item)}
              disabled={isDeleting}
            />
            <Button
              appearance="ghost"
              status="danger"
              size="small"
              accessoryLeft={(props) => <Icon {...props} name="trash-2-outline" />}
              onPress={() => handleDeleteAddress(item.id)}
              disabled={isDeleting}
            />
          </View>
        </View>
        
        <View style={styles.addressDetails}>
          <Text category="s1" style={styles.contactName}>{item.contact_person_name}</Text>
          <Text category="p2" style={styles.addressText}>{item.address}</Text>
          <Text category="p2" style={styles.addressText}>
            {item.city}, {item.zip}, {item.country}
          </Text>
          <Text category="p2" style={styles.phoneText}>{item.phone}</Text>
        </View>
      </Card>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="map-outline" style={styles.emptyIcon} />
      <Text category="h6" style={styles.emptyTitle}>No Addresses</Text>
      <Text category="p2" style={styles.emptyText}>
        You haven't added any addresses yet. Add your first address to get started.
      </Text>
      <Button
        style={styles.emptyButton}
        onPress={navigateToAddAddress}
      >
        Add Address
      </Button>
    </View>
  );

  if (loading) {
    return (
      <Layout level="3" style={styles.loadingContainer}>
        <Text>Loading addresses...</Text>
      </Layout>
    );
  }

  return (
    <Layout level="3" style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContainer}
      >
        <Layout style={styles.header}>
          <Text category="h5">Manage Addresses</Text>
          <Text category="p2" style={styles.subtitle}>
            Add and manage your delivery addresses
          </Text>
        </Layout>

        <Button
          style={styles.addButton}
          accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
          onPress={navigateToAddAddress}
        >
          Add New Address
        </Button>

        {addresses.length === 0 ? (
          <EmptyState />
        ) : (
          <List
            data={addresses}
            renderItem={renderAddressItem}
            style={styles.addressList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  addButton: {
    marginBottom: 20,
    borderRadius: 100,
  },
  addressList: {
    backgroundColor: 'transparent',
  },
  addressCard: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressTypeIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  addressType: {
    marginRight: 8,
  },
  billingBadge: {
    backgroundColor: '#FF6D1A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  billingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  addressDetails: {
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contactName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    opacity: 0.8,
  },
  phoneText: {
    opacity: 0.8,
    fontWeight: '500',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    paddingHorizontal: 32,
  },
  emptyButton: {
    borderRadius: 100,
    paddingHorizontal: 32,
  },
}); 