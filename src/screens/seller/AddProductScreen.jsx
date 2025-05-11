import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Platform, Image} from 'react-native';
import {
  Layout,
  Text,
  Input,
  useTheme,
  Select,
  SelectItem,
} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {Formik} from 'formik';
import {spacingStyles} from '../../utils/globalStyles';
import {InputError, SubmitButton, ImagePicker} from '../../components/form';
import { useSelector, useDispatch } from 'react-redux';
import { loadProductCategories, selectProductCategories } from '../../store/productCategories';

export const AddProductScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [langTab, setLangTab] = useState('en');
  const [isLiving, setIsLiving] = useState('Living');
  const [categoryIndex, setCategoryIndex] = useState(null);
  const [subcategoryIndex, setSubcategoryIndex] = useState(null);
  const [unitIndex, setUnitIndex] = useState(null);
  const [isLivingIndex, setIsLivingIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const units = [t('addProduct.units'), t('addProduct.kg'), t('addProduct.ltr'), t('addProduct.pc')];
  const livingOptions = [t('addProduct.living'), t('addProduct.nonLiving')];

  const dispatch = useDispatch();
  const { categories, categoriesLoading } = useSelector(selectProductCategories);
  console.log("categories", JSON.stringify(categories, null, 2));

  useEffect(() => {
    dispatch(loadProductCategories());
  }, [dispatch]);

  const categoryOptions = categories.map(cat => cat.name);
  const selectedCategory = categories[categoryIndex?.row];
  const subcategoryOptions = selectedCategory?.childes?.map(sub => sub.name) || [];

  const onProductPostedSuccess = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'AddProductSuccess'}],
    });
  };

  const handleSubmit = values => {
    // Add tags to form values
    values.tags = tags;
    onProductPostedSuccess();
  };

  const handleTagInput = (text) => {
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

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: '#ffffff'}}>
      
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          // spacingStyles.px16,
          // spacingStyles.py8,
          {
            backgroundColor: '#FFF',
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
              backgroundColor: '#fff',
            },
          ]}>
          
          <Text category="s1" style={styles.sectionHeader}>
            {t('addProduct.generalInfo')}
          </Text>
          <Formik
            initialValues={{
              category: '',
              subcategory: '',
              units: '',
              isLiving: 'Living',
              name_en: '',
              description_en: '',
              name_ur: '',
              description_ur: '',
              price: '',
              totalQuantity: '1',
              minOrderQuantity: '1',
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
                  <Text style={styles.fieldLabel}>{t('addProduct.category')}</Text>
                  <Select
                    style={styles.select}
                    placeholder={t('addProduct.categoryPlaceholder')}
                    selectedIndex={categoryIndex}
                    value={categoryIndex !== null ? categoryOptions[categoryIndex.row] : t('addProduct.categoryPlaceholder')}
                    onSelect={index => {
                      setCategoryIndex(index);
                      setSubcategoryIndex(null);
                      setFieldValue('category', categoryOptions[index.row]);
                    }}>
                    {categoryOptions.map((cat, i) => (
                      <SelectItem key={i} title={cat} />
                    ))}
                  </Select>
                </Layout>
                {/* Sub Category */}
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.subCategory')}</Text>
                  <Select
                    style={styles.select}
                    placeholder={t('addProduct.subCategoryPlaceholder')}
                    selectedIndex={subcategoryIndex}
                    value={subcategoryIndex !== null ? subcategoryOptions[subcategoryIndex.row] : t('addProduct.subCategoryPlaceholder')}
                    onSelect={index => {
                      setSubcategoryIndex(index);
                      setFieldValue('subcategory', subcategoryOptions[index.row]);
                    }}
                    disabled={!selectedCategory}>
                    {subcategoryOptions.map((sub, i) => (
                      <SelectItem key={i} title={sub} />
                    ))}
                  </Select>
                </Layout>
                {/* Units */}
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.units')}</Text>
                  <Select
                    style={styles.select}
                    placeholder={t('addProduct.unitsPlaceholder')}
                    selectedIndex={unitIndex}
                    value={unitIndex !== null ? units[unitIndex.row] : t('addProduct.unitsPlaceholder')}
                    onSelect={index => {
                      setUnitIndex(index);
                      setFieldValue('units', units[index.row]);
                    }}>
                    {units.map((unit, i) => (
                      <SelectItem key={i} title={unit} />
                    ))}
                  </Select>
                </Layout>
                {/* Is Living */}
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.isLiving')}</Text>
                  <Select
                    style={styles.select}
                    placeholder={t('addProduct.isLivingPlaceholder')}
                    selectedIndex={isLivingIndex}
                    value={livingOptions[isLivingIndex]}
                    onSelect={index => {
                      setIsLivingIndex(index.row);
                      setFieldValue('isLiving', livingOptions[index.row]);
                    }}> 
                    {livingOptions.map((opt, i) => (
                      <SelectItem key={i} title={opt} />
                    ))}
                  </Select>
                </Layout>
                {/* Language Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, langTab === 'en' && styles.activeTab]}
                    onPress={() => setLangTab('en')}>
                    <Text style={langTab === 'en' ? styles.activeTabText : styles.tabText}>English</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, langTab === 'ur' && styles.activeTab]}
                    onPress={() => setLangTab('ur')}>
                    <Text style={langTab === 'ur' ? styles.activeTabText : styles.tabText}>Urdu</Text>
                  </TouchableOpacity>
                </View>
                {langTab === 'en' ? (
                  <>
                    <Layout style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>{t('addProduct.nameEN')}</Text>
                      <Input
                        style={styles.input}
                        textStyle={styles.inputText}
                        onChangeText={handleChange('name_en')}
                        onBlur={handleBlur('name_en')}
                        value={values.name_en}
                        placeholder={t('addProduct.nameENPlaceholder')}
                        placeholderTextColor="#BDBDBD"
                      />
                    </Layout>
                    <Layout style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>{t('addProduct.descriptionEN')}</Text>
                      <Input
                        multiline={true}
                        numberOfLines={8}
                        textAlignVertical="top"
                        style={[styles.input, styles.descriptionInput]}
                        textStyle={[styles.inputText, {paddingVertical: 10}]}
                        onChangeText={handleChange('description_en')}
                        onBlur={handleBlur('description_en')}
                        value={values.description_en}
                        placeholder={t('addProduct.descriptionENPlaceholder')}
                        placeholderTextColor="#BDBDBD"
                      />
                    </Layout>
                  </>
                ) : (
                  <>
                    <Layout style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>{t('addProduct.nameUR')}</Text>
                      <Input
                        style={styles.input}
                        textStyle={styles.inputText}
                        onChangeText={handleChange('name_ur')}
                        onBlur={handleBlur('name_ur')}
                        value={values.name_ur}
                        placeholder={t('addProduct.nameURPlaceholder')}
                        placeholderTextColor="#BDBDBD"
                      />
                    </Layout>
                    <Layout style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>{t('addProduct.descriptionUR')}</Text>
                      <Input
                        multiline={true}
                        numberOfLines={4}
                        style={[styles.input, styles.descriptionInput]}
                        textStyle={styles.inputText}
                        onChangeText={handleChange('description_ur')}
                        onBlur={handleBlur('description_ur')}
                        value={values.description_ur}
                        placeholder={t('addProduct.descriptionURPlaceholder')}
                        placeholderTextColor="#BDBDBD"
                      />
                    </Layout>
                  </>
                )}
                {/* Product Price and Stock */}
                <Text style={styles.sectionHeader}>{t('addProduct.productPriceAndStock')}</Text>
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.price')}</Text>
                  <Input
                    style={styles.input}
                    textStyle={styles.inputText}
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    value={values.price}
                    placeholder={t('addProduct.pricePlaceholder')}
                    placeholderTextColor="#BDBDBD"
                    keyboardType="numeric"
                  />
                </Layout>
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.totalQuantity')}</Text>
                  <Input
                    style={styles.input}
                    textStyle={styles.inputText}
                    onChangeText={handleChange('totalQuantity')}
                    onBlur={handleBlur('totalQuantity')}
                    value={values.totalQuantity}
                    placeholder={t('addProduct.totalQuantityPlaceholder')}
                    placeholderTextColor="#BDBDBD"
                    keyboardType="numeric"
                  />
                </Layout>
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.minOrderQuantity')}</Text>
                  <Input
                    style={styles.input}
                    textStyle={styles.inputText}
                    onChangeText={handleChange('minOrderQuantity')}
                    onBlur={handleBlur('minOrderQuantity')}
                    value={values.minOrderQuantity}
                    placeholder={t('addProduct.minOrderQuantityPlaceholder')}
                    placeholderTextColor="#BDBDBD"
                    keyboardType="numeric"
                  />
                </Layout>
                {/* Tags */}
                <Text style={styles.sectionHeader}>{t('addProduct.tags')}</Text>
                <Layout style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('addProduct.searchTags')}</Text>
                  <Input
                    style={styles.input}
                    textStyle={styles.inputText}
                    value={tagInput}
                    placeholder={t('addProduct.tagInputPlaceholder')}
                    placeholderTextColor="#BDBDBD"
                    onChangeText={handleTagInput}
                    onSubmitEditing={() => handleTagInput(tagInput + ',')}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  <View style={styles.tagsContainer}>
                    {tags.map((tag, i) => (
                      <View key={i} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(i)}>
                          <Text style={styles.tagRemove}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </Layout>
                {/* Media Upload */}
                <View style={styles.uploadBox}>
                  <TouchableOpacity style={styles.uploadTouchable} onPress={() => {/* trigger your image picker here */}}>
                    <Image source={require('../../../assets/new/icons/upload-icon.png')} style={styles.uploadIcon} />
                    <View style={styles.uploadTextBox}>
                      <Text style={styles.uploadText}>{t('addProduct.uploadMedia')}</Text>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.uploadHint}>{t('addProduct.uploadMediaHint')}</Text>
                </View>
                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>{t('addProduct.submitAd')}</Text>
                </TouchableOpacity>
              </Layout>
            )}
          </Formik>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  subTitle: {
    marginVertical: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 24,
    marginBottom: 8,
    color: '#acacac',
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
    color: '#121212',
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  select: {
    backgroundColor: 'transparent',
    background: 'transparent',
    borderColor: '#222',
    boxShadow: 'none',
    borderWidth: 1,
    borderRadius: 0,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#BDBDBD',
    borderWidth: 1,
    borderRadius: 2,
    marginHorizontal: 5,
    paddingVertical: 10,
    fontSize: 16,
    
  },
  inputText: {
    color: '#222',
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
    shadowOffset: { width: 0, height: 2 },
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
});
