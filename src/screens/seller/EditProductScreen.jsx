import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking,
  PermissionsAndroid,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Input,
  Spinner,
  Select,
  Toggle,
  Icon,
} from '@ui-kitten/components';
import {useTheme} from '../../theme/ThemeContext';
import {useTranslation} from 'react-i18next';
import {axiosSellerClient} from '../../utils/axiosClient';
import {MainScreensHeader} from '../../components/buyer';
import {launchImageLibrary} from 'react-native-image-picker';
import {BASE_URL} from '../../utils/constants';
import {selectBaseUrls} from '../../store/configs';
import {useSelector, useDispatch} from 'react-redux';
import FastImageWithFallback from '../../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';
import {BASE_URLS} from '../../store/configs';
import {
  loadProductCategories,
  selectProductCategories,
} from '../../store/productCategories';

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

export const EditProductScreen = ({route, navigation}) => {
  const {productId} = route.params;
  const {isDark, theme} = useTheme();
  const {t, i18n} = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    details: '',
    unit_price: '',
    current_stock: '',
    minimum_order_qty: '',
    unit: '',
    category_id: '',
    sub_category_id: '',
    sub_sub_category_id: '',
    brand_id: '',
    product_type: 'physical',
    code: '',
    tax: '',
    tax_type: 'percent',
    tax_model: 'exclude',
    discount: '',
    discount_type: 'percent',
    shipping_cost: '',
    thumbnail: '',
    images: [],
    colors: [],
    attributes: [],
    choice_options: [],
    variation: [],
    meta_title: '',
    meta_description: '',
    meta_image: '',
    video_link: '',
    status: 1,
    featured_status: 0,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  // Track existing product images that user removed, to delete them after a successful update
  const [removedImages, setRemovedImages] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  
  // Category and unit selection states
  const [categoryIndex, setCategoryIndex] = useState(null);
  const [subcategoryIndex, setSubcategoryIndex] = useState(null);
  const [unitIndex, setUnitIndex] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  
  // Redux for categories
  const dispatch = useDispatch();
  const {categories, categoriesLoading} = useSelector(selectProductCategories);
  
  // Unit options
  const units = [
    t('addProduct.units'),
    t('addProduct.kg'),
    t('addProduct.ltr'),
    t('addProduct.pc'),
  ];
  
  const categoryOptions = categories.map(cat => cat.name);
  const selectedCategory = categories[categoryIndex?.row];
  const subcategoryOptions =
    selectedCategory?.childes?.map(sub => sub.name) || [];

  useEffect(() => {
    dispatch(loadProductCategories());
    fetchProductDetails();
  }, [productId, dispatch]);

  // Set category/subcategory/unit indices when categories and product data are loaded
  useEffect(() => {
    // Only set indices if categories are loaded
    if (categories.length === 0) {
      return;
    }

    // Find category index - use category_id (already extracted from category_ids by position in fetchProductDetails)
    let categoryIdToMatch = null;
    
    // Use category_id from product (already extracted from category_ids array based on position)
    if (product.category_id) {
      categoryIdToMatch = product.category_id;
    }

    // Only set if we have a category ID and index is not already set
    if (categoryIdToMatch && (categoryIndex === null || categoryIndex.row === undefined)) {
      const catIdx = categories.findIndex(
        cat => {
          const catId = typeof cat.id === 'string' ? parseInt(cat.id) : cat.id;
          const matchId = typeof categoryIdToMatch === 'string' ? parseInt(categoryIdToMatch) : categoryIdToMatch;
          return catId === matchId || cat.id === categoryIdToMatch || cat.id.toString() === categoryIdToMatch.toString();
        }
      );
      
      if (catIdx !== -1) {
        console.log('Setting category index:', catIdx, 'for category ID:', categoryIdToMatch);
        setCategoryIndex({row: catIdx});
      } else {
        console.log('Category not found. Looking for:', categoryIdToMatch, 'Available categories:', categories.map(c => ({id: c.id, name: c.name})));
      }
    }
    
    // Find unit index
    if (product.unit && (unitIndex === null || unitIndex.row === undefined)) {
      const unitIdx = units.findIndex(
        unit => {
          const unitLower = unit.toLowerCase().trim();
          const productUnitLower = product.unit.toLowerCase().trim();
          return unitLower === productUnitLower || unit === product.unit || unit.trim() === product.unit.trim();
        }
      );
      if (unitIdx !== -1) {
        console.log('Setting unit index:', unitIdx, 'for unit:', product.unit);
        setUnitIndex({row: unitIdx});
      } else {
        console.log('Unit not found. Looking for:', product.unit, 'Available units:', units);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length, product.category_id, product.unit, product.category_ids, categoryIndex]);

  // Set subcategory when category is selected and product has subcategory
  useEffect(() => {
    if (categoryIndex !== null && 
        categoryIndex.row !== undefined && 
        categories[categoryIndex.row] && 
        product.sub_category_id && 
        (subcategoryIndex === null || subcategoryIndex.row === undefined)) {
      const selectedCat = categories[categoryIndex.row];
      if (selectedCat?.childes) {
        const subCatIdx = selectedCat.childes.findIndex(
          sub => {
            const subId = typeof sub.id === 'string' ? parseInt(sub.id) : sub.id;
            const matchSubId = typeof product.sub_category_id === 'string' 
              ? parseInt(product.sub_category_id) 
              : product.sub_category_id;
            return subId === matchSubId || sub.id === product.sub_category_id;
          }
        );
        if (subCatIdx !== -1) {
          setSubcategoryIndex({row: subCatIdx});
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIndex, categories.length, product.sub_category_id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosSellerClient.get(
        `products/details/${productId}`,
      );
      // console.log("product detail response", response.data);
      if (response.data) {
        const productData = response.data;
        
        // Extract category_id and sub_category_id from category_ids array based on position
        // position 1 = main category (category_id)
        // position 2 = sub category (sub_category_id)
        // position 3 = sub sub category (sub_sub_category_id) - not needed
        let categoryId = productData.category_id;
        let subCategoryId = productData.sub_category_id;
        let subSubCategoryId = productData.sub_sub_category_id;
        
        if (productData.category_ids && Array.isArray(productData.category_ids) && productData.category_ids.length > 0) {
          // Find category by position
          const categoryPosition1 = productData.category_ids.find(cat => 
            cat.position === 1 || cat.position === '1'
          );
          const categoryPosition2 = productData.category_ids.find(cat => 
            cat.position === 2 || cat.position === '2'
          );
          const categoryPosition3 = productData.category_ids.find(cat => 
            cat.position === 3 || cat.position === '3'
          );
          
          // Extract IDs
          if (categoryPosition1) {
            categoryId = typeof categoryPosition1 === 'object' && categoryPosition1.id 
              ? categoryPosition1.id 
              : categoryPosition1;
          }
          if (categoryPosition2) {
            subCategoryId = typeof categoryPosition2 === 'object' && categoryPosition2.id 
              ? categoryPosition2.id 
              : categoryPosition2;
          }
          if (categoryPosition3) {
            subSubCategoryId = typeof categoryPosition3 === 'object' && categoryPosition3.id 
              ? categoryPosition3.id 
              : categoryPosition3;
          }
        }
        
        setProduct({
          ...productData,
          category_id: categoryId || productData.category_id || '',
          sub_category_id: subCategoryId || productData.sub_category_id || '',
          sub_sub_category_id: subSubCategoryId || productData.sub_sub_category_id || '',
          unit_price: productData.unit_price?.toString() || '',
          current_stock: productData.current_stock?.toString() || '',
          minimum_order_qty: productData.minimum_order_qty?.toString() || '',
          discount: productData.discount?.toString() || '',
          shipping_cost: productData.shipping_cost?.toString() || '',
          tax: productData.tax?.toString() || '',
          purchase_price: productData.purchase_price?.toString() || '',
          min_qty: productData.min_qty?.toString() || '',
          multiply_qty: productData.multiply_qty?.toString() || '',
        });
        console.log("the resposne", productData)

        // Fix image handling - use proper image objects like in AddProductScreen
        if (productData.thumbnail) {
          setThumbnail({
            uri: `${
               BASE_URLS.product_thumbnail_url
            }/${productData.thumbnail}`,
            fileName: productData.thumbnail,
            type: 'image/jpeg',
          });
        }

        if (productData.images && productData.images.length > 0) {
          const imageObjects = productData.images.map(image => ({
            uri: `${
              BASE_URLS.product_image_url
            }/${image}`,
            fileName: image,
            type: 'image/jpeg',
          }));
          setSelectedImages(imageObjects);
        }

        // Handle tags
        if (productData.tags) {
          if (Array.isArray(productData.tags)) {
            setTags(productData.tags.map(tag => tag.tag || tag));
          } else if (typeof productData.tags === 'string') {
            setTags(productData.tags.split(',').filter(tag => tag.trim()));
          }
        }
        
        // Set category/subcategory/unit indices will be set after categories load
        // This is handled in a separate useEffect below
      }
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      console.error('Error fetching product details:', error);
      console.error('Detailed Error Information:');
      console.error(errorMessage);
      Alert.alert(
        t('common.error'),
        errorMessage.length > 200 
          ? `${errorMessage.substring(0, 200)}...` 
          : errorMessage || t('common.somethingWentWrong'),
      );
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = async () => {
    try {
      const response = await axiosSellerClient.get(
        `products/barcode/generate?id=${productId}&quantity=1`,
      );
      if (response.data) {
        setBarcodeUrl(response.data);
        Linking.openURL(response.data);
      }
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      console.error('Error generating barcode:', error);
      console.error('Detailed Error Information:');
      console.error(errorMessage);
      Alert.alert(
        t('common.error'),
        errorMessage.length > 200 
          ? `${errorMessage.substring(0, 200)}...` 
          : errorMessage || t('editProduct.barcodeError'),
      );
    }
  };

  // const updateStatus = async status => {
  //   try {
  //     await axiosSellerClient.put('products/status-update', {
  //       id: productId,
  //       status: status,
  //     });
  //     setProduct(prev => ({...prev, status}));
  //     Alert.alert(t('common.success'), t('editProduct.statusSuccess'));
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //     Alert.alert(t('common.error'), t('editProduct.statusError'));
  //   }
  // };

  const updateQuantity = async quantity => {
    try {
      await axiosSellerClient.put('products/quantity-update', {
        product_id: productId,
        current_stock: quantity,
      });
      setProduct(prev => ({...prev, current_stock: quantity.toString()}));
      Alert.alert(t('common.success'), t('editProduct.quantitySuccess'));
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      console.error('Error updating quantity:', error);
      console.error('Detailed Error Information:');
      console.error(errorMessage);
      Alert.alert(
        t('common.error'),
        errorMessage.length > 200 
          ? `${errorMessage.substring(0, 200)}...` 
          : errorMessage || t('editProduct.quantityError'),
      );
    }
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
        // Append new images to existing list instead of replacing
        setSelectedImages(prev => [...prev, ...result.assets]);
      }
    }
  };

  const pickImage = async type => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        t('editProduct.permissionDenied'),
        t('editProduct.storagePermission'),
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: type === 'images' ? 5 : 1,
    };

    try {
      const result = await launchImageLibrary(options);
      if (result.assets && result.assets.length > 0) {
        if (type === 'thumbnail') {
          setThumbnail(result.assets[0]);
        } else {
          // Append new images to existing list instead of replacing
          // Also check total limit (max 5 images total)
          setSelectedImages(prev => {
            const newImages = [...prev, ...result.assets];
            // Limit to maximum 5 images
            return newImages.slice(0, 5);
          });
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert(t('common.error'), t('editProduct.imagePickerError'));
    }
  };

  const uploadImage = async (imageAsset, type) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri:
          Platform.OS === 'android'
            ? imageAsset.uri
            : imageAsset.uri.replace('file://', ''),
        name: imageAsset.fileName || `image_${Date.now()}.jpg`,
        type: imageAsset.type || 'image/jpeg',
      });
      formData.append('type', type);

      const response = await axiosSellerClient.post(
        'products/upload-images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data.image_name;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const newTags = tagInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      setTags([...tags, ...newTags]);
      setTagInput('');
    }
  };

  const handleRemoveTag = index => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Helper function to parse error messages for better debugging
  const parseErrorMessage = error => {
    if (!error) return 'Unknown error occurred';

    // Try to extract detailed error information
    const errorData = error.response?.data || error.data || {};
    const errorMessage = error.message || '';
    const status = error.response?.status || error.status;
    const statusText = error.response?.statusText || error.statusText;

    // Build detailed error message
    let details = [];

    // Status information
    if (status) {
      details.push(`Status: ${status} ${statusText || ''}`.trim());
    }

    // Main error message
    if (errorData.message) {
      details.push(`Message: ${errorData.message}`);
    } else if (errorMessage) {
      details.push(`Error: ${errorMessage}`);
    }

    // Validation errors (Laravel style)
    if (errorData.errors && typeof errorData.errors === 'object') {
      // Check if it's an array of error objects
      if (Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map((err, index) => {
          if (typeof err === 'object') {
            // Try to extract message from error object
            return err.message || err.error || err.msg || JSON.stringify(err);
          }
          return err.toString();
        });
        if (errorMessages.length > 0) {
          details.push(`Validation Errors:\n${errorMessages.join('\n')}`);
        }
      } else {
        // Object with field names as keys
        const validationErrors = Object.entries(errorData.errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(', ')}`;
          })
          .join('\n');
        if (validationErrors) {
          details.push(`Validation Errors:\n${validationErrors}`);
        }
      }
    }

    // Additional error data
    if (errorData.error) {
      details.push(`Error: ${errorData.error}`);
    }

    // Request URL
    if (error.config?.url) {
      details.push(`URL: ${error.config.baseURL || ''}${error.config.url}`);
    }

    // Request method
    if (error.config?.method) {
      details.push(`Method: ${error.config.method.toUpperCase()}`);
    }

    return details.length > 0 ? details.join('\n\n') : 'Server error occurred';
  };

  // Render modal for category/subcategory/unit selection
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

  // const handleSave = async () => {
  //   try {
  //     setSaving(true);

  //     // Upload thumbnail if changed (only if it's a new image)
  //     let thumbnailName = product.thumbnail;
  //     if (
  //       thumbnail &&
  //       typeof thumbnail === 'object' &&
  //       thumbnail.uri &&
  //       !thumbnail.fileName
  //     ) {
  //       thumbnailName = await uploadImage(thumbnail, 'thumbnail');
  //     } else if (
  //       thumbnail &&
  //       typeof thumbnail === 'object' &&
  //       thumbnail.fileName
  //     ) {
  //       // If it's an existing image, just use the filename
  //       thumbnailName = thumbnail.fileName;
  //     }

  //     // Upload new images if any (only new ones, not existing ones)
  //     const newImages = selectedImages.filter(
  //       img => typeof img === 'object' && img.uri && !img.fileName,
  //     );
  //     const uploadedImages = await Promise.all(
  //       newImages.map(img => uploadImage(img, 'product')),
  //     );

  //     // Get existing image filenames
  //     const existingImages = selectedImages
  //       .filter(img => typeof img === 'object' && img.fileName)
  //       .map(img => img.fileName);

  //     // Validate required fields
  //     if (!product.name || !product.name.trim()) {
  //       Alert.alert(t('common.error'), t('editProduct.productNameRequired'));
  //       return;
  //     }

  //     if (!product.unit_price || isNaN(parseFloat(product.unit_price))) {
  //       Alert.alert(t('common.error'), t('editProduct.validPriceRequired'));
  //       return;
  //     }

  //     const updatedProduct = {
  //       ...product,
  //       thumbnail: thumbnailName,
  //       images: [...existingImages, ...uploadedImages],
  //       unit_price: parseFloat(product.unit_price),
  //       current_stock: parseInt(product.current_stock) || 0,
  //       minimum_order_qty: parseInt(product.minimum_order_qty) || 1,
  //       discount: parseFloat(product.discount) || 0,
  //       shipping_cost: parseFloat(product.shipping_cost) || 0,
  //       tax: parseFloat(product.tax) || 0,
  //       purchase_price: parseFloat(product.purchase_price) || 0,
  //       min_qty: parseInt(product.min_qty) || 1,
  //       tags: tags.join(','),
  //     };

  //     // console.log('Sending product data:', updatedProduct);
  //     await axiosSellerClient.put(
  //       `products/update/${productId}`,
  //       updatedProduct,
  //     );
  //     Alert.alert(t('common.success'), t('editProduct.success'));
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error('Error updating product:', error);
  //     console.error('Error details:', error.response?.data);
  //     Alert.alert(t('common.error'), t('editProduct.error'));
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSave = async () => {
    try {
      setSaving(true);
  
      // Determine thumbnail - keep existing or use new one
      // We'll send it directly in FormData, no pre-upload needed
  
      // Validate required fields
      if (!product.name || !product.name.trim()) {
        Alert.alert(t('common.error'), t('editProduct.productNameRequired'));
        setSaving(false);
        return;
      }
  
      if (!product.unit_price || isNaN(parseFloat(product.unit_price))) {
        Alert.alert(t('common.error'), t('editProduct.validPriceRequired'));
        setSaving(false);
        return;
      }

      // Log original product data for debugging
      console.log('Original product data:', JSON.stringify({product}, null, 2));

      // Handle colors - preserve original format
      let colorsValue = [];
      if (Array.isArray(product.colors)) {
        colorsValue = product.colors;
      } else if (typeof product.colors === 'string') {
        // If it was originally a string, keep it as string (API might expect JSON string)
        if (product.colors.trim() === '' || product.colors === '[]') {
          colorsValue = []; // Empty array
        } else {
          try {
            const parsed = JSON.parse(product.colors);
            colorsValue = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.warn('Error parsing colors:', e);
            colorsValue = [];
          }
        }
      }

      // Helper function to only include non-empty values
      const includeIfValue = (obj, key, value) => {
        if (value !== null && value !== undefined && value !== '') {
          obj[key] = value;
        }
      };
  
      // Build payload with ONLY editable fields (exclude read-only fields)
      const updatedProduct = {
        // Basic information (required)
        name: product.name.trim(),
        details: product.details || '',
        
        // Pricing
        unit_price: parseFloat(product.unit_price),
        purchase_price: parseFloat(product.purchase_price) || 0,
        discount: parseFloat(product.discount) || 0,
        discount_type: product.discount_type || 'flat',
        tax: parseFloat(product.tax) || 0,
        tax_model: product.tax_model || 'exclude',
        shipping_cost: parseFloat(product.shipping_cost) || 0,
        
        // Stock
        current_stock: parseInt(product.current_stock) || 0,
        minimum_order_qty: parseInt(product.minimum_order_qty) || 1,
        min_qty: parseInt(product.min_qty) || 1,
        multiply_qty: product.multiply_qty || '0',
        
        // Product type
        product_type: product.product_type || 'physical',
        unit: product.unit || '',
        
        // Images - we'll handle these directly in FormData
        // Don't set thumbnail/images here, we'll handle them directly in FormData section
        
        // Colors - send as array (API should handle it)
        colors: colorsValue,
        
        // Variants
        variant_product: product.variant_product || 0,
        attributes: product.attributes || [],
        choice_options: product.choice_options || [],
        variation: product.variation || [],
        
        // Status
        status: product.status ?? 0,
        featured_status: product.featured_status ?? 0,
        published: product.published ?? 0,
        refundable: product.refundable ?? 1,
        free_shipping: product.free_shipping ?? 0,
      };

      // Use selected category/subcategory from modal selection or existing values
      // Always send as simple fields: category_id, sub_category_id (not category_ids array)
      if (categoryIndex !== null && categories[categoryIndex.row]) {
        updatedProduct.category_id = categories[categoryIndex.row].id;
        
        // Set subcategory if selected
        if (subcategoryIndex !== null && selectedCategory?.childes) {
          updatedProduct.sub_category_id = selectedCategory.childes[subcategoryIndex.row].id;
        } else {
          // Keep existing subcategory if no new selection
          includeIfValue(updatedProduct, 'sub_category_id', product.sub_category_id);
        }
      } else {
        // Use existing values from product (already extracted from category_ids in fetchProductDetails)
        includeIfValue(updatedProduct, 'category_id', product.category_id);
        includeIfValue(updatedProduct, 'sub_category_id', product.sub_category_id);
        // sub_sub_category_id not needed per requirements
      }
      
      // Use selected unit from modal selection
      if (unitIndex !== null && units[unitIndex.row]) {
        updatedProduct.unit = units[unitIndex.row];
      }
      
      includeIfValue(updatedProduct, 'brand_id', product.brand_id);
      includeIfValue(updatedProduct, 'tax_type', product.tax_type);
      includeIfValue(updatedProduct, 'code', product.code);
      includeIfValue(updatedProduct, 'video_provider', product.video_provider);
      includeIfValue(updatedProduct, 'video_url', product.video_url);
      includeIfValue(updatedProduct, 'meta_title', product.meta_title);
      includeIfValue(updatedProduct, 'meta_description', product.meta_description);
      includeIfValue(updatedProduct, 'meta_image', product.meta_image);
      
      // Tags - add as array for FormData handling
      if (tags.length > 0) {
        updatedProduct.tags = tags;
      }

      // Clean up payload - remove empty strings and null values for optional fields
      // Keep required fields and arrays even if empty
      Object.keys(updatedProduct).forEach(key => {
        const value = updatedProduct[key];
        
        // Remove empty strings, null, or undefined for optional fields only
        if (value === '' || value === null || value === undefined) {
          // Keep required fields that might legitimately be empty strings
          const fieldsToKeep = ['details', 'unit']; // These can be empty strings
          if (!fieldsToKeep.includes(key)) {
            delete updatedProduct[key];
          }
        }
        
        // Keep all arrays - API might need them even if empty
        // Arrays are kept as-is
      });

      // Convert to FormData format (like AddProductScreen)
      const formData = new FormData();
      
      // Language data (required - API expects lang[] array)
      formData.append('lang[]', 'en');
      // Add other languages if needed
      
      // Basic fields - use array format for name and description (like Postman)
      formData.append('name[]', updatedProduct.name);
      if (updatedProduct.details) {
        formData.append('description[]', updatedProduct.details);
      }
      
      // Pricing
      formData.append('unit_price', updatedProduct.unit_price.toString());
      formData.append('purchase_price', updatedProduct.purchase_price.toString());
      formData.append('discount', updatedProduct.discount.toString());
      formData.append('discount_type', updatedProduct.discount_type);
      formData.append('tax', updatedProduct.tax.toString());
      if (updatedProduct.tax_type) {
        formData.append('tax_type', updatedProduct.tax_type);
      }
      formData.append('tax_model', updatedProduct.tax_model);
      formData.append('shipping_cost', updatedProduct.shipping_cost.toString());
      
      // Stock
      formData.append('current_stock', updatedProduct.current_stock.toString());
      formData.append('minimum_order_qty', updatedProduct.minimum_order_qty.toString());
      formData.append('min_qty', updatedProduct.min_qty.toString());
      formData.append('multiply_qty', updatedProduct.multiply_qty.toString());
      
      // Product type
      formData.append('product_type', updatedProduct.product_type);
      formData.append('unit', updatedProduct.unit);
      
      // Images / thumbnail: match backend ProductController@update expectations
      // Backend logic:
      //   - Keeps existing $product->images from DB
      //   - Appends ONLY real uploaded files from $request->file('images')
      //   - Updates thumbnail ONLY when $request->file('thumbnail') exists
      // So: we only send NEW local files, never existing filenames.

      // Handle thumbnail (only send if user picked a NEW local image)
      if (thumbnail && typeof thumbnail === 'object' && thumbnail.uri) {
        const isLocalThumb =
          thumbnail.uri.startsWith('file://') ||
          thumbnail.uri.startsWith('content://') ||
          thumbnail.uri.includes('rn_image_picker_lib_temp');

        if (isLocalThumb) {
          const thumbUri =
            Platform.OS === 'android'
              ? thumbnail.uri
              : thumbnail.uri.replace('file://', '');

          const thumbName =
            thumbnail.fileName && !thumbnail.fileName.includes('rn_image_picker_lib_temp')
              ? thumbnail.fileName
              : thumbnail.uri.split('/').pop() || `thumbnail_${Date.now()}.jpg`;

          console.log('Sending NEW thumbnail file to backend:', {
            uri: thumbUri,
            name: thumbName,
            type: thumbnail.type || 'image/jpeg',
          });

          formData.append('thumbnail', {
            uri: thumbUri,
            name: thumbName,
            type: thumbnail.type || 'image/jpeg',
          });
        }
        // If not local (existing remote thumbnail), do NOT send anything.
        // Backend will keep current thumbnail from DB.
      }

      // Handle product images (only send NEW local images as files)
      if (selectedImages && Array.isArray(selectedImages) && selectedImages.length > 0) {
        selectedImages.forEach((imageObj, index) => {
          if (!imageObj || typeof imageObj !== 'object' || !imageObj.uri) {
            return;
          }

          const isLocalFile =
            imageObj.uri.startsWith('file://') ||
            imageObj.uri.startsWith('content://') ||
            imageObj.uri.includes('rn_image_picker_lib_temp') ||
            (imageObj.fileName && imageObj.fileName.includes('rn_image_picker_lib_temp'));

          if (!isLocalFile) {
            // Existing server image – DO NOT send. Backend already has it in $product->images.
            return;
          }

          const imageUri =
            Platform.OS === 'android'
              ? imageObj.uri
              : imageObj.uri.replace('file://', '');

          const imageName =
            imageObj.fileName && !imageObj.fileName.includes('rn_image_picker_lib_temp')
              ? imageObj.fileName
              : imageObj.uri.split('/').pop() || `image_${Date.now()}_${index}.jpg`;

          formData.append('images[]', {
            uri: imageUri,
            name: imageName,
            type: imageObj.type || 'image/jpeg',
          });
        });
      }
      
      // Colors - send as empty JSON string if empty array
      if (updatedProduct.colors && Array.isArray(updatedProduct.colors) && updatedProduct.colors.length > 0) {
        updatedProduct.colors.forEach((color, index) => {
          formData.append(`colors[${index}]`, color);
        });
      } else {
        formData.append('colors', '[]');
      }
      
      // Variants
      formData.append('variant_product', updatedProduct.variant_product.toString());
      
      // Attributes, choice_options, variation - send as empty JSON string if empty
      if (updatedProduct.attributes && Array.isArray(updatedProduct.attributes) && updatedProduct.attributes.length > 0) {
        updatedProduct.attributes.forEach((attr, index) => {
          formData.append(`attributes[${index}]`, JSON.stringify(attr));
        });
      } else {
        formData.append('attributes', '[]');
      }
      
      if (updatedProduct.choice_options && Array.isArray(updatedProduct.choice_options) && updatedProduct.choice_options.length > 0) {
        updatedProduct.choice_options.forEach((option, index) => {
          formData.append(`choice_options[${index}]`, JSON.stringify(option));
        });
      } else {
        formData.append('choice_options', '[]');
      }
      
      if (updatedProduct.variation && Array.isArray(updatedProduct.variation) && updatedProduct.variation.length > 0) {
        updatedProduct.variation.forEach((variation, index) => {
          formData.append(`variation[${index}]`, JSON.stringify(variation));
        });
      } else {
        formData.append('variation', '[]');
      }
      
      // Status
      formData.append('status', updatedProduct.status.toString());
      formData.append('featured_status', updatedProduct.featured_status.toString());
      formData.append('published', updatedProduct.published.toString());
      formData.append('refundable', updatedProduct.refundable.toString());
      formData.append('free_shipping', updatedProduct.free_shipping.toString());
      
      // Category - send as simple fields (category_id, sub_category_id)
      // Not sending category_ids array format
      if (updatedProduct.category_id) {
        formData.append('category_id', updatedProduct.category_id.toString());
      }
      
      if (updatedProduct.sub_category_id) {
        formData.append('sub_category_id', updatedProduct.sub_category_id.toString());
      }
      
      // sub_sub_category_id not needed per requirements, but include if exists
      if (updatedProduct.sub_sub_category_id) {
        formData.append('sub_sub_category_id', updatedProduct.sub_sub_category_id.toString());
      }
      
      // Optional fields
      if (updatedProduct.brand_id) {
        formData.append('brand_id', updatedProduct.brand_id.toString());
      }
      // Code field - only send if it's numeric and at least 6 digits
      // If code is not numeric, don't send it (API will use existing code)
      if (updatedProduct.code) {
        const codeStr = updatedProduct.code.toString().trim();
        // Check if code is numeric and has at least 6 digits
        if (!isNaN(codeStr) && codeStr.length >= 6) {
          formData.append('code', codeStr);
        } else {
          // Code is not valid numeric - don't send it
          // API will keep the existing code or generate a new one
          console.warn('Skipping invalid code:', codeStr, '- must be numeric and at least 6 digits');
        }
      }
      if (updatedProduct.video_provider) {
        formData.append('video_provider', updatedProduct.video_provider);
      }
      if (updatedProduct.video_url) {
        formData.append('video_url', updatedProduct.video_url);
      }
      if (updatedProduct.meta_title) {
        formData.append('meta_title', updatedProduct.meta_title);
      }
      if (updatedProduct.meta_description) {
        formData.append('meta_description', updatedProduct.meta_description);
      }
      if (updatedProduct.meta_image) {
        formData.append('meta_image', updatedProduct.meta_image);
      }
      
      // Tags - send as array format
      if (updatedProduct.tags && Array.isArray(updatedProduct.tags) && updatedProduct.tags.length > 0) {
        updatedProduct.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      }
      
      console.log('Sending product data as FormData');
      console.log('FormData fields count:', Object.keys(updatedProduct).length);
      console.log('Has images:', updatedProduct.images?.length || 0);
      console.log('Category ID:', updatedProduct.category_id);
      console.log('Sub Category ID:', updatedProduct.sub_category_id);


      console.log('formdata', formData);

      // Send as FormData with multipart/form-data
      const response = await axiosSellerClient.post(
        `products/update/${productId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Update response:', response.data);

      // After successful update, delete any images the user removed.
      // Backend web route example:
      // https://petbookers.com.pk/seller/product/remove-image?id={id}&name={imageName}
      if (removedImages.length > 0) {
        console.log('Images marked for deletion:', removedImages);
        try {
          await Promise.all(
            removedImages.map(async imageName => {
              try {
                // API equivalent of seller/product/remove-image
                await axiosSellerClient.get('products/remove-image', {
                  params: {
                    id: productId,
                    name: imageName,
                  },
                });
                console.log('Requested delete for image:', imageName);
              } catch (imgErr) {
                console.error(
                  'Failed to delete image on backend:',
                  imageName,
                  imgErr,
                );
              }
            }),
          );
        } finally {
          // Clear removed images list regardless of individual delete failures
          setRemovedImages([]);
        }
      }

      Alert.alert(t('common.success'), t('editProduct.success'));
      navigation.goBack();
    } catch (error) {
      const errorMessage = parseErrorMessage(error);
      console.error('Error updating product:', error);
      console.error('Detailed Error Information:');
      console.error(errorMessage);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Show detailed error to user
      Alert.alert(
        t('common.error'),
        errorMessage.length > 200 
          ? `${errorMessage.substring(0, 200)}...` 
          : errorMessage,
      );
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    Alert.alert(
      t('productDetails.confirmDelete'),
      t('productDetails.confirmDelete'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('productDetails.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosSellerClient.delete(`products/delete/${productId}`);
              Alert.alert(
                t('common.success'),
                t('productDetails.deleteSuccess'),
              );
              navigation.goBack();
            } catch (error) {
              const errorMessage = parseErrorMessage(error);
              console.error('Error deleting product:', error);
              console.error('Detailed Error Information:');
              console.error(errorMessage);
              console.error('Full error object:', JSON.stringify(error, null, 2));
              
              Alert.alert(
                t('common.error'),
                errorMessage.length > 200 
                  ? `${errorMessage.substring(0, 200)}...` 
                  : errorMessage || t('productDetails.deleteError'),
              );
            }
          },
        },
      ],
    );
  };
  const baseUrls = useSelector(selectBaseUrls);

  if (loading) {
    return (
      <Layout
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-background']
              : theme['color-basic-100'],
          },
        ]}>
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
        },
      ]}>
      {/* <MainScreensHeader
        title={t('editProduct.title')}
        showBackButton
        rightIcon="trash-2-outline"
        onRightIconPress={handleDelete}
      /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Status Toggle */}
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.status')}
            </Text>
            {/* <Text>{product?.status === 1 ? '':''}</Text> */}
            <Toggle
              checked={product.status === 1}
              // onChange={checked => updateStatus(checked ? 1 : 0)}
              style={styles.toggle}
            />
          </View>

          {/* Featured Toggle */}
          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.featured')}
            </Text>
            <Toggle
              checked={product.featured_status === 1}
              onChange={checked =>
                setProduct(prev => ({
                  ...prev,
                  featured_status: checked ? 1 : 0,
                }))
              }
              style={styles.toggle}
              disabled={true}
            />
          </View>

          {/* Basic Information */}
          <Input
            label={t('editProduct.name')}
            value={product.name}
            onChangeText={text => setProduct({...product, name: text})}
            style={styles.input}
            textStyle={{
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}
          />

          <Input
            label={t('editProduct.details')}
            value={product.details}
            onChangeText={text => setProduct({...product, details: text})}
            multiline
            textStyle={{
              height: 100,
              textAlignVertical: 'top',
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}
            style={styles.input}
          />

          {/* Category Selection */}
          <View style={styles.fieldGroup}>
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
                {categoryIndex !== null && categoryOptions[categoryIndex.row]
                  ? categoryOptions[categoryIndex.row]
                  : product.category_id && categories.length > 0
                  ? (() => {
                      const foundCat = categories.find(c => {
                        const catId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
                        const prodCatId = typeof product.category_id === 'string' 
                          ? parseInt(product.category_id) 
                          : product.category_id;
                        return catId === prodCatId || c.id === product.category_id;
                      });
                      return foundCat?.name || t('addProduct.categoryPlaceholder');
                    })()
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
          </View>

          {/* Sub Category Selection */}
          <View style={styles.fieldGroup}>
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
                  opacity: selectedCategory ? 1 : 0.5,
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
                {subcategoryIndex !== null && subcategoryOptions[subcategoryIndex.row]
                  ? subcategoryOptions[subcategoryIndex.row]
                  : product.sub_category_id && selectedCategory?.childes
                  ? (() => {
                      const foundSubCat = selectedCategory.childes.find(c => {
                        const subCatId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
                        const prodSubCatId = typeof product.sub_category_id === 'string' 
                          ? parseInt(product.sub_category_id) 
                          : product.sub_category_id;
                        return subCatId === prodSubCatId || c.id === product.sub_category_id;
                      });
                      return foundSubCat?.name || t('addProduct.subCategoryPlaceholder');
                    })()
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
          </View>

          {/* Price and Stock */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.price')}
              value={product.unit_price}
              onChangeText={text => setProduct({...product, unit_price: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.stock')}
              value={product.current_stock}
              onChangeText={text =>
                setProduct({...product, current_stock: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Minimum Order and Unit */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.minOrder')}
              value={product.minimum_order_qty}
              onChangeText={text =>
                setProduct({...product, minimum_order_qty: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            {/* Unit Selection */}
            <View style={styles.halfInput}>
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                    marginBottom: 6,
                  },
                ]}>
                {t('editProduct.unit')}
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
                    : product.unit || t('addProduct.unitsPlaceholder')}
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
            </View>
          </View>

          {/* Code and Tax */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.code')}
              value={product.code}
              // disabled={true}
              onChangeText={text => setProduct({...product, code: text})}
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.tax')}
              value={product.tax}
              onChangeText={text => setProduct({...product, tax: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Discount and Shipping */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.discount')}
              value={product.discount}
              onChangeText={text => setProduct({...product, discount: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.shippingCost')}
              value={product.shipping_cost}
              onChangeText={text =>
                setProduct({...product, shipping_cost: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Additional Product Information */}
          <View style={styles.rowContainer}>
            <Input
              label={t('editProduct.purchasePrice')}
              value={product.purchase_price?.toString() || ''}
              onChangeText={text =>
                setProduct({...product, purchase_price: text})
              }
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />

            <Input
              label={t('editProduct.minQty')}
              value={product.min_qty?.toString() || ''}
              onChangeText={text => setProduct({...product, min_qty: text})}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              textStyle={{
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              }}
            />
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <Text
              style={[
                styles.tagsLabel,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.tags')}
            </Text>
            <View style={styles.tagsInputContainer}>
              <TextInput
                style={[
                  styles.tagsInput,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                    borderColor: isDark
                      ? theme['color-shadcn-border']
                      : theme['color-basic-300'],
                  },
                ]}
                placeholder={t('editProduct.addTags')}
                placeholderTextColor={
                  isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-500']
                }
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <Button
                size="small"
                onPress={handleAddTag}
                style={styles.addTagButton}>
                {t('editProduct.add')}
              </Button>
            </View>
            <ScrollView
              style={styles.tagsList}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}>
              <View style={styles.tagsRow}>
                {tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: isDark
                          ? theme['color-shadcn-secondary']
                          : theme['color-basic-200'],
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
                    <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                      <Icon
                        name="close"
                        size={16}
                        fill={
                          isDark
                            ? theme['color-shadcn-foreground']
                            : theme['color-basic-900']
                        }
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Product Type and Status Information */}
          <View style={styles.infoSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.productInformation')}
            </Text>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('product.productType')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.product_type || t('editProduct.physical')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('product.refundable')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.refundable === 1 ? t('product.yes') : t('product.no')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('product.freeShipping')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.free_shipping === 1 ? t('product.yes') : t('product.no')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('product.published')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.published === 1 ? t('product.yes') : t('product.no')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('editProduct.requestStatus')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.request_status === 1
                  ? t('common.approved')
                  : product.request_status === 0
                  ? t('common.pending')
                  : t('common.rejected')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('editProduct.reviewsCount')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.reviews_count || 0}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('editProduct.created')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.created_at
                  ? new Date(product.created_at).toLocaleDateString()
                  : t('common.notAvailable')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                  },
                ]}>
                {t('editProduct.updated')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {product.updated_at
                  ? new Date(product.updated_at).toLocaleDateString()
                  : t('common.notAvailable')}
              </Text>
            </View>
            {product.denied_note && (
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  {t('editProduct.deniedNote')}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {color: theme['color-danger-default']},
                  ]}>
                  {product.denied_note}
                </Text>
              </View>
            )}
          </View>

          {/* Images Section */}
          <View style={styles.imageSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.thumbnail')}
            </Text>
            {console.log('thumbnail', `${BASE_URLS.product_thumbnail_url} \n${thumbnail.uri}`)}
            <TouchableOpacity
              onPress={() => pickImage('thumbnail')}
              style={styles.imageUploadButton}>
              {thumbnail ? (
                <FastImageWithFallback
                  priority={FastImage.priority.high}
                  resizeMode={FastImage.resizeMode.cover}
                  source={{uri: `${thumbnail.uri}` || thumbnail}}
                  fallbackSource={{
                    uri: 'https://via.placeholder.com/120x120?text=No+Image',
                  }}
                  style={styles.thumbnail}
                />
              ) : (
                <Text style={{color: theme['color-shadcn-primary']}}>
                  {t('editProduct.uploadThumbnail')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.imageSection}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                },
              ]}>
              {t('editProduct.images')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <FastImageWithFallback
                    priority={FastImage.priority.high}
                    resizeMode={FastImage.resizeMode.cover}
                    source={{uri: image.uri || image}}
                    fallbackSource={{
                      uri: 'https://via.placeholder.com/120x120?text=No+Image',
                    }}
                    style={styles.productImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => {
                      setSelectedImages(prev => {
                        const img = prev[index];

                        // If this is an existing server image (has fileName and uri is not local),
                        // remember its filename so we can delete it from backend after update.
                        if (
                          img &&
                          typeof img === 'object' &&
                          img.fileName &&
                          img.uri &&
                          !img.uri.startsWith('file://') &&
                          !img.uri.startsWith('content://') &&
                          !img.uri.includes('rn_image_picker_lib_temp')
                        ) {
                          setRemovedImages(old => [...old, img.fileName]);
                        }

                        return prev.filter((_, i) => i !== index);
                      });
                    }}>
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => pickImage('images')}
                style={styles.addImageButton}>
                <Text style={{color: theme['color-shadcn-primary']}}>+</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Barcode Section */}
          <View style={styles.barcodeSection}>
            <Button
              style={[
                styles.barcodeButton,
                {backgroundColor: theme['color-shadcn-primary']},
              ]}
              onPress={generateBarcode}>
              {t('editProduct.generateBarcode')}
            </Button>
          </View>

          <Button
            style={[
              styles.saveButton,
              {backgroundColor: theme['color-shadcn-primary']},
            ]}
            onPress={handleSave}
            disabled={saving}>
            {saving ? t('editProduct.saving') : t('editProduct.save')}
          </Button>
        </View>
      </ScrollView>

      {/* Category/Subcategory/Unit Selection Modals */}
      {renderModal(
        categoryModalVisible,
        setCategoryModalVisible,
        t('addProduct.category'),
        categoryOptions,
        categoryIndex?.row,
        index => {
          setCategoryIndex({row: index});
          setSubcategoryIndex(null); // Reset subcategory when category changes
          setProduct(prev => ({
            ...prev,
            category_id: categories[index].id,
            sub_category_id: '', // Clear subcategory when category changes
          }));
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
          if (selectedCategory?.childes) {
            setProduct(prev => ({
              ...prev,
              sub_category_id: selectedCategory.childes[index].id,
            }));
          }
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
          setProduct(prev => ({
            ...prev,
            unit: units[index],
          }));
        },
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
  },
  imageSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  imageUploadButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  imagesScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
  },
  toggle: {
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  barcodeSection: {
    marginTop: 16,
  },
  barcodeButton: {
    marginBottom: 16,
  },
  infoSection: {
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  reviewsSection: {
    marginTop: 16,
  },
  reviewItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  addTagButton: {
    paddingHorizontal: 16,
  },
  tagsList: {
    maxHeight: 120,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
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
});
