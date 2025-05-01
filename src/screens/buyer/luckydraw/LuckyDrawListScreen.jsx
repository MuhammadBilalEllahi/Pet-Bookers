import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, Card, Layout, Spinner } from "@ui-kitten/components";
import { View, FlatList } from "react-native";
import { axiosBuyerClient } from "../../../utils/axiosClient";
import { selectLuckyDraws, loadLuckyDraws } from "../../../store/buyersHome";

export default function LuckyDrawListScreen() {
  const dispatch = useDispatch();
  const { luckyDraws, luckyDrawsLoading, luckyDrawsError } = useSelector(selectLuckyDraws);
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(loadLuckyDraws());
  }, [dispatch]);

  if (luckyDrawsLoading) {
    return (
      <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <Text category="h5" style={{ fontWeight: "bold", marginBottom: 16 }}>
        Lucky Draw
      </Text>
      <FlatList
        data={luckyDraws}
        keyExtractor={item => item.id?.toString() || item.title}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 16, borderRadius: 12 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 4 }}>
              {item.title}
            </Text>
            <Text style={{ color: "#888", marginBottom: 12 }}>
              Date: {item.date}
            </Text>
            <Button
              style={{
                borderRadius: 8,
                backgroundColor: "linear-gradient(90deg, #FF512F 0%, #F09819 100%)",
              }}
              onPress={() => navigation.navigate("LuckyDrawInstance", { luckyDraw: item })}
              appearance="filled"
            >
              Apply
            </Button>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888" }}>No lucky draws found.</Text>
        }
      />
    </Layout>
  );
}
