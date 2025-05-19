import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, Card, Layout, Spinner } from "@ui-kitten/components";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { axiosBuyerClient } from "../../../utils/axiosClient";
import { selectLuckyDraws, loadLuckyDraws } from "../../../store/buyersHome";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";

// Dummy data for testing


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
    padding: 15
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
    dispatch(loadLuckyDraws());
  }, [dispatch]);

  // Use dummy data instead of loading state
const displayLuckyDraws = Array.isArray(luckyDraws) ? luckyDraws : luckyDraws?.event ? [luckyDraws.event] : [];

if(luckyDrawsLoading){
  return <View style={{padding: 15}}>
  {[0,1,2].map((_, index) => (
    <ShimmerCard key={index} />
  ))}
  </View>
}
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
              <Text style={styles.date}> {new Date(item.updated_at).toDateString()}</Text>
              <Text style={styles.description}>{item.description}</Text>
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


const ShimmerCard = () => (
  <Card style={styles.card}>
    <View style={styles.cardContent}>
      <ShimmerPlaceholder
        style={{ height: 20, width: '60%', marginBottom: 12, borderRadius: 8 }}
        LinearGradient={LinearGradient}
      />
      <ShimmerPlaceholder
        style={{ height: 14, width: '40%', marginBottom: 8, borderRadius: 6 }}
        LinearGradient={LinearGradient}
      />
      <ShimmerPlaceholder
        style={{ height: 60, width: '100%', marginBottom: 12, borderRadius: 6 }}
        LinearGradient={LinearGradient}
      />
      <ShimmerPlaceholder
        style={{ height: 44, width: '100%', borderRadius: 12 }}
        LinearGradient={LinearGradient}
      />
    </View>
  </Card>
);