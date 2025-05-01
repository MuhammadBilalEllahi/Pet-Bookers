import {Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Dimensions} from 'react-native';
import {useState} from 'react';
import CategoryGrid from './components/CategoryGrid';
import SubCategoryGrid from './components/SubCategoryGrid';
import {selectBaseUrls} from '../../../store/configs';
import {selectProductCategories} from '../../../store/productCategories';

const {width: windowWidth} = Dimensions.get('screen');

export const CategoriesListScreen = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const baseUrls = useSelector(selectBaseUrls);
  const {categories} = useSelector(selectProductCategories);

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Helper for grid item size
  const itemSize = (windowWidth - 60) / 2;

  return (
    <Layout style={{flex: 1, backgroundColor: '#fff', padding: 16}}>
      {selectedCategory === null ? (
        <>
          <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 16}}>
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
          baseUrl={baseUrls['category_image_url']}
          t={t}
        />
      )}
    </Layout>
  );
};
