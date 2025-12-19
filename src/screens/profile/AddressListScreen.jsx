import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Button,
  Layout,
  Text,
  Card,
  Icon,
  List,
  ListItem,
} from '@ui-kitten/components';
import {spacingStyles} from '../../utils/globalStyles';
import {axiosBuyerClient} from '../../utils/axiosClient';
import {useTheme} from '../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';
import Svg, {Path} from 'react-native-svg';


const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

const EditIcon = ({color = '#000', size = 20, style}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M21.4549 5.41575C21.6471 5.70687 21.615 6.10248 21.3588 6.35876L12.1664 15.5511C12.0721 15.6454 11.9545 15.7128 11.8256 15.7465L7.99716 16.7465C7.87229 16.7791 7.74358 16.7784 7.62265 16.7476C7.49408 16.7149 7.37431 16.6482 7.27729 16.5511C7.08902 16.3629 7.01468 16.0889 7.08197 15.8313L8.08197 12.0028C8.11144 11.89 8.16673 11.7786 8.24322 11.6912L17.4697 2.46967C17.5504 2.38891 17.6477 2.32846 17.7536 2.29163C17.8321 2.26432 17.9153 2.25 18 2.25C18.1989 2.25 18.3897 2.32902 18.5303 2.46967L21.3588 5.2981C21.3954 5.33471 21.4274 5.37416 21.4549 5.41575ZM19.7678 5.82843L18 4.06066L9.48184 12.5788L8.85685 14.9716L11.2496 14.3466L19.7678 5.82843Z"
      fill={color}
    />
    <Path
      d="M19.6414 17.1603C19.9148 14.8227 20.0018 12.4688 19.9023 10.1208C19.8976 10.0084 19.9399 9.89898 20.0194 9.81942L21.0027 8.83609C21.1236 8.71519 21.3302 8.79194 21.3415 8.96254C21.5265 11.7522 21.4563 14.5545 21.1312 17.3346C20.8946 19.3571 19.2703 20.9421 17.2583 21.167C13.7917 21.5544 10.2083 21.5544 6.74177 21.167C4.72971 20.9421 3.10538 19.3571 2.86883 17.3346C2.45429 13.7903 2.45429 10.2097 2.86883 6.66543C3.10538 4.6429 4.72971 3.05789 6.74177 2.83301C9.37152 2.5391 12.0685 2.46815 14.7306 2.62016C14.9022 2.62996 14.9804 2.83757 14.8589 2.95909L13.8664 3.95165C13.7877 4.03034 13.6798 4.07261 13.5685 4.06885C11.3421 3.99376 9.10055 4.07872 6.90838 4.32373C5.57827 4.47239 4.51278 5.522 4.35867 6.83968C3.95767 10.2682 3.95767 13.7318 4.35867 17.1603C4.51278 18.478 5.57827 19.5276 6.90838 19.6763C10.2642 20.0513 13.7358 20.0513 17.0916 19.6763C18.4218 19.5276 19.4872 18.478 19.6414 17.1603Z"
      fill={color}
    />
  </Svg>
);

const DeleteIcon = ({color = '#000', size = 20, style}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}>
    <Path
      d="M21 6H3C2.44772 6 2 6.44772 2 7C2 7.55228 2.44772 8 3 8H4V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8H21C21.5523 8 22 7.55228 22 7C22 6.44772 21.5523 6 21 6Z"
      fill={color}
    />
    <Path
      d="M9 10C9.55228 10 10 10.4477 10 11V17C10 17.5523 9.55228 18 9 18C8.44772 18 8 17.5523 8 17V11C8 10.4477 8.44772 10 9 10Z"
      fill={color}
    />
    <Path
      d="M15 10C15.5523 10 16 10.4477 16 11V17C16 17.5523 15.5523 18 15 18C14.4477 18 14 17.5523 14 17V11C14 10.4477 14.4477 10 15 10Z"
      fill={color}
    />
    <Path
      d="M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V6H8V5Z"
      fill={color}
    />
  </Svg>
);

export const AddressListScreen = ({navigation}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosBuyerClient.get('customer/address/list');
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Load addresses error:', error);
      Toast.show({
        type: 'error',
        text1: t('addressListScreen.alerts.loadFailedTitle'),
        text2:
          error.response?.data?.message ||
          t('addressListScreen.alerts.loadFailedMessage'),
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAddresses();
    setRefreshing(false);
  };

  const handleDeleteAddress = addressId => {
    Alert.alert(
      t('addressListScreen.alerts.deleteTitle'),
      t('addressListScreen.alerts.deleteMessage'),
      [
        {
          text: t('addressListScreen.alerts.cancel'),
          style: 'cancel',
        },
        {
          text: t('addressListScreen.alerts.delete'),
          style: 'destructive',
          onPress: () => confirmDeleteAddress(addressId),
        },
      ],
    );
  };

  const confirmDeleteAddress = async addressId => {
    try {
      setDeletingId(addressId);

      const submitData = {address_id: addressId};

      const response = await axiosBuyerClient.delete(
        'customer/address/',
        submitData,
      );

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('addressListScreen.alerts.deleteSuccessTitle'),
          text2:
            response.data.message ||
            t('addressListScreen.alerts.deleteSuccessMessage'),
          position: 'top',
        });

        // Remove from local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      }
    } catch (error) {
      console.error('Delete address error:', error);
      Toast.show({
        type: 'error',
        text1: t('addressListScreen.alerts.deleteFailedTitle'),
        text2:
          error.response?.data?.message ||
          t('addressListScreen.alerts.deleteFailedMessage'),
        position: 'top',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const navigateToAddAddress = () => {
    navigation.navigate('AddAddress', {
      onAddressAdded: loadAddresses,
    });
  };

  const navigateToEditAddress = address => {
    navigation.navigate('EditAddress', {
      address,
      onAddressUpdated: loadAddresses,
    });
  };

  const renderAddressItem = ({item}) => {
    const isDeleting = deletingId === item.id;

    return (
      <Layout
        style={[
          styles.addressCard,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-300'],
          },
        ]}
        level="1">
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeContainer}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-muted']
                    : theme['color-basic-200'],
                },
              ]}>
              <Icon
                name={
                  item.address_type === 'home'
                    ? 'home-outline'
                    : 'briefcase-outline'
                }
                style={[
                  styles.addressTypeIcon,
                  {
                    tintColor: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-700'],
                  },
                ]}
              />
            </View>
            <View style={styles.addressInfo}>
              <Text
                category="h6"
                style={[
                  styles.addressType,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {item.address_type === 'home'
                  ? t('addressListScreen.addressTypes.home')
                  : t('addressListScreen.addressTypes.office')}
              </Text>
              {item.is_billing === '1' && (
                <View style={styles.billingBadge}>
                  <Text category="c2" style={styles.billingText}>
                    {t('addressListScreen.addressTypes.billing')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actionButtons}>
            <Button
              appearance="ghost"
              status="primary"
              size="small"
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  marginRight: 8,
                },
              ]}
              accessoryLeft={props => (
                <EditIcon
                  size={20}
                  color={
                    isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-700']
                  }
                  style={props?.style}
                />
              )}
              onPress={() => navigateToEditAddress(item)}
              disabled={isDeleting}
            />
            <Button
              appearance="ghost"
              status="danger"
              size="small"
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(239, 68, 68, 0.05)',
                },
              ]}
              accessoryLeft={props => (
                <DeleteIcon
                  size={20}
                  color={theme['color-danger-500']}
                  style={props?.style}
                />
              )}
              onPress={() => handleDeleteAddress(item.id)}
              disabled={isDeleting}
            />
          </View>
        </View>

        <View style={styles.addressDetails}>
          <Text
            category="s1"
            style={[
              styles.contactName,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {item.contact_person_name}
          </Text>
          <Text
            category="p2"
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {item.address}
          </Text>
          <Text
            category="p2"
            style={[
              styles.addressText,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {item.city}, {item.zip}, {item.country}
          </Text>
          <Text
            category="p2"
            style={[
              styles.phoneText,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-700'],
              },
            ]}>
            {item.phone}
          </Text>
        </View>
      </Layout>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-muted']
              : theme['color-basic-200'],
          },
        ]}>
        <Icon
          name="map-outline"
          style={[
            styles.emptyIcon,
            {
              tintColor: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-500'],
            },
          ]}
        />
      </View>
      <Text
        category="h6"
        style={[
          styles.emptyTitle,
          {
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
          },
        ]}>
        {t('addressListScreen.emptyState.title')}
      </Text>
      <Text
        category="p2"
        style={[
          styles.emptyText,
          {
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          },
        ]}>
        {t('addressListScreen.emptyState.message')}
      </Text>
      <Button
        style={[
          styles.emptyButton,
          {
            backgroundColor: theme['color-primary-500'],
          },
        ]}
        onPress={navigateToAddAddress}>
        {t('addressListScreen.emptyState.addButton')}
      </Button>
    </View>
  );

  if (loading) {
    return (
      <Layout
        level="1"
        style={[
          styles.loadingContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <Text
          style={[
            styles.loadingText,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('addressListScreen.loading')}
        </Text>
      </Layout>
    );
  }

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <Layout
        style={[
          styles.header,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}
        level="1">
        <Text
          category="h5"
          style={[
            styles.headerTitle,
            {
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {t('addressListScreen.title')}
        </Text>
        <Text
          category="p2"
          style={[
            styles.subtitle,
            {
              color: isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600'],
            },
          ]}>
          {t('addressListScreen.subtitle')}
        </Text>
      </Layout>

      <Button
        style={[
          styles.addButton,
          {
            backgroundColor: theme['color-primary-500'],
            borderColor: theme['color-primary-500'],
          },
        ]}
        accessoryLeft={props => (
          <Icon
            {...props}
            name="plus-outline"
            style={{tintColor: theme['color-basic-100']}}
          />
        )}
        onPress={navigateToAddAddress}>
        {evaProps => (
          <Text
            {...evaProps}
            style={[
              evaProps.style,
              {color: theme['color-basic-100'], fontWeight: '600'},
            ]}>
            {t('addressListScreen.addNewAddress')}
          </Text>
        )}
      </Button>
    </View>
  );

  if (addresses.length === 0 && !loading) {
    return (
      <Layout
        level="1"
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        {renderListHeader()}
        <EmptyState />
      </Layout>
    );
  }

  return (
    <Layout
      level="1"
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      <List
        data={addresses}
        renderItem={renderAddressItem}
        ListHeaderComponent={renderListHeader}
        style={[
          styles.addressList,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={
              isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900']
            }
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    
    minHeight: windowHeight,
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButton: {
    marginBottom: 24,
    borderRadius: 12,
    paddingVertical: 16,
    elevation: 0,
    shadowOpacity: 0,
    height: 56, // Fixed height to prevent expansion
    marginHorizontal: 0,
  },
  addressList: {
    backgroundColor: 'transparent',
  },
  addressCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressTypeIcon: {
    width: 20,
    height: 20,
  },
  addressInfo: {
    flex: 1,
  },
  addressType: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  billingBadge: {
    backgroundColor: '#FF6D1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  billingText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressDetails: {
    paddingTop: 8,
  },
  contactName: {
    fontWeight: '600',
    fontSize: 16,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    width: 40,
    height: 40,
  },
  emptyTitle: {
    marginBottom: 12,
    fontWeight: '600',
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
});
