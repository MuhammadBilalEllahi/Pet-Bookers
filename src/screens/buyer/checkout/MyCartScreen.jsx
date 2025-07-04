import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, RefreshControl } from "react-native";
import { Layout, Text, Button, Select, SelectItem, IndexPath, Icon } from "@ui-kitten/components";
import { AppScreens } from "../../../navigators/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { axiosBuyerClient } from "../../../utils/axiosClient";
import { useTheme } from "../../../theme/ThemeContext";
import { useSelector } from "react-redux";
import { selectBaseUrls } from "../../../store/configs";



export const MyCartScreen = () => {
  const [selectedPayment, setSelectedPayment] = useState(new IndexPath(0));
  const [selectedShipping, setSelectedShipping] = useState(new IndexPath(0));
  const [orderNote, setOrderNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();
  const baseUrls = useSelector(selectBaseUrls);
  const navigation = useNavigation();
  const [paymentMethods, setPaymentMethods] = useState([]);

  // COD and EasyPaisa
  const getPaymentMethods = async () => {
      try {
        const response = await axiosBuyerClient.get('shipping-method/payment-methods');
        console.log('Shipping method response:', response.data);
        setPaymentMethods(response.data);
      } catch (error) {
        console.error('Error getting shipping method:', error);
      }
  };
  useEffect(() => {
    getPaymentMethods();
  }, []);

  // Group cart items by seller/farm
  const groupedCartData = cartData.reduce((groups, item) => {
    const sellerId = item.seller_id;
    if (!groups[sellerId]) {
      groups[sellerId] = {
        seller_id: sellerId,
        shop_info: item.shop_info,
        seller_is: item.seller_is,
        items: []
      };
    }
    groups[sellerId].items.push(item);
    return groups;
  }, {});

  const cartGroups = Object.values(groupedCartData);

  // Calculate totals from real cart data
  const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cartData.reduce((sum, item) => sum + (item.tax * item.quantity), 0);
  const cartShippingPrice = cartData.reduce((sum, item) => sum + (item.shipping_cost || 0), 0);
  
  // Add selected shipping method cost
  const selectedShippingMethod = paymentMethods[selectedShipping.row] || {};
  const shippingMethodCost = selectedShippingMethod.cost || 0;
  const totalShippingPrice = cartShippingPrice + shippingMethodCost;
  
  const discount = cartData.reduce((sum, item) => sum + (item.discount * item.quantity), 0);
  const totalBeforeCoupon = subtotal + tax + totalShippingPrice - discount;
  const total = totalBeforeCoupon - couponDiscount;

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await axiosBuyerClient.get('cart');
      console.log('Cart Response:', JSON.stringify(response.data, null, 2));
      setCartData(response.data || []);
    } catch (error) {
      console.log('Cart Error:', error.toString() || error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Authentication required');
      }
      setCartData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    try {
      const response = await axiosBuyerClient.get('coupon/apply', {
        params: {
          code: coupon
        }
      });

      console.log('Coupon response:', response.data);
      // Coupon response: {"coupon_discount": 508}
      
      if (response.data && response.data.coupon_discount) {
        setCouponDiscount(response.data.coupon_discount);
        setAppliedCouponCode(coupon);
        Alert.alert('Success', `Coupon "${coupon}" applied! You saved Rs ${response.data.coupon_discount}`);
      } else {
        Alert.alert('Error', 'Invalid coupon code');
      }
      
    } catch (error) {
      console.error('Error applying coupon:', error?.response?.data?.message || error?.message || error);
      Alert.alert('Error', error?.response?.data?.message || 'Failed to apply coupon');
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCouponCode("");
    setCoupon("");
  };

  const removeFromCart = async (cartItemId) => {
    try {
      setRemoving(prev => ({ ...prev, [cartItemId]: true }));
      
      const response = await axiosBuyerClient.delete('cart/remove', {
        data: { key: cartItemId }
      });
      
      console.log('Remove response:', response.data);
      
      // Remove item from local state
      setCartData(prevData => prevData.filter(item => item.id !== cartItemId));
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    } finally {
      setRemoving(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await axiosBuyerClient.put('cart/update', {
        key: cartItemId,
        quantity: newQuantity
      });
      
      console.log('Update response:', response.data);
      
      // Update local state
      setCartData(prevData => 
        prevData.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const navigateToProductDetail = (product) => {
    navigation.navigate('ProductDetail', {
      productId: product.product_id,
      slug: product.slug
    });
  };

  const handleCheckout = () => {
    if (cartData.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to cart before checkout');
      return;
    }

    const selectedMethod = paymentMethods[selectedShipping.row];
    
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a shipping method first');
      return;
    }

    // Pass cart data and selected payment method to shipping details
    const checkoutData = {
      cartData,
      selectedPaymentMethod: selectedMethod,
      orderNote,
      couponCode: appliedCouponCode,
      couponDiscount,
      totals: {
        subtotal,
        tax,
        shipping: totalShippingPrice,
        discount,
        total
      }
    };

    navigation.navigate(AppScreens.SHIPING_DETAILS, { checkoutData });
  };

  const removeFarmFromCart = async (sellerId, farmName) => {
    try {
      setRemoving(prev => ({ ...prev, [`farm_${sellerId}`]: true }));
      
      const response = await axiosBuyerClient.delete('cart/remove-farm', {
        data: { seller_id: sellerId }
      });
      
      console.log('Remove farm response:', response.data);
      
      if (response.data.status === 1) {
        // Remove all items from this farm from local state
        setCartData(prevData => prevData.filter(item => item.seller_id !== sellerId));
        Alert.alert('Success', `All products from ${farmName} have been removed from your cart`);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to remove farm products');
      }
      
    } catch (error) {
      console.error('Error removing farm from cart:', error);
      Alert.alert('Error', 'Failed to remove farm products');
    } finally {
      setRemoving(prev => ({ ...prev, [`farm_${sellerId}`]: false }));
    }
  };

  const confirmRemove = (cartItemId, productName) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${productName}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(cartItemId) }
      ]
    );
  };

  const confirmRemoveFarm = (sellerId, farmName, itemsCount) => {
    Alert.alert(
      'Remove All Farm Products',
      `Are you sure you want to remove all ${itemsCount} product(s) from "${farmName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove All', style: 'destructive', onPress: () => removeFarmFromCart(sellerId, farmName) }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Reset coupon when refreshing
    setCouponDiscount(0);
    setAppliedCouponCode("");
    setCoupon("");
    await fetchCartData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const renderCartItem = (item, index) => (
    <View key={item.id} style={[styles.cartRow, {
      borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
    }]}>
      <Text style={[styles.srCell, {
        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
      }]}>{index + 1}</Text>
      <TouchableOpacity 
        style={styles.productCell}
        onPress={() => navigateToProductDetail(item)}
      >
        <Image 
          source={{ 
            uri: `${baseUrls['product_thumbnail_url']}/${item.thumbnail}` 
          }} 
          style={styles.productImage} 
        />
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={[styles.productName, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>{item.name}</Text>
          {/* <Text style={[styles.productDesc, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>{item.shop_info}</Text> */}
          <View style={styles.quantityRow}>
            <TouchableOpacity 
              style={[styles.quantityBtn, {
                backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
              }]}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Icon name="minus" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} style={styles.quantityIcon} />
            </TouchableOpacity>
            <Text style={[styles.quantityText, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>{item.quantity}</Text>
            <TouchableOpacity 
              style={[styles.quantityBtn, {
                backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
              }]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Icon name="plus" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} style={styles.quantityIcon} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.productPrice, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Rs {(item.price * item.quantity).toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => confirmRemove(item.id, item.name)}
          disabled={removing[item.id]}
          style={styles.removeBtn}
        >
          {removing[item.id] ? (
            <Icon name="loader-outline" fill={theme['color-shadcn-destructive']} style={styles.removeIcon} />
          ) : (
            <Icon name="close-circle-outline" fill={theme['color-shadcn-destructive']} style={styles.removeIcon} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const renderFarmCartBox = (group, groupIndex) => {
    // Calculate group subtotal
    const groupSubtotal = group.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const groupCartShipping = group.items.reduce((sum, item) => sum + (item.shipping_cost || 0), 0);
    const groupShippingMethodCost = shippingMethodCost / cartGroups.length; // Distribute shipping method cost across farms
    const groupTotalShipping = groupCartShipping + groupShippingMethodCost;
    
    return (
      <View 
        key={group.seller_id} 
        style={[styles.cartBox, {
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
        }]}
      >
        <View style={styles.farmHeader}>
          <Text style={[styles.farmName, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            <Text style={{ fontWeight: "bold" }}>Farm:</Text> {group.shop_info}
          </Text>
          <TouchableOpacity 
            style={[styles.removeFarmBtn, {
              // backgroundColor: isDark ? theme['color-shadcn-destructive'] : theme['color-danger-default']
            }]}
            onPress={() => confirmRemoveFarm(group.seller_id, group.shop_info, group.items.length)}
            disabled={removing[`farm_${group.seller_id}`]}
          >
            {/* {removing[`farm_${group.seller_id}`] ? (
              <Icon name="loader-outline" fill={theme['color-basic-100']} style={styles.removeFarmIcon} />
            )
             : (
              <Icon name="trash-2-outline" fill={theme['color-basic-100']} style={styles.removeFarmIcon} />
            )
            } */}
            <Text style={[styles.removeFarmText, {
              color: isDark ? theme['color-shadcn-destructive'] : theme['color-danger-default']
            }]}>Remove All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.tableHeader, {
          backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
        }]}>
          <Text style={[styles.srHeader, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Sr#</Text>
          <Text style={[styles.productHeader, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Product Details</Text>
        </View>
        
        {group.items.map((item, index) => renderCartItem(item, index))}
        
        {/* Farm subtotal */}
        <View style={[styles.farmSummary, {
          backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
          borderTopColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
        }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Farm Subtotal</Text>
            <Text style={[styles.summaryValue, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {groupSubtotal.toLocaleString()}</Text>
          </View>
          {groupTotalShipping > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Farm Shipping</Text>
              <Text style={[styles.summaryValue, {
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>Rs {groupTotalShipping.toLocaleString()}</Text>
            </View>
          )}
          {groupShippingMethodCost > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                fontSize: 12
              }]}>└ {selectedShippingMethod.title} ({selectedShippingMethod.duration})</Text>
              <Text style={[styles.summaryValue, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                fontSize: 12
              }]}>Rs {groupShippingMethodCost.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Layout style={[styles.container, {
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <Icon name="loader-outline" fill={theme['color-shadcn-primary']} style={{ width: 40, height: 40 }} />
        <Text style={[styles.loadingText, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>Loading your cart...</Text>
      </Layout>
    );
  }

  if (cartData.length === 0) {
    return (
      <Layout style={[styles.container, {
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <Icon name="shopping-cart-outline" fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} style={{ width: 80, height: 80, marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>Your cart is empty</Text>
        <Text style={[styles.emptyDesc, {
          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
        }]}>Add some products to get started</Text>
        <Button
          style={[styles.browseBtn, {
            backgroundColor: theme['color-shadcn-primary']
          }]}
          onPress={() => navigation.navigate('BuyerHome')}
        >
          Browse Products
        </Button>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, {
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={[styles.header, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>Shopping Cart ({cartData.length})</Text>

        {/* Render cart boxes grouped by farm */}
        {cartGroups.map((group, index) => renderFarmCartBox(group, index))}

        <Select
          style={[styles.select, {
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}
          value={paymentMethods[selectedShipping.row]?.title || 'Choose Shipping Method'}
          selectedIndex={selectedShipping}
          onSelect={index => setSelectedShipping(index)}
          placeholder="Choose Shipping Method"
        >
          {paymentMethods.map((method, i) => (
            <SelectItem 
              key={i} 
              title={`${method.title} - Rs ${method.cost} (${method.duration})`} 
            />
          ))}
        </Select>

        

        <TextInput
          style={[styles.noteInput, {
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}
          placeholder="Order Note (Optional)"
          placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          value={orderNote}
          onChangeText={setOrderNote}
          multiline
        />

        <View style={[styles.summaryBox, {
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
        }]}>
          <Text style={[styles.summaryTitle, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Sub Total</Text>
            <Text style={[styles.summaryValue, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Tax</Text>
            <Text style={[styles.summaryValue, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {tax.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Shipping</Text>
            <Text style={[styles.summaryValue, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {totalShippingPrice.toLocaleString()}</Text>
          </View>
          {cartShippingPrice >= 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                fontSize: 12,
                paddingLeft: 16
              }]}>└ Product Shipping</Text>
              <Text style={[styles.summaryValue, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                fontSize: 12
              }]}>Rs {cartShippingPrice.toLocaleString()}</Text>
            </View>
          )}
          {shippingMethodCost > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                fontSize: 12,
                paddingLeft: 16
              }]}>└ {selectedShippingMethod.title} ({selectedShippingMethod.duration})</Text>
              <Text style={[styles.summaryValue, {
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                fontSize: 12
              }]}>Rs {shippingMethodCost.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Discount</Text>
            <Text style={[styles.summaryValue, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>- Rs {discount.toLocaleString()}</Text>
          </View>
          
          {/* Coupon Discount Section */}
          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.couponDiscountRow}>
                <Text style={[styles.summaryLabel, {
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}>Coupon ({appliedCouponCode})</Text>
                <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                  <Icon name="close-circle-outline" fill={theme['color-shadcn-destructive']} style={styles.removeCouponIcon} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.summaryValue, {
                color: theme['color-success-default']
              }]}>- Rs {couponDiscount.toLocaleString()}</Text>
            </View>
          )}
          {/* Hide coupon input when coupon is already applied */}
          {couponDiscount === 0 && (
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.couponInput, {
                  backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
                  borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }]}
                placeholder="Coupon Code"
                placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
                value={coupon}
                onChangeText={setCoupon}
              />
              <Button
                onPress={handleApplyCoupon}   
                style={[styles.couponBtn, {
                  backgroundColor: theme['color-shadcn-primary']
                }]}
              >
                Apply Code
              </Button>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, {
              fontWeight: "bold",
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Total</Text>
            <View style={styles.totalPriceContainer}>
              {couponDiscount > 0 ? (
                <>
                  <Text style={[styles.originalTotal, {
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>
                    Rs {totalBeforeCoupon.toLocaleString()}
                  </Text>
                  <Text style={[styles.discountedTotal, {
                    color: theme['color-shadcn-primary'],
                    fontWeight: "bold"
                  }]}>
                    Rs {total.toLocaleString()}
                  </Text>
                </>
              ) : (
                <Text style={[styles.summaryValue, {
                  fontWeight: "bold",
                  color: theme['color-shadcn-primary']
                }]}>
                  Rs {total.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Icon name="car-outline" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} style={styles.featureIcon} />
            <Text style={[styles.featureText, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>3 Days Free Delivery</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="award-outline" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} style={styles.featureIcon} />
            <Text style={[styles.featureText, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>100% Original Products</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="credit-card-outline" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} style={styles.featureIcon} />
            <Text style={[styles.featureText, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Money Back Guarantee</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="shield-outline" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} style={styles.featureIcon} />
            <Text style={[styles.featureText, {
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Safe Payments</Text>
          </View>
        </View>

        <View style={[styles.footerButtonRow, {
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          borderTopColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
        }]}>
          <Button
            style={[styles.continueBtn, {
              backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-100'],
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
            }]}
            status="basic"
            onPress={() => navigation.navigate('BuyerHome')}
          >
            <Text style={{
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
              fontWeight: 'bold',
              fontSize: 11
            }}>
              « Continue Shopping
            </Text>
          </Button>
          <Button
            onPress={handleCheckout}
            style={[styles.checkoutBtn, {
              backgroundColor: theme['color-shadcn-primary']
            }]}
          >
            Checkout »
          </Button>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 4
  },
  farmName: {
    fontSize: 16,
    
    flex: 1
  },
  removeFarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 12,
    // paddingVertical: 6,
    // borderRadius: 6,
    // gap: 4
  },
  removeFarmIcon: {
    width: 16,
    height: 16
  },
  removeFarmText: {
    opacity: 0.7,
    fontSize: 10,
    fontWeight: 'light'
  },
  cartBox: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  srHeader: {
    width: 40,
    fontWeight: "bold",
    fontSize: 14
  },
  productHeader: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 14
  },
  cartRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: 12,
    // paddingHorizontal: 12
  },
  srCell: {
    width: 40,
    textAlign: "center",
    fontSize: 14
  },
  productCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  productName: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4
  },
  productDesc: {
    fontSize: 13,
    marginBottom: 8
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityIcon: {
    width: 16,
    height: 16
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: 'bold'
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  removeBtn: {
    padding: 8
  },
  removeIcon: {
    width: 24,
    height: 24
  },
  farmSummary: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  select: {
    marginBottom: 16,
    borderRadius: 8
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 16,
    fontSize: 14,
    textAlignVertical: 'top'
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8
  },
  summaryLabel: {
    fontSize: 15
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600'
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14
  },
  couponBtn: {
    borderRadius: 8,
    borderWidth: 0
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12
  },
  feature: {
    alignItems: "center",
    width: "48%",
    marginBottom: 12
  },
  featureIcon: {
    width: 32,
    height: 32,
    marginBottom: 8
  },
  featureText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: '500'
  },
  footerButtonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-between',
    paddingTop: 16
  },
  continueBtn: {
    flex: 1,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1
  },
  checkoutBtn: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 0
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8
  },
  emptyDesc: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center'
  },
  browseBtn: {
    borderRadius: 8,
    borderWidth: 0,
    paddingHorizontal: 32
  },
  couponDiscountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  removeCouponBtn: {
    marginLeft: 8,
    padding: 4
  },
  removeCouponIcon: {
    width: 16,
    height: 16
  },
  totalPriceContainer: {
    alignItems: 'flex-end'
  },
  originalTotal: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginBottom: 4
  },
  discountedTotal: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});
