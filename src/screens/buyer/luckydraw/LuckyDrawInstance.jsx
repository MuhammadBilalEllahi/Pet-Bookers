import React, { useState } from "react";
import { Input, Button, Text, Layout, Icon } from "@ui-kitten/components";
import { View, Image } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function LuckyDrawInstance() {
  const route = useRoute();
  const navigation = useNavigation();
  const { luckyDraw } = route.params || {};

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO: Replace with your API call
    // await axiosBuyerClient.post('lucky_draw/apply', { name, city, phone, lucky_draw_id: luckyDraw.id });
    setSubmitting(false);
    // Optionally show a success message or navigate back
    navigation.goBack();
  };

  return (
    <Layout style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <Icon
          name="close-outline"
          fill="#888"
          style={{ width: 28, height: 28, marginRight: 8 }}
          onPress={() => navigation.goBack()}
        />
        <Text category="h6" style={{ fontWeight: "bold" }}>
          Lucky Draw
        </Text>
      </View>

      {/* Icon */}
      <View style={{ alignItems: "center", marginBottom: 12 }}>
        <Image
          source={require("../../../assets/luckydraw.png")} // Use your own icon
          style={{ width: 60, height: 60, marginBottom: 8 }}
          resizeMode="contain"
        />
        <Text style={{ fontWeight: "bold", fontSize: 16, textAlign: "center" }}>
          Enter your details to be a{"\n"}part of our lucky draw
        </Text>
      </View>

      {/* Info */}
      <View style={{ backgroundColor: "#F5F5F5", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Title: </Text>
          {luckyDraw?.title}
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Date: </Text>
          {luckyDraw?.date}
        </Text>
      </View>

      {/* Form */}
      <Input
        label="Name"
        placeholder="Write your name here"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 12 }}
      />
      <Input
        label="City"
        placeholder="What is your city?"
        value={city}
        onChangeText={setCity}
        style={{ marginBottom: 12 }}
      />
      <Input
        label="Phone Number"
        placeholder="What is the best number to contact you?"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ marginBottom: 20 }}
      />

      <Button
        onPress={handleSubmit}
        disabled={submitting}
        style={{
          borderRadius: 8,
          backgroundColor: "linear-gradient(90deg, #FF512F 0%, #F09819 100%)",
        }}
        appearance="filled"
      >
        Submit
      </Button>
    </Layout>
  );
}
