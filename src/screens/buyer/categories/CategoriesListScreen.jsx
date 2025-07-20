import React from 'react';
import {Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {useSelector, useDispatch} from 'react-redux';
import {Dimensions} from 'react-native';
import {useState, useEffect} from 'react';
import CategoryGrid from './components/CategoryGrid';
import SubCategoryGrid from './components/SubCategoryGrid';
import {selectBaseUrls} from '../../../store/configs';
import {selectProductCategories} from '../../../store/productCategories';
import {useTheme} from '../../../theme/ThemeContext';
import {loadWishlist} from '../../../store/wishlist';
import {useFocusEffect} from '@react-navigation/native';

const {width: windowWidth} = Dimensions.get('screen');

export const CategoriesListScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {theme, isDark} = useTheme();
  const baseUrls = useSelector(selectBaseUrls);
  const {categories} = useSelector(selectProductCategories);
  const dispatch = useDispatch();

  // Get selectedCategoryId from route params
  const selectedCategoryId = route?.params?.selectedCategoryId;
  
  // Initialize selectedCategory based on route params
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (selectedCategoryId) {
      const categoryIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
      return categoryIndex >= 0 ? categoryIndex : null;
    }
    return null;
  });

  // Helper for grid item size
  const itemSize = (windowWidth - 60) / 2;
  
  // Load wishlist when component mounts and when screen comes into focus
  useEffect(() => {
    dispatch(loadWishlist());
  }, [dispatch]);
  
  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadWishlist());
    }, [dispatch])
  );
  
  // Update selectedCategory when categories load and selectedCategoryId is provided
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      const categoryIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
      if (categoryIndex >= 0) {
        setSelectedCategory(categoryIndex);
      }
    }
  }, [selectedCategoryId, categories]);

  return (
    <Layout style={{
      flex: 1, 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'], 
      padding: 16
    }}>
      {selectedCategory === null ? (
        <>
          <Text style={{
            fontWeight: 'bold', 
            fontSize: 18, 
            marginBottom: 16,
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }}>
            {t('Categories')}
          </Text>
          <CategoryGrid
            categories={categories}
            onSelect={setSelectedCategory}
            itemSize={itemSize}
            baseUrl={baseUrls['category_image_url']}
          />
        </>
      ) : (
        <SubCategoryGrid
          subcategories={categories[selectedCategory].childes}
          onBack={() => setSelectedCategory(null)}
          categoryName={categories[selectedCategory].name}
          categoryId={selectedCategory}
          baseUrl={baseUrls['category_image_url']}
          t={t}
          navigation={navigation}
        />
      )}
    </Layout>
  );
};
