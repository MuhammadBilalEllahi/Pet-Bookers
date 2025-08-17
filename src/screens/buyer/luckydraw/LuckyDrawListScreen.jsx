import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Button, Text, Card, Layout, Spinner } from "@ui-kitten/components";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { axiosBuyerClient } from "../../../utils/axiosClient";
import { selectLuckyDraws, loadLuckyDraws } from "../../../store/buyersHome";
import LinearGradient from "react-native-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { useTheme } from "../../../theme/ThemeContext";

// Dummy data for testing


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 4
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 24
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardContent: {
    padding: 15
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8
  },
  date: {
    marginBottom: 8,
    fontSize: 14
  },
  description: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20
  },
  prizeContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  prizeLabel: {
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 4
  },
  prizeText: {
    fontSize: 14,
    fontWeight: "500"
  },
  applyButton: {
    borderRadius: 12,
    borderWidth: 0
  },
  emptyText: {
    textAlign: "center",
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
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const { luckyDraws, luckyDrawsLoading, luckyDrawsError } = useSelector(selectLuckyDraws);
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    dispatch(loadLuckyDraws());
  }, [dispatch]);

  const displayLuckyDraws = Array.isArray(luckyDraws) ? luckyDraws : luckyDraws?.event ? [luckyDraws.event] : [];

  if(luckyDrawsLoading) {
    return (
      <View style={[styles.container, { 
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
      }]}>
        {[0,1,2].map((_, index) => (
          <ShimmerCard key={index} />
        ))}
      </View>
    );
  }

  return (
    <Layout style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { 
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>{t('luckyDrawListScreen.title')}</Text>
      </View>
      <FlatList
        data={displayLuckyDraws}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyExtractor={item => item.id?.toString() || item.title}
        renderItem={({ item }) => (
          <Card style={[styles.card, { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
          }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.title, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}>{item.title}</Text>
              <Text style={[styles.date, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}> {new Date(item.updated_at).toDateString()}</Text>
              <Text style={[styles.description, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>{item.description}</Text>
              <TouchableOpacity
                style={styles.gradientButton}
                onPress={() => navigation.navigate("LuckyDrawInstance", { luckyDraw: item })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme['color-shadcn-primary'], theme['color-primary-400']]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: '100%' }}
                >
                  <Text style={styles.buttonText}>
                    {t('luckyDrawListScreen.applyNow')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>{t('luckyDrawListScreen.noLuckyDraws')}</Text>
        }
      />
    </Layout>
  );
}

const ShimmerCard = () => {
  const { theme, isDark } = useTheme();
  const shimmerColors = isDark 
    ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
    : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']];

  return (
    <Card style={[styles.card, { 
      backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
      shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
    }]}>
      <View style={styles.cardContent}>
        <ShimmerPlaceholder
          style={{ height: 20, width: '60%', marginBottom: 12, borderRadius: 8 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={{ height: 14, width: '40%', marginBottom: 8, borderRadius: 6 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={{ height: 60, width: '100%', marginBottom: 12, borderRadius: 6 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
        <ShimmerPlaceholder
          style={{ height: 44, width: '100%', borderRadius: 12 }}
          LinearGradient={LinearGradient}
          shimmerColors={shimmerColors}
        />
      </View>
    </Card>
  );
};