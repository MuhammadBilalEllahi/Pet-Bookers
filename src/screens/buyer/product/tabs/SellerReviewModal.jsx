import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text, Icon, Input, Button } from '@ui-kitten/components';
import { StarRating } from '../../../../components/StarRating';

const SellerReviewModal = ({
  sellerReviewModal,
  closeSellerReviewModal,
  sellerReviewRating,
  setSellerReviewRating,
  sellerReviewText,
  setSellerReviewText,
  handleSubmitSellerReview,
  theme,
  isDark,
}) => {
  return (
    <Modal
      visible={sellerReviewModal.visible}
      transparent
      animationType="slide"
      onRequestClose={closeSellerReviewModal}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'], borderRadius: 12, padding: 20, width: '90%', maxWidth: 400, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text category="h6" style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              Rate This Seller
            </Text>
            <TouchableOpacity onPress={closeSellerReviewModal} style={{ padding: 4 }}>
              <Icon name="close" width={24} height={24} fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, padding: 12, backgroundColor: '#FFF3CD', borderRadius: 8 }}>
            <Icon name="star-outline" width={24} height={24} fill={theme['color-warning-500']} />
            <Text category="s1" style={{ marginLeft: 8, fontWeight: '500', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              How was your experience with {sellerReviewModal.sellerName}?
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text category="s1" style={{ marginBottom: 10, textAlign: 'center', color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }}>
              Rate this seller:
            </Text>
            <StarRating
              rating={sellerReviewRating}
              onRatingChange={setSellerReviewRating}
              size={32}
              activeColor={theme['color-warning-500']}
            />
            <Text category="c1" style={{ marginTop: 8, color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }}>
              {sellerReviewRating} out of 5 stars
            </Text>
          </View>

          <Input
            label="Review Comment"
            placeholder="Share your experience with this seller..."
            value={sellerReviewText}
            onChangeText={setSellerReviewText}
            multiline
            textStyle={{ minHeight: 80 }}
            style={{ marginBottom: 20 }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Button
              appearance="outline"
              onPress={closeSellerReviewModal}
              style={{ flex: 1, borderColor: '#E0E0E0' }}
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmitSellerReview}
              style={{ flex: 1, backgroundColor: theme['color-warning-500'] }}
            >
              Submit Review
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SellerReviewModal;

