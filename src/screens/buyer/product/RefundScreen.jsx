import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {
  Layout,
  Text,
  Input,
  Button,
  Spinner,
  Card,
  Divider,
} from '@ui-kitten/components';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { MainScreensHeader } from '../../../components/buyer';
import { createSmartBuyerClient } from '../../../utils/authAxiosClient';
import { selectBaseUrls } from '../../../store/configs';
import { useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

const smartBuyerClient = createSmartBuyerClient();

export const RefundScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  const baseUrls = useSelector(selectBaseUrls);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  
  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await smartBuyerClient.get('customer/order/details', {
        params: { order_id: order.id }
      });
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch order details'
      });
    } finally {
      setLoading(false);
    }
  };

  const pickImages = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
      selectionLimit: 5,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to pick images'
        });
      } else if (response.assets) {
        const newImages = response.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    });
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const submitRefund = async () => {
    if (!refundReason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a refund reason'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('order_details_id', orderDetails[0]?.id || order.id);
      formData.append('amount', order.order_amount);
      formData.append('refund_reason', refundReason);
      
      if (selectedImages.length > 0) {
        selectedImages.forEach((imageUri, index) => {
          formData.append('images[]', {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            type: 'image/jpeg',
            name: `refund_image_${index}.jpg`,
          });
        });
      }

      await smartBuyerClient.post('customer/order/refund-store', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Refund request submitted successfully'
      }, 3000);
      
      setTimeout(()=>navigation.goBack(), 3000)
    } catch (error) {
      console.error('Error submitting refund:', error.response.data ,"l", error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data || 'Failed to submit refund request'
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const renderProductItem = (item) => (
    <Card key={item.id} style={[styles.productCard, { 
      backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
    }]}>
      <View style={styles.productRow}>
        <Image
          source={{ 
            uri: item.product_details?.thumbnail 
              && `${baseUrls['product_thumbnail_url']}/${item.product_details.thumbnail}`
            //   : require('../../../../assets/new/lion.png')
          }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text category="s1" style={[styles.productName, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            {item.product_details?.name || 'Product Name'}
          </Text>
          <Text category="c1" style={[styles.productMeta, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            Qty: {item.qty} | Price: PKR {item.price}
          </Text>
          <Text category="c1" style={[styles.productMeta, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            Total: PKR {(item.qty * item.price).toFixed(2)}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size="large" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <MainScreensHeader navigation={navigation} title="Refund Request" />
      
      <ScrollView style={styles.scrollView}>
        {/* Order Summary */}
        <Card style={[styles.summaryCard, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
        }]}>
          <Text category="h6" style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            Order Summary
          </Text>
          <View style={styles.orderInfo}>
            <Text style={[styles.orderInfoText, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-800']
            }]}>
              Order ID: #{order.id}
            </Text>
            <Text style={[styles.orderInfoText, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-800']
            }]}>
              Date: {new Date(order.created_at).toLocaleDateString()}
            </Text>
            <Text style={[styles.orderInfoText, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-800']
            }]}>
              Total: PKR {order.order_amount}
            </Text>
            <Text style={[styles.orderInfoText, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-800']
            }]}>
              Status: {order.order_status}
            </Text>
          </View>
        </Card>

        {/* Products */}
        {orderDetails && orderDetails.length > 0 && (
          <Card style={[styles.productsCard, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <Text category="h6" style={[styles.sectionTitle, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>
              Products in Order
            </Text>
            {orderDetails.map(renderProductItem)}
          </Card>
        )}

        {/* Refund Form */}
        <Card style={[styles.formCard, { 
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
        }]}>
          <Text category="h6" style={[styles.sectionTitle, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            Refund Request
          </Text>
          
          <Input
            label="Refund Reason"
            placeholder="Please explain why you want a refund..."
            value={refundReason}
            onChangeText={setRefundReason}
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Button
            appearance="outline"
            onPress={pickImages}
            style={styles.imageButton}
          >
            Add Images (Optional)
          </Button>

          {selectedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text category="s1" style={styles.imagePreviewTitle}>
                Selected Images ({selectedImages.length}/5)
              </Text>
              <View style={styles.imagePreviewRow}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewItem}>
                    <Image source={{ uri }} style={styles.imagePreview} />
                    <Button
                      size="tiny"
                      status="danger"
                      onPress={() => removeImage(index)}
                      style={styles.removeImageButton}
                    >
                      ×
                    </Button>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Button
            onPress={submitRefund}
            disabled={submitting || !refundReason.trim()}
            style={styles.submitButton}
          >
            {submitting ? <Spinner size="small" /> : 'Submit Refund Request'}
          </Button>
        </Card>
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
  loadingText: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  productsCard: {
    marginBottom: 16,
    padding: 16,
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  orderInfo: {
    gap: 8,
  },
  orderInfoText: {
    fontSize: 14,
  },
  productCard: {
    marginBottom: 12,
    padding: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  productMeta: {
    marginBottom: 2,
  },
  input: {
    marginBottom: 16,
  },
  imageButton: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreviewTitle: {
    marginBottom: 8,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreviewItem: {
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  submitButton: {
    marginTop: 8,
  },
}); 