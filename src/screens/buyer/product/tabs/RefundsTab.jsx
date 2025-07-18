import React from 'react';
import { ScrollView, Image, View, TouchableOpacity } from 'react-native';
import { Spinner, Text, Card, Divider, Icon } from '@ui-kitten/components';
// Add imports for axios client and dependencies
import { createSmartBuyerClient } from '../../../../utils/authAxiosClient';
import { Alert } from 'react-native';

const smartBuyerClient = createSmartBuyerClient();


export const getRefundDetails = async (params) => {
  try {
    const response = await smartBuyerClient.get('customer/order/refund-details');
    return response.data;
  } catch (error) {
    Alert.alert('Error', 'Failed to get refund details');
    return null;
  }
};
// --- End Refunds API Utility Functions ---

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'pending': return '#FFD700';
    case 'approved': return '#4BB543';
    case 'rejected': return '#FF4C4C';
    case 'refunded': return '#36B37E';
    default: return '#B0B0B0';
  }
};

const StatusBadge = ({ status }) => (
  <View style={{
    backgroundColor: getStatusColor(status),
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 2,
  }}>
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
      {status || 'N/A'}
    </Text>
  </View>
);

const ShimmerCard = () => (
  <View style={{
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  }}>
    <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: '#e0e0e0' }} />
    <View style={{ flex: 1, marginLeft: 14 }}>
      <View style={{ width: '60%', height: 16, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
      <View style={{ width: '40%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
      <View style={{ width: '30%', height: 12, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
    </View>
  </View>
);

const RefundsTab = ({ refundsLoading, filteredRefunds, baseUrls }) => {
  // Sort refunds: those with status 'N/A' at the end
  const sortedRefunds = React.useMemo(() => {
    return [...filteredRefunds].sort((a, b) => {
      const statusA = (a.refund?.refund_request?.[0]?.status || 'N/A').toLowerCase();
      const statusB = (b.refund?.refund_request?.[0]?.status || 'N/A').toLowerCase();
      if (statusA === 'n/a' && statusB !== 'n/a') return 1;
      if (statusA !== 'n/a' && statusB === 'n/a') return -1;
      return 0;
    });
  }, [filteredRefunds]);

  if (refundsLoading) {
    return (
      <ScrollView style={{ flex: 1, padding: 12 }}>
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      {sortedRefunds.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', marginTop: 48 }}>
          <Icon name="file-text-outline" width={48} height={48} fill="#B0B0B0" style={{ marginBottom: 8 }} />
          <Text appearance="hint" style={{ textAlign: 'center', fontSize: 16 }}>No refunds found.</Text>
        </View>
      ) : (
        sortedRefunds.map((refund, idx) => {
          // Prefer refund.product_details, fallback to refund.order_details.product_details
          let product = refund.product_details;
          if (!product && refund.order_details && refund.order_details.product_details) {
            product = refund.order_details.product_details;
          }
          product = product || {};
          const orderDetails = refund.order_details || {};
          const refundStatus = refund.status || 'N/A';
          const deliveryStatus = orderDetails.delivery_status || 'N/A';
          const qty = orderDetails.qty || 1;
          const price = orderDetails.price || refund.amount || 0;
          const refundReason = refund.refund_reason || '';
          const approvedNote = refund.approved_note || '';
          const rejectedNote = refund.rejected_note || '';
          const refundDate = refund.created_at ? new Date(refund.created_at).toLocaleString() : null;

          return (
            <Card
              key={refund.id + '-' + idx}
              style={{
                marginBottom: 14,
                borderRadius: 14,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 2,
                padding: 0,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
                <View>
                  {product.thumbnail ? (
                    <Image
                      source={{ uri: `${baseUrls['product_thumbnail_url']}/${product.thumbnail}` }}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 10,
                        backgroundColor: '#f2f2f2',
                        borderWidth: 1,
                        borderColor: '#eee',
                      }}
                    />
                  ) : (
                    <View style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      backgroundColor: '#f2f2f2',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icon name="image-outline" width={32} height={32} fill="#B0B0B0" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text category="s1" style={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {product.name || 'Product'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <StatusBadge status={refundStatus} />
                    <Text category="c1" style={{ marginLeft: 8 }}>
                      Delivery: {deliveryStatus}
                    </Text>
                  </View>
                  <Text category="c1" appearance="hint" style={{ marginBottom: 2 }}>
                    Qty: {qty} | Price: PKR {price}
                  </Text>
                  <Text category="c1" appearance="hint" style={{ marginBottom: 2 }}>
                    Order #{refund.order_id}
                  </Text>
                  {refundDate && (
                    <Text category="c1" appearance="hint" style={{ marginBottom: 2 }}>
                      Requested: {refundDate}
                    </Text>
                  )}
                  {refundReason ? (
                    <Text category="c1" appearance="hint" style={{ marginTop: 2 }}>
                      <Text style={{ fontWeight: 'bold' }}>Your Reason:</Text> {refundReason}
                    </Text>
                  ) : null}
                  {approvedNote ? (
                    <Text category="c1" style={{ color: '#4BB543', marginTop: 2 }}>
                      <Text style={{ fontWeight: 'bold' }}>Approved Note:</Text> {approvedNote}
                    </Text>
                  ) : null}
                  {rejectedNote ? (
                    <Text category="c1" style={{ color: '#FF4C4C', marginTop: 2 }}>
                      <Text style={{ fontWeight: 'bold' }}>Rejected Note:</Text> {rejectedNote}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Divider />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 10 }}>
                {/* Placeholder for future actions, e.g., View Details */}
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
};

export default RefundsTab;