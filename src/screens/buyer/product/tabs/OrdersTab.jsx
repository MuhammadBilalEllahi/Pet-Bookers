import React from 'react';
import { ScrollView, View, Animated } from 'react-native';
import { useTheme } from '../../../../theme/ThemeContext';

const ShimmerCard = ({ isDark, theme }) => (
  <View style={{
    backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  }}>
      <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <View style={{ width: '60%', height: 16, backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'], borderRadius: 4, marginBottom: 8 }} />
      <View style={{ width: '40%', height: 12, backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'], borderRadius: 4, marginBottom: 8 }} />
      <View style={{ width: '30%', height: 12, backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'], borderRadius: 4 }} />
    </View>
  </View>
);

const OrdersTab = ({ groupedOrders, renderOrderGroup, loading, onSellerReview }) => {
  const { theme, isDark } = useTheme();
  if (loading) {
    return (
      <ScrollView style={{ flex: 1, padding: 8 , backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
        <ShimmerCard isDark={isDark} theme={theme}    />
        <ShimmerCard isDark={isDark} theme={theme} />
      </ScrollView>
    );
  }
  return (
    <ScrollView style={{ flex: 1 }}>
      {Object.keys(groupedOrders).map(groupId => (
        <React.Fragment key={groupId}>
          {renderOrderGroup({ item: groupId, onSellerReview })}
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

export default OrdersTab; 