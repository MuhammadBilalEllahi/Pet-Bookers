import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Spinner,
  Avatar,
} from '@ui-kitten/components';

import { useTheme } from '../../../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getShopProductReviews } from '../../../../../services/sellerApi';
import { ThemedIcon } from '../../../../../components/Icon';

export default function ReviewsPage({ navigation }) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getShopProductReviews({ limit: 10, offset: (page - 1) * 10 });
      if (page === 1) {
        setReviews(response.data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(response.data.reviews || [])]);
      }
      setTotalReviews(response.data.total_size || 0);
      setHasMore(response.data.reviews && response.data.reviews.length === 10);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to fetch reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchReviews(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchReviews(currentPage + 1);
    }
  };

  const getRatingStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <ThemedIcon
        key={star}
        name={star <= rating ? "star" : "star-outline"}
        iconStyle={{ width: 16, height: 16, color: '#ffd700' }}
      />
    ));
  };

  return (
    <Layout style={[ {height: '100%', backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'] }]}> 
      <View style={styles.modalHeader}>
        <Button appearance="ghost" size="small" onPress={() => navigation.goBack()}>
          ← Back
        </Button>
        <Text style={[styles.modalTitle, { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }]}> 
          Product Reviews ({totalReviews})
        </Text>
      </View>

      <ScrollView 
        style={styles.reviewsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Avatar
                  source={{ uri: review.customer?.image }}
                  style={styles.reviewAvatar}
                />
                <View style={styles.reviewInfo}>
                  <Text style={[styles.reviewerName, { 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }]}> {review.customer?.f_name} {review.customer?.l_name} </Text>
                 <Text style={[styles.productName, { color: theme['color-shadcn-primary'] }]}> {review.product?.name} </Text>
                  <Text style={[styles.reviewDate, { 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }]}> {new Date(review.created_at).toLocaleDateString()} </Text>
                  <View style={styles.ratingContainer}>
                    {getRatingStars(review.rating)}
                    <Text style={[styles.ratingText, { 
                      color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                    }]}> ({review.rating}/5) </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.reviewComment, { 
                color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
              }]}> {review.comment} </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedIcon name="star-outline" iconStyle={{ width: 48, height: 48 }} />
            <Text style={[styles.emptyText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}> No reviews found </Text>
            <Text style={[styles.emptySubtext, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}> No product reviews yet </Text>
          </View>
        )}
        {loading && reviews.length > 0 && (
          <View style={styles.loadingMore}>
            <Spinner size='small' />
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonRow}>
        <Button
          appearance="outline"
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        > Close </Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  reviewsList: {
    flex: 1,
    marginBottom: 16,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    minWidth: 100,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
}); 