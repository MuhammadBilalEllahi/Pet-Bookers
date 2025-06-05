import React, { useState } from "react";
import { Input, Button, Text, Layout, Icon } from "@ui-kitten/components";
import { View, Image, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from 'react-native-linear-gradient';
import { axiosBuyerClient } from "../../../utils/axiosClient";
import CustomAlert from "./CustomAlert";
import { useTheme } from "../../../theme/ThemeContext";

// Dummy data for testing
// const dummyLuckyDraw = {
//   id: 1,
//   title: "Shahzaib New Farm Lucky Draw",
//   date: "15 April"
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 0
  },
  headerText: {
    fontWeight: "bold",
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
    marginBottom: 18
  },
  infoBox: {
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
    fontSize: 15
  },
  infoValue: {
    fontSize: 15
  },
  form: {
    marginHorizontal: 24
  },
  input: {
    marginBottom: 16,
    borderRadius: 4,
    borderWidth: 1,
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
  const { luckyDraw } = useRoute()?.params;
  const { theme, isDark } = useTheme();

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
        event_id: luckyDraw.id,
        name,
        city,
        phone
      });
      const luckyNumber = response?.data?.lucky_no;
      setLuckyNumber(luckyNumber);
      setShowAlert(true);

      CustomAlert({
        visible: true,
        luckyNumber: luckyNumber,
        onClose: () => {
          setSubmitting(false);
          navigation.goBack();
        }
      });

      console.log("Lucky Draw Submission Response: ", response);
    } catch (error) {
      console.error("Error submitting lucky draw: ", error, error?.response);
    }
    setSubmitting(false);
  };

  return (
    <Layout style={[styles.container, { backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'] }]}>
      {/* Header */}
      <View style={[styles.header, { 
        borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
      }]}>
        <Icon
          name="close-outline"
          fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          style={styles.closeIcon}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerText, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>Lucky Draw</Text>
      </View>

      {/* Icon and Welcome */}
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../../assets/new/bottom_nav/lucky_draw.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
        <Text style={[styles.welcomeText, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          Enter your details to be a{"\n"}part of our lucky draw
        </Text>
      </View>

      {/* Info Box */}
      <View style={[styles.infoBox, { 
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-200']
      }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Title: </Text>
          <Text style={[styles.infoValue, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>{luckyDraw.title}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Description: </Text>
          <Text style={[styles.infoValue, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>{luckyDraw.description}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>Date: </Text>
          <Text style={[styles.infoValue, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>{new Date(luckyDraw.updated_at).toDateString()}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Name"
          placeholder="Write your name here"
          value={name}
          onChangeText={setName}
          style={[styles.input, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}
          textStyle={{ 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }}
          placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          size="large"
        />
        <Input
          label="City"
          placeholder="What is your city?"
          value={city}
          onChangeText={setCity}
          style={[styles.input, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}
          textStyle={{ 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }}
          placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          size="large"
        />
        <Input
          label="Phone Number"
          placeholder="What is the best number to contact you?"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={[styles.input, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}
          textStyle={{ 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }}
          placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          size="large"
        />
        <TouchableOpacity
          style={styles.gradientButton}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme['color-shadcn-primary'], theme['color-primary-400']]}
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
        <CustomAlert
          visible={showAlert}
          luckyNumber={luckyNumber}
          onClose={() => setShowAlert(false)}
        />
      </View>
    </Layout>
  );
}
