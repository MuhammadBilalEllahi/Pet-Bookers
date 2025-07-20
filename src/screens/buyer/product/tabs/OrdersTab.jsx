import React from 'react';
import { ScrollView, View, Animated } from 'react-native';

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