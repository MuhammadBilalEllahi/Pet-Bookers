import React, { useState } from "react";
import { View, Image, StyleSheet, TextInput, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { Layout, Text, Button, Select, SelectItem, IndexPath, Icon } from "@ui-kitten/components";
import { AppScreens } from "../../../navigators/AppNavigator";
import { useNavigation } from "@react-navigation/native";

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

  const subtotal = cartData.reduce((sum, item) => sum + item.price, 0);
  const tax = 0;
  const shippingPrice = 500;
  const discount = 0;
  const total = subtotal + tax + shippingPrice - discount;

  const navigation = useNavigation();


  const handleCheckout = () => {
    dispatch(setCart(cartData));
    dispatch(setStep(CheckoutSteps.SHIPPING));
    navigation.navigate(AppScreens.SHIPING_DETAILS);
  };

  return (
    <Layout style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.header}>Shopping Cart</Text>
        

        {/* Cart Table */}
        <View style={styles.cartBox}>
        <Text style={styles.farmName}>
          <Text style={{ fontWeight: "bold" }}>Farm Name:</Text> Model Pet Farm
        </Text>
          <View style={styles.tableHeader}>
            <Text style={styles.srHeader}>Sr#</Text>
            <Text style={styles.productHeader}>Product Details</Text>
          </View>
          {cartData.map((item, index) => (
            <View key={item.id} style={styles.cartRow}>
              <Text style={styles.srCell}>{index + 1}</Text>
              <View style={styles.productCell}>
                <Image source={item.image} style={styles.productImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDesc}>{item.product}</Text>
                  <Text style={styles.productPrice}>Rs {item.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity>
                  <Icon name="close-circle-outline" fill="#d32f2f" style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method & Note */}
        <Select
          style={styles.select}
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
          style={styles.noteInput}
          placeholder="Order Note (Optional)"
          value={orderNote}
          onChangeText={setOrderNote}
          multiline
        />

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sub Total</Text>
            <Text style={styles.summaryValue}>Rs {subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>Rs {tax}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Rs {shippingPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount/Promo</Text>
            <Text style={styles.summaryValue}>- Rs {discount}</Text>
          </View>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Coupon Code"
              value={coupon}
              onChangeText={setCoupon}
            />
            <Button style={styles.couponBtn}>Apply Code</Button>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>Total</Text>
            <Text style={[styles.summaryValue, { fontWeight: "bold", color: "#388e3c" }]}>
              Rs {total}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Icon name="car-outline" fill="#222" style={styles.featureIcon} />
            <Text style={styles.featureText}>3 Days Free Delivery</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="award-outline" fill="#222" style={styles.featureIcon} />
            <Text style={styles.featureText}>100% Original Products</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="credit-card-outline" fill="#222" style={styles.featureIcon} />
            <Text style={styles.featureText}>Money Back Guarantee</Text>
          </View>
          <View style={styles.feature}>
            <Icon name="shield-outline" fill="#222" style={styles.featureIcon} />
            <Text style={styles.featureText}>Safe Payments</Text>
          </View>
        </View>

           {/* Footer Buttons */}
      <View style={styles.footerButtonRow}>
        <Button style={styles.continueBtn}  status="basic">
          <Text style={{ color: '#121212', fontWeight: 'bold', fontSize: 11 }}>
            «Continue Shopping
          </Text>
        </Button>
        <Button onPress={handleCheckout} style={styles.checkoutBtn}>
          Checkout »
        </Button>
      </View>
      </ScrollView>
   
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontWeight: "bold", fontSize: 20, marginBottom: 4 },
  farmName: { marginBottom: 8, fontSize: 15 },
  cartBox: { borderWidth: 1, borderColor: "#222", borderRadius: 4, marginBottom: 16, backgroundColor: "#fff" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  srHeader: { width: 32, fontWeight: "bold" },
  productHeader: { flex: 1, fontWeight: "bold" },
  cartRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 8, paddingHorizontal: 8 },
  srCell: { width: 32, textAlign: "center" },
  productCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  productImage: { width: 48, height: 48, borderRadius: 8, marginRight: 8 },
  productName: { fontWeight: "bold", fontSize: 15 },
  productDesc: { fontSize: 13, color: "#444" },
  productPrice: { fontSize: 13, color: "#222" },
  select: { marginBottom: 8, borderRadius: 4 },
  noteInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, minHeight: 48, marginBottom: 16, fontSize: 15 },
  summaryBox: { borderWidth: 1, borderColor: "#222", borderRadius: 4, padding: 12, marginBottom: 16, backgroundColor: "#fff" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 15 },
  couponRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, fontSize: 15 },
  couponBtn: { borderRadius: 4, backgroundColor: "#43a047", borderWidth: 0 },
  featuresRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16, gap: 8 },
  feature: { alignItems: "center", width: "48%", marginBottom: 8 },
  featureIcon: { width: 28, height: 28, marginBottom: 4 },
  featureText: { fontSize: 12, textAlign: "center" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  continueBtn: {
    flex: 1,
    borderRadius: 8,
    marginRight: 4,
    display: 'flex',
    flexWrap: 'nowrap',
    borderColor: "#222",
    backgroundColor: "#fff",
    color: "black",
    fontWeight: "bold",
    fontSize: 1
  },
  checkoutBtn: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 4,
    backgroundColor:"#34981a",
    borderWidth: 0,
    color: "#fff",
    fontWeight: "bold",
  },
  footerButtonRow: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
    
  },
});
