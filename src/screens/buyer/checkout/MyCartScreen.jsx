import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { Layout, Text, Button, Select, SelectItem, IndexPath, Icon } from "@ui-kitten/components";
import { AppScreens } from "../../../navigators/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { axiosBuyerClient } from "../../../utils/axiosClient";
import { useTheme } from "../../../theme/ThemeContext";

const cartData = [
  {
    id: 1,
    name: "Atif Maqsood",
    product: "Big Furious Lion",
    price: 345000,
    image: require("../../../../assets/new/lion.png"),
  },
  {
    id: 2,
    name: "Atif Maqsood",
    product: "Big Furious Lion",
    price: 345000,
    image: require("../../../../assets/new/lion.png"),
  },
];

const paymentMethods = ["Cash on Delivery", "Credit Card", "Bank Transfer"];

export const MyCartScreen = () => {
  const [selectedPayment, setSelectedPayment] = useState(new IndexPath(0));
  const [orderNote, setOrderNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const { theme, isDark } = useTheme();

  const subtotal = cartData.reduce((sum, item) => sum + item.price, 0);
  const tax = 0;
  const shippingPrice = 500;
  const discount = 0;
  const total = subtotal + tax + shippingPrice - discount;

  const navigation = useNavigation();

  const handleCheckout = () => {
    navigation.navigate(AppScreens.SHIPING_DETAILS);
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await axiosBuyerClient.get('cart');
        console.log('Cart Response:', response.data);
      } catch (error) {
        console.log('Cart Error:', error.toString()|| error.response?.data || error.message );
        if (error.response?.status === 401) {
          console.log('Authentication required');
        }
      }
    }
    fetchCartData();
  },[])

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.header, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>Shopping Cart</Text>
        
        <View style={[styles.cartBox, { 
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
        }]}>
          <Text style={[styles.farmName, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            <Text style={{ fontWeight: "bold" }}>Farm Name:</Text> Model Pet Farm
          </Text>
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
          {cartData.map((item, index) => (
            <View key={item.id} style={[styles.cartRow, { 
              borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
            }]}>
              <Text style={[styles.srCell, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>{index + 1}</Text>
              <View style={styles.productCell}>
                <Image source={item.image} style={styles.productImage} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.productName, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>{item.name}</Text>
                  <Text style={[styles.productDesc, { 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}>{item.product}</Text>
                  <Text style={[styles.productPrice, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}>Rs {item.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity>
                  <Icon name="close-circle-outline" fill={theme['color-shadcn-destructive']} style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Select
          style={[styles.select, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}
          value={paymentMethods[selectedPayment.row]}
          selectedIndex={selectedPayment}
          onSelect={index => setSelectedPayment(index)}
          placeholder="Choose Payment Method"
        >
          {paymentMethods.map((method, i) => (
            <SelectItem key={i} title={method} />
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
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Sub Total</Text>
            <Text style={[styles.summaryValue, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Tax</Text>
            <Text style={[styles.summaryValue, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {tax}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Rs {shippingPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Discount/Promo</Text>
            <Text style={[styles.summaryValue, { 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>- Rs {discount}</Text>
          </View>
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
              style={[styles.couponBtn, { 
                backgroundColor: theme['color-shadcn-primary']
              }]}
            >
              Apply Code
            </Button>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { 
              fontWeight: "bold",
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
            }]}>Total</Text>
            <Text style={[styles.summaryValue, { 
              fontWeight: "bold",
              color: theme['color-shadcn-primary']
            }]}>
              Rs {total}
            </Text>
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
          >
            <Text style={{ 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
              fontWeight: 'bold',
              fontSize: 11
            }}>
              «Continue Shopping
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
    marginBottom: 4 
  },
  farmName: { 
    marginBottom: 8, 
    fontSize: 15 
  },
  cartBox: { 
    borderWidth: 1, 
    borderRadius: 4, 
    marginBottom: 16
  },
  tableHeader: { 
    flexDirection: "row", 
    padding: 8, 
    borderTopLeftRadius: 4, 
    borderTopRightRadius: 4 
  },
  srHeader: { 
    width: 32, 
    fontWeight: "bold" 
  },
  productHeader: { 
    flex: 1, 
    fontWeight: "bold" 
  },
  cartRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderBottomWidth: 1, 
    paddingVertical: 8, 
    paddingHorizontal: 8 
  },
  srCell: { 
    width: 32, 
    textAlign: "center" 
  },
  productCell: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  productImage: { 
    width: 48, 
    height: 48, 
    borderRadius: 8, 
    marginRight: 8 
  },
  productName: { 
    fontWeight: "bold", 
    fontSize: 15 
  },
  productDesc: { 
    fontSize: 13
  },
  productPrice: { 
    fontSize: 13
  },
  select: { 
    marginBottom: 8, 
    borderRadius: 4 
  },
  noteInput: { 
    borderWidth: 1, 
    borderRadius: 4, 
    padding: 8, 
    minHeight: 48, 
    marginBottom: 16, 
    fontSize: 15 
  },
  summaryBox: { 
    borderWidth: 1, 
    borderRadius: 4, 
    padding: 12, 
    marginBottom: 16
  },
  summaryRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 4 
  },
  summaryLabel: { 
    fontSize: 15 
  },
  summaryValue: { 
    fontSize: 15 
  },
  couponRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 8, 
    gap: 8 
  },
  couponInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderRadius: 4, 
    padding: 8, 
    fontSize: 15 
  },
  couponBtn: { 
    borderRadius: 4, 
    borderWidth: 0 
  },
  featuresRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    marginBottom: 16, 
    gap: 8 
  },
  feature: { 
    alignItems: "center", 
    width: "48%", 
    marginBottom: 8 
  },
  featureIcon: { 
    width: 28, 
    height: 28, 
    marginBottom: 4 
  },
  featureText: { 
    fontSize: 12, 
    textAlign: "center" 
  },
  footerButtonRow: {
    display: 'flex',
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-between',
  },
  continueBtn: {
    flex: 1,
    borderRadius: 8,
    marginRight: 4,
    display: 'flex',
    flexWrap: 'nowrap',
    borderWidth: 1,
  },
  checkoutBtn: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 0,
  },
});
