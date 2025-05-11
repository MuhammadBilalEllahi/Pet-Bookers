import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, Card, Layout, Spinner } from "@ui-kitten/components";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { axiosBuyerClient } from "../../../utils/axiosClient";
import { selectLuckyDraws, loadLuckyDraws } from "../../../store/buyersHome";
import LinearGradient from "react-native-linear-gradient";

// Dummy data for testing
const dummyLuckyDraws = [
  {
    id: 1,
    title: "Summer Pet Fashion Show",
    date: "2024-03-15",
    description: "Win amazing prizes for your pet's style!",
    prize: "Premium Pet Fashion Kit"
  },
  {
    id: 2,
    title: "Pet Talent Competition",
    date: "2024-03-20",
    description: "Showcase your pet's unique talents",
    prize: "Professional Pet Training Package"
  },
  {
    id: 3,
    title: "Pet Photo Contest",
    date: "2024-03-25",
    description: "Share your best pet moments",
    prize: "Professional Pet Photography Session"
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F7FA"
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 4
  },
  headerText: {
    fontWeight: "bold",
    color: "#2C3E50",
    fontSize: 24
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: "#FFFFFF"
  },
  cardContent: {
    padding: 16
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
    color: "#2C3E50"
  },
  date: {
    color: "#7F8C8D",
    marginBottom: 8,
    fontSize: 14
  },
  description: {
    color: "#34495E",
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20
  },
  prizeContainer: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  prizeLabel: {
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 4
  },
  prizeText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500"
  },
  applyButton: {
    borderRadius: 12,
    backgroundColor: '#FF512F',
    shadowColor: '#FF512F',
    borderWidth: 0
  },
  emptyText: {
    textAlign: "center",
    color: "#7F8C8D",
    fontSize: 16,
    marginTop: 32
  },
  gradientButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    width: '100%',
    alignSelf: 'stretch',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default function LuckyDrawListScreen() {
  const dispatch = useDispatch();
  const { luckyDraws, luckyDrawsLoading, luckyDrawsError } = useSelector(selectLuckyDraws);
  const navigation = useNavigation();

  useEffect(() => {
    // Comment out the actual API call for now
    // dispatch(loadLuckyDraws());
  }, [dispatch]);

  // Use dummy data instead of loading state
  const displayLuckyDraws = dummyLuckyDraws;

  return (
    <Layout style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Lucky Draw</Text>
      </View>
      <FlatList
        data={displayLuckyDraws}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyExtractor={item => item.id?.toString() || item.title}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>📅 {item.date}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.prizeContainer}>
                <Text style={styles.prizeLabel}>PRIZE</Text>
                <Text style={styles.prizeText}>{item.prize}</Text>
              </View>
              <TouchableOpacity
                style={styles.gradientButton}
                onPress={() => navigation.navigate("LuckyDrawInstance", { luckyDraw: item })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF512F", "#F09819"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: '100%' }}
                >
                  <Text style={styles.buttonText}>
                    Apply Now
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No lucky draws available at the moment.</Text>
        }
      />
    </Layout>
  );
}
