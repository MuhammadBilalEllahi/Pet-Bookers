import React from 'react';
import { ScrollView, View, Animated } from 'react-native';
// Add imports for axios client and dependencies
import { createSmartBuyerClient } from '../../../../utils/authAxiosClient';
import { Alert } from 'react-native';

const smartBuyerClient = createSmartBuyerClient();

// --- Orders API Utility Functions ---
export const getOrderDetails = async (order_id) => {
  try {
    const response = await smartBuyerClient.get('customer/order/details', { params: { order_id } });
    return response.data;
  } catch (error) {
    Alert.alert('Error', 'Failed to fetch order details');
    return null;
  }
};

export const getOrderById = async (order_id) => {
  try {
    const response = await smartBuyerClient.get('customer/order/get-order-by-id', { params: { order_id } });
    return response.data;
  } catch (error) {
    Alert.alert('Error', 'Failed to fetch order by ID');
    return null;
  }
};

export const placeOrder = async (params) => {
  try {
    const response = await smartBuyerClient.get('customer/order/place', { params });
    return response.data;
  } catch (error) {
    Alert.alert('Error', 'Failed to place order');
    return null;
  }
};

export const placeOrderByOfflinePayment = async (params) => {
  try {
    const response = await smartBuyerClient.get('customer/order/place-by-offline-payment', { params });
    return response.data;
  } catch (error) {
    Alert.alert('Error', 'Failed to place order by offline payment');
    return null;
  }
};

export const placeOrderByWallet = async (params) => {
  try {
    const response = await smartBuyerClient.get('customer/order/place-by-wallet', { params });
    return response.data;
  } catch (error) {
    Alert.alert('Error', 'Failed to place order by wallet');
    return null;
  }
};
// --- End Orders API Utility Functions ---

const ShimmerCard = () => (
  <View style={{
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  }}>
    <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: '#e0e0e0' }} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <View style={{ width: '60%', height: 16, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
      <View style={{ width: '40%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
      <View style={{ width: '30%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
    </View>
  </View>
);

const OrdersTab = ({ groupedOrders, renderOrderGroup, loading }) => {
  if (loading) {
    return (
      <ScrollView style={{ flex: 1, padding: 8 }}>
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </ScrollView>
    );
  }
  return (
    <ScrollView style={{ flex: 1 }}>
      {Object.keys(groupedOrders).map(groupId => (
        <React.Fragment key={groupId}>
          {renderOrderGroup({ item: groupId })}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

export default OrdersTab; 