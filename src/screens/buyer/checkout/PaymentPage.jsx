import React, {useState} from 'react';
import {View, StyleSheet, TextInput, ScrollView} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';

export default function PaymentPage({navigation}) {
  const {t} = useTranslation();
  const [account, setAccount] = useState('');
  const [coupon, setCoupon] = useState('');
  const subtotal = 2;
  const tax = 0;
  const shippingPrice = 500;
  const discount = 0;
  const total = subtotal + tax + shippingPrice - discount;

  // const handleConfirmPayment = () => {
  //   if(COD){
  //     axiosBuyerClient.post('order/place', {
  //   }
  //   // Navigate to confirmation or home
  //   // navigation.navigate(AppScreens.ORDER_CONFIRMATION);
  // };

  return (
    <ScrollView>
      <Layout style={styles.container}>
        {/* Title */}
        <Text style={styles.header}>{t('common.choosePayment')}</Text>

        {/* Progress Bar */}
        <View style={styles.progressRow}>
          <View style={styles.progressStepActive}>
            <Icon
              name="person-outline"
              fill="#43a047"
              style={styles.progressIcon}
            />
          </View>
          <View style={styles.progressLineActive} />
          <View style={styles.progressStepActive}>
            <Icon
              name="shopping-bag-outline"
              fill="#43a047"
              style={styles.progressIcon}
            />
          </View>
          <View style={styles.progressLineActive} />
          <View style={styles.progressStepActive}>
            <Icon
              name="credit-card-outline"
              fill="#43a047"
              style={styles.progressIcon}
            />
          </View>
        </View>

        {/* Payment Input */}
        <TextInput
          style={styles.paymentInput}
          placeholder={t('common.pleaseEnterEasyPaisaAccountNumber')}
          value={account}
          onChangeText={setAccount}
          keyboardType="number-pad"
        />
        <Button style={styles.confirmBtn} onPress={handleConfirmPayment}>
          Confirm Payment
        </Button>

        {/* Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('common.subTotal')}</Text>
            <Text style={styles.summaryValue}>Rs {subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('common.tax')}</Text>
            <Text style={styles.summaryValue}>Rs {tax}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('common.shipping')}</Text>
            <Text style={styles.summaryValue}>Rs {shippingPrice}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('common.discountPromo')}</Text>
            <Text style={styles.summaryValue}>- Rs {discount}</Text>
          </View>
          <TextInput
            style={styles.couponInput}
            placeholder={t('common.couponCode')}
            value={coupon}
            onChangeText={setCoupon}
          />
          <Button style={styles.couponBtn}>{t('common.applyCode')}</Button>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {fontWeight: 'bold'}]}>
              {t('common.total')}
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {fontWeight: 'bold', color: '#388e3c'},
              ]}>
              Rs {total}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Icon name="car-outline" fill="#222" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              {t('common.threeDaysFreeDelivery')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon name="award-outline" fill="#222" style={styles.featureIcon} />
            <Text style={styles.featureText}>
              {t('common.hundredPercentOriginalProducts')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="credit-card-outline"
              fill="#222"
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>
              {t('common.moneyBackGuarantee')}
            </Text>
          </View>
          <View style={styles.feature}>
            <Icon
              name="shield-outline"
              fill="#222"
              style={styles.featureIcon}
            />
            <Text style={styles.featureText}>{t('common.safePayments')}</Text>
          </View>
        </View>
      </Layout>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  header: {fontWeight: 'bold', fontSize: 22, marginBottom: 8},
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    justifyContent: 'center',
  },
  progressStepActive: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#43a047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIcon: {width: 22, height: 22},
  progressLineActive: {width: 40, height: 4, backgroundColor: '#43a047'},
  paymentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  confirmBtn: {
    backgroundColor: '#43a047',
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 0,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {fontSize: 15, fontWeight: 'bold'},
  summaryValue: {fontSize: 15},
  couponInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    fontSize: 15,
    marginBottom: 8,
    marginTop: 8,
  },
  couponBtn: {
    borderRadius: 4,
    backgroundColor: '#43a047',
    borderWidth: 0,
    marginBottom: 8,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  feature: {alignItems: 'center', width: '48%', marginBottom: 8},
  featureIcon: {width: 28, height: 28, marginBottom: 4},
  featureText: {fontSize: 12, textAlign: 'center'},
});
