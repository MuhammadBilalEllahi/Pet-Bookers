import React, {useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import {
  Layout,
  Text,
  Input,
  useTheme,
  Select,
  SelectItem,
  Spinner,
  Icon,
  Button,
} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Formik} from 'formik';
import {spacingStyles} from '../../../utils/globalStyles';
import {useSelector, useDispatch} from 'react-redux';
import {
  loadProductCategories,
  selectProductCategories,
} from '../../../store/productCategories';
import {
  selectIsSellerAuthenticated,
  selectSellerAuth,
} from '../../../store/user';
import {axiosSellerClient} from '../../../utils/axiosClient';
import {launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {useTheme as useThemeContext} from '../../../theme/ThemeContext';
import {AppScreens} from '../../../navigators/AppNavigator';
import FastImageWithFallback from '../../../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';

const requestGalleryPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles it via Info.plist
};

export const AddProductScreen = ({navigation}) => {
  const {t} = useTranslation();
  const {isDark, theme} = useThemeContext();
  const [langTab, setLangTab] = useState('en');
  const [isLiving, setIsLiving] = useState('Living');
  const [categoryIndex, setCategoryIndex] = useState(null);
  const [subcategoryIndex, setSubcategoryIndex] = useState(null);
  const [unitIndex, setUnitIndex] = useState(null);
  const [isLivingIndex, setIsLivingIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [isLivingModalVisible, setIsLivingModalVisible] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [fieldValue, setFieldValue] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [image, setImage] = useState(null);

  const units = [
    t('addProduct.units'),
    t('addProduct.kg'),
    t('addProduct.ltr'),
    t('addProduct.pc'),
  ];
  const livingOptions = [t('addProduct.living'), t('addProduct.nonLiving')];

  const dispatch = useDispatch();
  const {categories, categoriesLoading} = useSelector(selectProductCategories);

  // Authentication state
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const sellerAuth = useSelector(selectSellerAuth);

  // // console.log("categories", JSON.stringify(categories, null, 2));
  // console.log("AddProductScreen - isSellerAuthenticated:", isSellerAuthenticated);
  // console.log("AddProductScreen - sellerAuth:", sellerAuth);

  useEffect(() => {
    dispatch(loadProductCategories());
  }, [dispatch]);

  // Effect to monitor authentication state changes
  useEffect(() => {
    // console.log("AddProductScreen - Authentication state changed:", {
    //   isSellerAuthenticated,
    //   token: sellerAuth.token,
    //   timestamp: new Date().toISOString()
    // });

    if (isSellerAuthenticated) {
      // Re-load categories when authenticated to ensure fresh data
      dispatch(loadProductCategories());
    }
  }, [isSellerAuthenticated, sellerAuth.token, dispatch]);

  const categoryOptions = categories.map(cat => cat.name);
  const selectedCategory = categories[categoryIndex?.row];
  const subcategoryOptions =
    selectedCategory?.childes?.map(sub => sub.name) || [];
  const [images, setImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);

  const onProductPostedSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'AddProductSuccessAndShowFeaturedButton'}],
    });
  };

  const handleImagePick = async field => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: field === 'images' ? 5 : 1,
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      if (field === 'thumbnail') {
        setThumbnail(result.assets[0]);
      } else {
        setImages(result.assets);
      }
    }
  };

  const handleSubmit = values => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();
    if (images.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select at least one product image',
      });
      return;
    }

    formData.append('product_type', 'physical'); // or 'digital'
    formData.append('discount_type', 'flat'); // or 'percent'
    formData.append('discount', '0');
    formData.append('tax', '0');
    formData.append('tax_model', 'exclude');
    formData.append('code', Math.random().toString(36).substring(2, 10)); // random code

    // Language data
    formData.append('lang[]', 'en');
    formData.append('lang[]', 'ur');
    formData.append('name[]', values.name_en);
    formData.append('name[]', values.name_ur);
    formData.append('description[]', values.description_en);
    formData.append('description[]', values.description_ur);

    // Category and other fields
    formData.append('category_id', values.category_id);
    formData.append('sub_category_id', values.sub_category_id || '');
    formData.append('unit', values.unit);

    // Pricing
    formData.append('unit_price', values.unit_price);
    formData.append('purchase_price', values.unit_price); // same as unit_price if not specified
    formData.append('current_stock', values.current_stock);
    formData.append('minimum_order_qty', values.min_order_qty);

    // Handle images upload - CRITICAL FIX
    images.forEach((image, index) => {
      formData.append('images[]', {
        uri:
          Platform.OS === 'android'
            ? image.uri
            : image.uri.replace('file://', ''),
        name: image.fileName || `image_${Date.now()}_${index}.jpg`,
        type: image.type || 'image/jpeg',
      });
    });

    // Handle thumbnail upload
    if (thumbnail) {
      formData.append('thumbnail', {
        uri:
          Platform.OS === 'android'
            ? thumbnail.uri
            : thumbnail.uri.replace('file://', ''),
        name: thumbnail.fileName || `thumbnail_${Date.now()}.jpg`,
        type: thumbnail.type || 'image/jpeg',
      });
    }

    // Debug what's being sent
    // console.log('FormData contents:', [...formData._parts]);
    // Tags
    // formData.append('tags', JSON.stringify(tags));
    tags?.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag);
    });

    // Shipping (required for physical products)
    formData.append('shipping_cost', '0');

    console.info('SENDING');
    axiosSellerClient
      .post('products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.info('SUBMITED', response);
        if (response.status === 200) {
          setShowCongratsDialog(true);
          setIsSubmitting(false);
        }
      })
      .catch(error => {
        console.error(
          'Error:',
          error,
          JSON.stringify(error.response?.data, null, 4),
        );
        setIsSubmitting(false);
      });
  };

  const handleTagInput = text => {
    // If user types comma or presses space/enter, add tag
    if (text.endsWith(',') || text.endsWith(' ')) {
      const newTag = text.replace(/,| /g, '').trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else {
      setTagInput(text);
    }
  };

  const removeTag = index => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const renderModal = (
    visible,
    setVisible,
    title,
    options,
    selectedIndex,
    onSelect,
  ) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {title}
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Icon
                  name="close"
                  fill={
                    isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600']
                  }
                  style={{width: 24, height: 24}}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    selectedIndex === index && {
                      backgroundColor: isDark
                        ? theme['color-shadcn-secondary']
                        : theme['color-basic-200'],
                    },
                  ]}
                  onPress={() => {
                    onSelect(index);
                    setVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {option}
                  </Text>
                  {selectedIndex === index && (
                    <Icon
                      name="checkmark"
                      fill={theme['color-shadcn-primary']}
                      style={{width: 20, height: 20}}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const renderCongratsDialog = () => {
    return (
      <Modal
        visible={showCongratsDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCongratsDialog(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.congratsDialogContainer,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}>
            <View style={styles.congratsIconContainer}>
              <Icon
                name="checkmark-circle"
                fill={theme['color-shadcn-primary']}
                style={{width: 64, height: 64}}
              />
            </View>
            <Text
              style={[
                styles.congratsTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('addProduct.congratsTitle')}
            </Text>
            <Text
              style={[
                styles.congratsMessage,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('addProduct.congratsMessage')}
            </Text>

            {/* Image Slider */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageSlider}>
              {images.map((image, index) => (
                <View key={index} style={styles.sliderImageContainer}>
                  <FastImageWithFallback
                    priority={FastImage.priority.high}
                    resizeMode={FastImage.resizeMode.cover}
                    source={{uri: image.uri}}
                    fallbackSource={{
                      uri: 'https://via.placeholder.com/120x120?text=No+Image',
                    }}
                    style={styles.sliderImage}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.congratsButtons}>
              <TouchableOpacity
                style={[
                  styles.congratsButton,
                  styles.viewAdButton,
                  {
                    backgroundColor: theme['color-shadcn-primary'],
                  },
                ]}
                onPress={() => {
                  setShowCongratsDialog(false);
                  navigation.navigate(AppScreens.MY_POSTED_ADS);
                }}>
                <Text
                  style={[
                    styles.congratsButtonText,
                    {
                      color: theme['color-shadcn-primary-foreground'],
                    },
                  ]}>
                  {t('addProduct.viewAd')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.congratsButton,
                  styles.addAnotherButton,
                  {
                    backgroundColor: isDark
                      ? theme['color-shadcn-secondary']
                      : theme['color-basic-200'],
                  },
                ]}
                onPress={() => {
                  setShowCongratsDialog(false);
                  // Reset form
                  setCategoryIndex(null);
                  setSubcategoryIndex(null);
                  setUnitIndex(null);
                  setIsLivingIndex(0);
                  setImages([]);
                  setThumbnail(null);
                  setTags([]);
                  setTagInput('');
                }}>
                <Text
                  style={[
                    styles.congratsButtonText,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('addProduct.addAnother')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Show authentication required screen if not authenticated
  if (!isSellerAuthenticated) {
    return (
      <Layout
        level="3"
        style={{
          flex: 1,
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
        <Icon
          name="person-outline"
          fill={
            isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600']
          }
          style={{width: 64, height: 64, marginBottom: 16}}
        />
        <Text
          category="h5"
          style={{
            color: isDark
              ? theme['color-shadcn-foreground']
              : theme['color-basic-900'],
            textAlign: 'center',
            marginBottom: 8,
          }}>
          {t('auth.sellerAuthRequired', 'Seller Authentication Required')}
        </Text>
        <Text
          category="p1"
          style={{
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
            textAlign: 'center',
            marginBottom: 24,
          }}>
          {t(
            'auth.signInAsSellerToAddProducts',
            'Please sign in as a seller to add products to your store.',
          )}
        </Text>
        <Button
          onPress={() => navigation.goBack()}
          appearance="outline"
          style={{marginTop: 16}}>
          {t('common.goBack', 'Go Back')}
        </Button>
      </Layout>
    );
  }

  return (
    <Layout
      level="3"
      style={{
        flex: 1,
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
      }}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          // spacingStyles.px16,
          // spacingStyles.py8,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
            flexGrow: 1,
            justifyContent: 'flex-start',
          },
        ]}>
        <Layout
          level="1"
          style={[
            spacingStyles.px16,
            {
              flex: 1,
              backgroundColor: isDark
                ? theme['color-shadcn-background']
                : theme['color-basic-100'],
              marginBottom: 100,
            },
          ]}>
          <Text
            category="s1"
            style={[
              styles.sectionHeader,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {t('addProduct.generalInfo')}
          </Text>
          <Formik
            initialValues={{
              category_id: '',
              sub_category_id: '',
              unit: '',

              is_living: 'Living',
              name_en: '',
              name_ur: '',
              description_en: '',
              description_ur: '',
              unit_price: '',
              current_stock: '1',
              min_order_qty: '1',
              tags: '',
            }}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <Layout style={styles.inputContainer}>
                {/* Category */}
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.category')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.select,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    onPress={() => setCategoryModalVisible(true)}>
                    <Text
                      style={[
                        styles.selectText,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {categoryIndex !== null
                        ? categoryOptions[categoryIndex.row]
                        : t('addProduct.categoryPlaceholder')}
                    </Text>
                    <Icon
                      name="chevron-down"
                      fill={
                        isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600']
                      }
                      style={{width: 20, height: 20}}
                    />
                  </TouchableOpacity>
                </Layout>
                {/* Sub Category */}
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.subCategory')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.select,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    onPress={() => setSubcategoryModalVisible(true)}
                    disabled={!selectedCategory}>
                    <Text
                      style={[
                        styles.selectText,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {subcategoryIndex !== null
                        ? subcategoryOptions[subcategoryIndex.row]
                        : t('addProduct.subCategoryPlaceholder')}
                    </Text>
                    <Icon
                      name="chevron-down"
                      fill={
                        isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600']
                      }
                      style={{width: 20, height: 20}}
                    />
                  </TouchableOpacity>
                </Layout>
                {/* Units */}
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.units')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.select,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    onPress={() => setUnitModalVisible(true)}>
                    <Text
                      style={[
                        styles.selectText,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {unitIndex !== null
                        ? units[unitIndex.row]
                        : t('addProduct.unitsPlaceholder')}
                    </Text>
                    <Icon
                      name="chevron-down"
                      fill={
                        isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600']
                      }
                      style={{width: 20, height: 20}}
                    />
                  </TouchableOpacity>
                </Layout>
                {/* Is Living */}
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.isLiving')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.select,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    onPress={() => setIsLivingModalVisible(true)}>
                    <Text
                      style={[
                        styles.selectText,
                        {
                          color: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}>
                      {livingOptions[isLivingIndex]}
                    </Text>
                    <Icon
                      name="chevron-down"
                      fill={
                        isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600']
                      }
                      style={{width: 20, height: 20}}
                    />
                  </TouchableOpacity>
                </Layout>
                {/* Language Tabs */}
                <View
                  style={[
                    styles.tabContainer,
                    {
                      borderColor: isDark
                        ? theme['color-shadcn-border']
                        : theme['color-basic-400'],
                    },
                  ]}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      langTab === 'en' && [
                        styles.activeTab,
                        {
                          borderColor: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ],
                    ]}
                    onPress={() => setLangTab('en')}>
                    <Text
                      style={[
                        langTab === 'en'
                          ? [
                              styles.activeTabText,
                              {
                                color: isDark
                                  ? theme['color-shadcn-foreground']
                                  : theme['color-basic-900'],
                              },
                            ]
                          : [
                              styles.tabText,
                              {
                                color: isDark
                                  ? theme['color-shadcn-muted-foreground']
                                  : theme['color-basic-600'],
                              },
                            ],
                      ]}>
                      English
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      langTab === 'ur' && [
                        styles.activeTab,
                        {
                          borderColor: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ],
                    ]}
                    onPress={() => setLangTab('ur')}>
                    <Text
                      style={[
                        langTab === 'ur'
                          ? [
                              styles.activeTabText,
                              {
                                color: isDark
                                  ? theme['color-shadcn-foreground']
                                  : theme['color-basic-900'],
                              },
                            ]
                          : [
                              styles.tabText,
                              {
                                color: isDark
                                  ? theme['color-shadcn-muted-foreground']
                                  : theme['color-basic-600'],
                              },
                            ],
                      ]}>
                      Urdu
                    </Text>
                  </TouchableOpacity>
                </View>
                {langTab === 'en' ? (
                  <>
                    <Layout style={styles.fieldGroup}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {t('addProduct.nameEN')}
                      </Text>
                      <Input
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                            borderColor: isDark
                              ? theme['color-shadcn-border']
                              : theme['color-basic-400'],
                          },
                        ]}
                        textStyle={[
                          styles.inputText,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}
                        onChangeText={handleChange('name_en')}
                        onBlur={handleBlur('name_en')}
                        value={values.name_en}
                        placeholder={t('addProduct.nameENPlaceholder')}
                        placeholderTextColor={
                          isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600']
                        }
                      />
                    </Layout>
                    <Layout style={styles.fieldGroup}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {t('addProduct.descriptionEN')}
                      </Text>
                      <Input
                        multiline={true}
                        numberOfLines={8}
                        textAlignVertical="top"
                        style={[
                          styles.input,
                          styles.descriptionInput,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                            borderColor: isDark
                              ? theme['color-shadcn-border']
                              : theme['color-basic-400'],
                          },
                        ]}
                        textStyle={[
                          styles.inputText,
                          {
                            paddingVertical: 10,
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}
                        onChangeText={handleChange('description_en')}
                        onBlur={handleBlur('description_en')}
                        value={values.description_en}
                        placeholder={t('addProduct.descriptionENPlaceholder')}
                        placeholderTextColor={
                          isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600']
                        }
                      />
                    </Layout>
                  </>
                ) : (
                  <>
                    <Layout style={styles.fieldGroup}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {t('addProduct.nameUR')}
                      </Text>
                      <Input
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                            borderColor: isDark
                              ? theme['color-shadcn-border']
                              : theme['color-basic-400'],
                          },
                        ]}
                        textStyle={[
                          styles.inputText,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}
                        onChangeText={handleChange('name_ur')}
                        onBlur={handleBlur('name_ur')}
                        value={values.name_ur}
                        placeholder={t('addProduct.nameURPlaceholder')}
                        placeholderTextColor={
                          isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600']
                        }
                      />
                    </Layout>
                    <Layout style={styles.fieldGroup}>
                      <Text
                        style={[
                          styles.fieldLabel,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {t('addProduct.descriptionUR')}
                      </Text>
                      <Input
                        multiline={true}
                        numberOfLines={4}
                        style={[
                          styles.input,
                          styles.descriptionInput,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                            borderColor: isDark
                              ? theme['color-shadcn-border']
                              : theme['color-basic-400'],
                          },
                        ]}
                        textStyle={[
                          styles.inputText,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}
                        onChangeText={handleChange('description_ur')}
                        onBlur={handleBlur('description_ur')}
                        value={values.description_ur}
                        placeholder={t('addProduct.descriptionURPlaceholder')}
                        placeholderTextColor={
                          isDark
                            ? theme['color-shadcn-muted-foreground']
                            : theme['color-basic-600']
                        }
                      />
                    </Layout>
                  </>
                )}
                {/* Product Price and Stock */}
                <Text
                  style={[
                    styles.sectionHeader,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('addProduct.productPriceAndStock')}
                </Text>
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.price')}
                  </Text>
                  <Input
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    textStyle={[
                      styles.inputText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}
                    onChangeText={handleChange('unit_price')}
                    onBlur={handleBlur('unit_price')}
                    value={values.unit_price}
                    placeholder={t('addProduct.pricePlaceholder')}
                    placeholderTextColor={
                      isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                    keyboardType="numeric"
                  />
                </Layout>
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.totalQuantity')}
                  </Text>
                  <Input
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    textStyle={[
                      styles.inputText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}
                    onChangeText={handleChange('current_stock')}
                    onBlur={handleBlur('current_stock')}
                    value={values.current_stock}
                    placeholder={t('addProduct.totalQuantityPlaceholder')}
                    placeholderTextColor={
                      isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                    keyboardType="numeric"
                  />
                </Layout>
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.minOrderQuantity')}
                  </Text>
                  <Input
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    textStyle={[
                      styles.inputText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}
                    onChangeText={handleChange('min_order_qty')}
                    onBlur={handleBlur('min_order_qty')}
                    value={values.min_order_qty}
                    placeholder={t('addProduct.minOrderQuantityPlaceholder')}
                    placeholderTextColor={
                      isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                    keyboardType="numeric"
                  />
                </Layout>
                {/* Tags */}
                <Text
                  style={[
                    styles.sectionHeader,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {t('addProduct.tags')}
                </Text>
                <Layout style={styles.fieldGroup}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}>
                    {t('addProduct.searchTags')}
                  </Text>
                  <Input
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                        borderColor: isDark
                          ? theme['color-shadcn-border']
                          : theme['color-basic-400'],
                      },
                    ]}
                    textStyle={[
                      styles.inputText,
                      {
                        color: isDark
                          ? theme['color-shadcn-foreground']
                          : theme['color-basic-900'],
                      },
                    ]}
                    value={tagInput}
                    placeholder={t('addProduct.tagInputPlaceholder')}
                    placeholderTextColor={
                      isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600']
                    }
                    onChangeText={handleTagInput}
                    onSubmitEditing={() => handleTagInput(tagInput + ',')}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <View
                    style={[
                      styles.tagsContainer,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                      },
                    ]}>
                    {tags.map((tag, i) => (
                      <View
                        key={i}
                        style={[
                          styles.tagChip,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                          },
                        ]}>
                        <Text
                          style={[
                            styles.tagText,
                            {
                              color: isDark
                                ? theme['color-shadcn-foreground']
                                : theme['color-basic-900'],
                            },
                          ]}>
                          {tag}
                        </Text>
                        <TouchableOpacity onPress={() => removeTag(i)}>
                          <Text
                            style={[
                              styles.tagRemove,
                              {
                                color: isDark
                                  ? theme['color-shadcn-foreground']
                                  : theme['color-basic-900'],
                              },
                            ]}>
                            ×
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </Layout>

                {/* Thumbnail Upload */}
                <View
                  style={[
                    styles.uploadBox,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                    },
                  ]}>
                  <TouchableOpacity
                    style={styles.uploadTouchable}
                    onPress={() => handleImagePick('thumbnail')}>
                    <FastImageWithFallback
                      priority={FastImage.priority.high}
                      resizeMode={FastImage.resizeMode.cover}
                      source={require('../../../../assets/new/icons/upload-icon.png')}
                      fallbackSource={{
                        uri: 'https://via.placeholder.com/120x120?text=No+Image',
                      }}
                      style={[
                        styles.uploadIcon,
                        {
                          tintColor: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.uploadTextBox,
                        {
                          borderColor: isDark
                            ? theme['color-shadcn-border']
                            : theme['color-basic-700'],
                        },
                      ]}>
                      <Text
                        style={[
                          styles.uploadText,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {thumbnail
                          ? t('addProduct.thumbnailSelected')
                          : t('addProduct.uploadThumbnail')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {thumbnail && (
                    <View style={styles.imagePreviewContainer}>
                      <FastImageWithFallback
                        priority={FastImage.priority.high}
                        resizeMode={FastImage.resizeMode.cover}
                        source={{uri: thumbnail.uri}}
                        fallbackSource={{
                          uri: 'https://via.placeholder.com/120x120?text=No+Image',
                        }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setThumbnail(null)}>
                        <Text
                          style={[
                            styles.removeImageText,
                            {
                              color: isDark
                                ? theme['color-shadcn-foreground']
                                : theme['color-basic-900'],
                            },
                          ]}>
                          ×
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Multiple Images Upload */}
                <View
                  style={[
                    styles.uploadBox,
                    {
                      backgroundColor: isDark
                        ? theme['color-shadcn-card']
                        : theme['color-basic-100'],
                    },
                  ]}>
                  <TouchableOpacity
                    style={styles.uploadTouchable}
                    onPress={() => handleImagePick('images')}>
                    <FastImageWithFallback
                      priority={FastImage.priority.high}
                      resizeMode={FastImage.resizeMode.cover}
                      source={require('../../../../assets/new/icons/upload-icon.png')}
                      fallbackSource={{
                        uri: 'https://via.placeholder.com/120x120?text=No+Image',
                      }}
                      style={[
                        styles.uploadIcon,
                        {
                          tintColor: isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900'],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.uploadTextBox,
                        {
                          borderColor: isDark
                            ? theme['color-shadcn-border']
                            : theme['color-basic-700'],
                        },
                      ]}>
                      <Text
                        style={[
                          styles.uploadText,
                          {
                            color: isDark
                              ? theme['color-shadcn-foreground']
                              : theme['color-basic-900'],
                          },
                        ]}>
                        {images.length > 0
                          ? `${images.length} ${t('addProduct.imagesSelected')}`
                          : t('addProduct.uploadProductImages')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                      styles.imagesScrollContainer,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-card']
                          : theme['color-basic-100'],
                      },
                    ]}>
                    {images.map((img, index) => (
                      <View
                        key={index}
                        style={[
                          styles.imagePreviewContainer,
                          {
                            backgroundColor: isDark
                              ? theme['color-shadcn-card']
                              : theme['color-basic-100'],
                          },
                        ]}>
                        <FastImageWithFallback
                          priority={FastImage.priority.high}
                          resizeMode={FastImage.resizeMode.cover}
                          source={{uri: img.uri}}
                          fallbackSource={{
                            uri: 'https://via.placeholder.com/120x120?text=No+Image',
                          }}
                          style={[
                            styles.previewImage,
                            {
                              backgroundColor: isDark
                                ? theme['color-shadcn-card']
                                : theme['color-basic-100'],
                            },
                          ]}
                        />
                        <TouchableOpacity
                          style={[
                            styles.removeImageButton,
                            {
                              backgroundColor: isDark
                                ? theme['color-shadcn-card']
                                : theme['color-basic-100'],
                            },
                          ]}
                          onPress={() => {
                            const newImages = [...images];
                            newImages.splice(index, 1);
                            setImages(newImages);
                          }}>
                          <Text
                            style={[
                              styles.removeImageText,
                              {
                                color: isDark
                                  ? theme['color-shadcn-foreground']
                                  : theme['color-basic-900'],
                              },
                            ]}>
                            ×
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Add modals inside Formik render props */}
                {renderModal(
                  categoryModalVisible,
                  setCategoryModalVisible,
                  t('addProduct.category'),
                  categoryOptions,
                  categoryIndex?.row,
                  index => {
                    setCategoryIndex({row: index});
                    setSubcategoryIndex(null);
                    setFieldValue('category_id', categories[index].id);
                  },
                )}

                {renderModal(
                  subcategoryModalVisible,
                  setSubcategoryModalVisible,
                  t('addProduct.subCategory'),
                  subcategoryOptions,
                  subcategoryIndex?.row,
                  index => {
                    setSubcategoryIndex({row: index});
                    setFieldValue(
                      'sub_category_id',
                      selectedCategory.childes[index].id,
                    );
                  },
                )}

                {renderModal(
                  unitModalVisible,
                  setUnitModalVisible,
                  t('addProduct.units'),
                  units,
                  unitIndex?.row,
                  index => {
                    setUnitIndex({row: index});
                    setFieldValue('unit', units[index]);
                  },
                )}

                {renderModal(
                  isLivingModalVisible,
                  setIsLivingModalVisible,
                  t('addProduct.isLiving'),
                  livingOptions,
                  isLivingIndex,
                  index => {
                    setIsLivingIndex(index);
                    setFieldValue('is_living', livingOptions[index]);
                  },
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    {
                      backgroundColor: theme['color-shadcn-primary'],
                      borderColor: theme['color-shadcn-primary'],
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator
                      color={theme['color-shadcn-primary-foreground']}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.submitButtonText,
                        {color: theme['color-shadcn-primary-foreground']},
                      ]}>
                      {t('addProduct.submitAd')}
                    </Text>
                  )}
                </TouchableOpacity>
              </Layout>
            )}
          </Formik>
        </Layout>
      </ScrollView>

      {/* Add congrats dialog */}
      {renderCongratsDialog()}
    </Layout>
  );
};

const styles = StyleSheet.create({
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    marginVertical: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 24,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  inputContainer: {
    flexDirection: 'column',
    paddingVertical: 5,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 4,
    minHeight: 48,
  },
  selectText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  input: {
    borderWidth: 1,
    borderRadius: 2,
    marginHorizontal: 5,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  descriptionInput: {
    minHeight: 80,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    borderBottomWidth: 2,
    borderColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#222',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  uploadBox: {
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#fff',
    paddingVertical: 24,
  },
  uploadTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
    tintColor: '#222', // or remove for original color
  },
  uploadTextBox: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 2,
    paddingHorizontal: 24,
    paddingVertical: 6,
    marginBottom: 6,
  },
  uploadText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  uploadHint: {
    color: '#222',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#FF512F',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF512F',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#333',
    fontSize: 14,
    marginRight: 4,
  },
  tagRemove: {
    color: '#888',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 10,
    resizeMode: 'cover',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 10,
    marginTop: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 18,
  },
  imagesScrollContainer: {
    paddingVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
    position: 'absolute',
    bottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOptions: {
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
  },
  congratsDialogContainer: {
    width: '90%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxHeight: '80%',
  },
  congratsIconContainer: {
    marginBottom: 16,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  congratsMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  imageSlider: {
    width: Dimensions.get('window').width * 0.8,
    height: 200,
    marginBottom: 24,
  },
  sliderImageContainer: {
    width: Dimensions.get('window').width * 0.8,
    height: 200,
    marginHorizontal: 4,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  congratsButtons: {
    width: '100%',
    gap: 12,
  },
  congratsButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAdButton: {
    backgroundColor: '#FF512F',
  },
  addAnotherButton: {
    backgroundColor: '#f5f5f5',
  },
  congratsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
