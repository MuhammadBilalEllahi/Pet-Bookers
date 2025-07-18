import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text, Icon, Input, Button } from '@ui-kitten/components';
import { StarRating } from '../../../../components/StarRating';

const ReviewModal = ({
  reviewModal,
  closeReviewModal,
  reviewRating,
  setReviewRating,
  reviewText,
  setReviewText,
  handleSubmitReview,
  theme,
  isDark,
}) => {
  return (
    <Modal
      visible={reviewModal.visible}
      transparent
      animationType="slide"
      onRequestClose={closeReviewModal}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'], borderRadius: 12, padding: 20, width: '90%', maxWidth: 400, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text category="h6" style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              Rate Your Delivery Experience
            </Text>
            <TouchableOpacity onPress={closeReviewModal} style={{ padding: 4 }}>
              <Icon name="close" width={24} height={24} fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 12, backgroundColor: '#F0F8FF', borderRadius: 8 }}>
            <Icon name="person-outline" width={24} height={24} fill={theme['color-primary-500']} />
            <Text category="s1" style={{ marginLeft: 8, fontWeight: '500', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              How was your delivery experience?
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text category="s1" style={{ marginBottom: 10, textAlign: 'center', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              Rate your delivery experience:
            </Text>
            <StarRating
              rating={reviewRating}
              onRatingChange={setReviewRating}
              size={32}
              activeColor={theme['color-primary-500']}
            />
            <Text category="c1" style={{ marginTop: 8, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }}>
              {reviewRating} out of 5 stars
            </Text>
          </View>

          <Input
            label="Review Comment"
            placeholder="Share your delivery experience..."
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            textStyle={{ minHeight: 80 }}
            style={{ marginBottom: 20 }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Button
              appearance="outline"
              onPress={closeReviewModal}
              style={{ flex: 1, borderColor: '#E0E0E0' }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmitReview}
              style={{ flex: 1, backgroundColor: '#007AFF' }}
            >
              Submit Review
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewModal; 