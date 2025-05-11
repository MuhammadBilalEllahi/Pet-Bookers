import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { Layout, Text, Button, Icon, CheckBox, Input } from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";
import { AppScreens } from "../../../navigators/AppNavigator";

const defaultShipping = {
  id: 1,
  contactName: "Usman Saeed",
  phone: "03228050237",
  address: "US pet farm near Elementary college chungi amer sidhu, Lahore, 54000.",
  verified: true,
};

export default function ShipingDetails({  }) {
    const navigation = useNavigation();
  const [shippings, setShipping] = useState(defaultShipping);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({
    contactName: "",
    phone: "",
    address: "",
  });
  const [coupon, setCoupon] = useState("");
  const subtotal = 2;
  const tax = 0;
  const shippingPrice = 500;
  const discount = 0;
  const total = subtotal + tax + shippingPrice - discount;

 
  // Handler for adding a new address (could be a modal or navigation)
  const handleAddAddress = () => {
    setShowAddAddress(true);
    // You can implement a modal or navigate to an address form screen
  };

  // Handler for toggling billing address
  const handleSameAsShipping = (checked) => {
    setSameAsShipping(checked);
    if (checked) {
      setBilling({
        contactName: shippings.contactName,
        phone: shippings.phone,
        address: shippings.address,
      });
    } else {
      setBilling({
        contactName: "",
        phone: "",
        address: "",
      });
    }
  };

  const handleContinue = () => {
    navigation.navigate(AppScreens.PAYMENT_PAGE);
  };

  return (
   <ScrollView>
     <Layout style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressStepActive}>
          <Icon name="person-outline" fill="#fff" style={styles.progressIcon} />
        </View>
        <View style={styles.progressLineActive} />
        <View style={styles.progressStepActive}>
          <Icon name="shopping-bag-outline" fill="#fff" style={styles.progressIcon} />
        </View>
        <View style={styles.progressLineInactive} />
        <View style={styles.progressStepInactive}>
          <Icon name="credit-card-outline" fill="#bbb" style={styles.progressIcon} />
        </View>
      </View>

      {/* shippings Address */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Choose shippings Address</Text>
        <View style={styles.addressRow}>
          <View style={styles.verifiedBadge}>
            <Icon name="checkmark-circle-2-outline" fill="#43a047" style={{ width: 18, height: 18, marginRight: 4 }} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
          <Icon name="phone-outline" fill="#222" style={{ width: 18, height: 18, marginRight: 4 }} />
          <Text style={styles.phoneText}>{shippings.phone}</Text>
        </View>
        <View style={styles.addressDetails}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Contact Person Name: </Text>
            {shippings.contactName}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Address: </Text>
            {shippings.address}
          </Text>
        </View>
        <TouchableOpacity style={styles.addAddressBtn} onPress={handleAddAddress}>
          <Text style={styles.addAddressText}>+ Add another Address</Text>
        </TouchableOpacity>
      </View>

      {/* Billing Address */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Choose Billing Address</Text>
        <CheckBox
          checked={sameAsShipping}
          onChange={handleSameAsShipping}
          style={styles.checkbox}
        >
          {evaProps => (
            <Text {...evaProps} style={styles.checkboxText}>
              Same as shippings address
            </Text>
          )}
        </CheckBox>
        {!sameAsShipping && (
          <View>
            <Input
              label="Contact Person Name"
              value={billing.contactName}
              onChangeText={val => setBilling({ ...billing, contactName: val })}
              style={styles.input}
            />
            <Input
              label="Phone"
              value={billing.phone}
              onChangeText={val => setBilling({ ...billing, phone: val })}
              style={styles.input}
            />
            <Input
              label="Address"
              value={billing.address}
              onChangeText={val => setBilling({ ...billing, address: val })}
              style={styles.input}
              multiline
            />
          </View>
        )}
      </View>

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
          <Text style={styles.summaryLabel}>shippings</Text>
          <Text style={styles.summaryValue}>Rs {shippingPrice}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount/Promo</Text>
          <Text style={styles.summaryValue}>- Rs {discount}</Text>
        </View>
        <TextInput
          style={styles.couponInput}
          placeholder="Coupon Code"
          value={coupon}
          onChangeText={setCoupon}
        />
        <Button style={styles.couponBtn} onPress={() => {}}>Apply Code</Button>
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
      <View style={styles.footerRow}>
        <Button
          style={styles.farmCartBtn}
          onPress={() => navigation.goBack()}
          appearance="outline"
        >
          <Text style={{ color: "#d35400", fontWeight: "bold" }}>« Farm Cart</Text>
        </Button>
        <Button
          style={styles.checkoutBtn}
          onPress={handleContinue}
        >
          Checkout »
        </Button>
      </View>
    </Layout>
   </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, marginTop: 8, justifyContent: "center" },
  progressStepActive: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#43a047", alignItems: "center", justifyContent: "center"
  },
  progressStepInactive: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#eee", alignItems: "center", justifyContent: "center"
  },
  progressIcon: { width: 22, height: 22 },
  progressLineActive: { width: 40, height: 4, backgroundColor: "#43a047" },
  progressLineInactive: { width: 40, height: 4, backgroundColor: "#bbb" },
  sectionBox: { borderWidth: 1, borderColor: "#222", borderRadius: 6, marginBottom: 16, backgroundColor: "#fff", padding: 12 },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  addressRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: 4, padding: 6, marginBottom: 8 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#e8f5e9", borderRadius: 4, paddingHorizontal: 6, marginRight: 8 },
  verifiedText: { color: "#43a047", fontWeight: "bold", fontSize: 12 },
  phoneText: { fontWeight: "bold", color: "#222" },
  addressDetails: { marginBottom: 8 },
  addAddressBtn: { alignSelf: "flex-start", backgroundColor: "#e8f5e9", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4 },
  addAddressText: { color: "#388e3c", fontWeight: "bold", fontSize: 13 },
  checkbox: { marginVertical: 8 },
  checkboxText: { color: "#222", fontWeight: "bold" },
  input: { marginBottom: 8, backgroundColor: "#f5f5f5", borderRadius: 4 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, gap: 8 },
  farmCartBtn: {
    flex: 1,
    borderRadius: 8,
    marginRight: 4,
    borderColor: "#d35400",
    borderWidth: 1.5,
    backgroundColor: "#fff",
  },
  checkoutBtn: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 4,
    backgroundColor: "#43a047",
    borderWidth: 0,
    color: "#fff",
    fontWeight: "bold",
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff"
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4
  },
  summaryLabel: { fontSize: 15, fontWeight: "bold" },
  summaryValue: { fontSize: 15 },
  couponInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    fontSize: 15,
    marginBottom: 8,
    marginTop: 8
  },
  couponBtn: {
    borderRadius: 4,
    backgroundColor: "#43a047",
    borderWidth: 0,
    marginBottom: 8
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8
  },
  feature: { alignItems: "center", width: "48%", marginBottom: 8 },
  featureIcon: { width: 28, height: 28, marginBottom: 4 },
  featureText: { fontSize: 12, textAlign: "center" },
}); 