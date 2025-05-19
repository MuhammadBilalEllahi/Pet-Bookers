import React, { useState } from "react";
import { Input, Button, Text, Layout, Icon } from "@ui-kitten/components";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from 'react-native-linear-gradient';
import { axiosBuyerClient } from "../../../utils/axiosClient";
import CustomAlert from "./CustomAlert";

// Dummy data for testing
// const dummyLuckyDraw = {
//   id: 1,
//   title: "Shahzaib New Farm Lucky Draw",
//   date: "15 April"
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 0
  },
  headerText: {
    fontWeight: "bold",
    color: "#444",
    fontSize: 18
  },
  closeIcon: {
    width: 28,
    height: 28,
    marginRight: 8
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12
  },
  iconImage: {
    width: 60,
    height: 60,
    marginBottom: 8
  },
  welcomeText: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    color: "#222",
    marginBottom: 18
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 24
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 2
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15
  },
  infoValue: {
    color: '#222',
    fontSize: 15
  },
  form: {
    marginHorizontal: 24
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15
  },
  gradientButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12
  }
});

export default function LuckyDrawInstance() {
  const navigation = useNavigation();
  const {luckyDraw} = useRoute()?.params;
  console.log("Lucky Draw Data: ", luckyDraw);

  

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [luckyNumber, setLuckyNumber] = useState(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axiosBuyerClient.post("luckydraw/submit", {
      event_id: luckyDraw.id,  // <-- From route param
      name,
      city,
      phone
    });
    const luckyNumber = response?.data?.lucky_no;
    setLuckyNumber(luckyNumber);
    setShowAlert(true);
    //   Alert.alert(
    //   "Lucky Draw Submitted",
    //   `🎉 Your lucky draw number is: ${luckyNumber}`,
    //   [{ text: "OK" }]
    // );

    CustomAlert({
      visible: true,
      luckyNumber: luckyNumber,
      onClose: () => {
        setSubmitting(false);
        navigation.goBack();
      }
    })

    console.log("Lucky Draw Submission Response: ", response);
    } catch (error) {
      console.error("Error submitting lucky draw: ", error, error?.response);
    }
    setSubmitting(false);
    // navigation.goBack();
  };

  return (
    <Layout style={styles.container}>

       
    
      {/* Header */}
      <View style={styles.header}>
        <Icon
          name="close-outline"
          fill="#888"
          style={styles.closeIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerText}>Lucky Draw</Text>
      </View>

      {/* Icon and Welcome */}
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../../assets/new/bottom_nav/lucky_draw.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>
          Enter your details to be a{"\n"}part of our lucky draw
        </Text>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Title: </Text>
          <Text style={styles.infoValue}>{luckyDraw.title}</Text>
        </View>
         <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Description: </Text>
          <Text style={styles.infoValue}>{luckyDraw.description}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date: </Text>
          <Text style={styles.infoValue}>{new Date(luckyDraw.updated_at).toDateString()}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Name"
          placeholder="Write your name here"
          value={name}
          onChangeText={setName}
          style={styles.input}
          size="large"
        />
        <Input
          label="City"
          placeholder="What is your city?"
          value={city}
          onChangeText={setCity}
          style={styles.input}
          size="large"
        />
        <Input
          label="Phone Number"
          placeholder="What is the best number to contact you?"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          size="large"
        />
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF512F", "#F09819"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Submitting..." : "Submit"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* <Button title="Submit Lucky Draw" onPress={() => setShowAlert(true)} /> */}
      <CustomAlert
        visible={showAlert}
        luckyNumber={luckyNumber}
        onClose={() => setShowAlert(false)}
      />
    </View>

    </Layout>
  );
}
