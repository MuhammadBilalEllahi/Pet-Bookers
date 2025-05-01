import {Layout} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {FeaturedImages} from '../../components/buyer';
import {ProductsList} from '../../components/buyer/ProductsList';
import {HorizontalItemsList} from '../../components/listing';
import {useCallback, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  loadFeaturedProducts,
  loadHomeBanners,
  loadLatestProducts,
  loadPopularProducts,
  selectFeaturedProducts,
  selectHomeBanners,
  selectLatestProducts,
  selectPopularProducts,
} from '../../store/buyersHome';
import {
  loadProductCategories,
  selectProductCategories,
} from '../../store/productCategories';
import {selectBaseUrls} from '../../store/configs';
import {calculateDiscountedPrice} from '../../utils/products';

const sellersList = [
  {
    id: 1,
    name: 'new shop',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-04-01-6427fce278064.png',
  },
  {
    id: 2,
    name: 'new shop 2',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-04-17-643d40afb34e7.png',
  },
  {
    id: 3,
    name: 'model pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-04-30-644e3d653810e.png',
  },
  {
    id: 4,
    name: 'us pets farm',
    image:
      'https://petbookie.com/storage/app/public/shop/2023-05-01-644fc3645f5ad.png',
  },
];

export const HomeMainScreen = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const baseUrls = useSelector(selectBaseUrls);
  const {homeBanners, homeBannersLoading, homeBannersError} =
    useSelector(selectHomeBanners);

  const {categories, categoriesLoading, categoriesError} = useSelector(
    selectProductCategories,
  );
  const {featuredProducts, featuredProductsLoading, featuredProductsError} =
    useSelector(selectFeaturedProducts);
  const {latestProducts, latestProductsLoading, latestProductsError} =
    useSelector(selectLatestProducts);
  const {popularProducts, popularProductsLoading, popularProductsError} =
    useSelector(selectPopularProducts);

  const navigateToProductDetail = productId => {
    navigation.navigate('ProductDetail');
  };

  const navigateToVandorDetail = vandorId => {
    navigation.navigate('VandorDetail');
  };

  const navigateToProductsSearch = () => {
    navigation.navigate('ProductsSearch');
  };

  const navigateToAllCategoriesScreen = () =>
    navigation.navigate('CategoriesList');
  const navigateToAllVandorsScreen = () => navigation.navigate('VandorsList');

  const topCategories = useMemo(() => {
    return categories.map(item => ({
      id: item.id,
      name: item.name,
      image: `${baseUrls['category_image_url']}/${item.icon}`,
    }));
  }, [baseUrls, categories]);

  const parsedProducts = useCallback(
    list => {
      if (!Array.isArray(list)) return [];
      return list.map(productItem => ({
        id: productItem.id,
        name: productItem.name,
        image: `${baseUrls['product_thumbnail_url']}/${productItem.thumbnail}`,
        price:
          productItem.discount > 0
            ? calculateDiscountedPrice(
                productItem.unit_price,
                productItem.discount,
                productItem.discount_type,
              )
            : productItem.unit_price,
        oldPrice: productItem.discount > 0 ? productItem.unit_price : 0,
        isSoldOut: productItem.current_stock === 0,
        discountType: productItem.discount_type,
        discount: productItem.discount,
        rating: 0,
      }));
    },
    [baseUrls],
  );

  const handleLoadMoreFeatured = () => {
    if (
      featuredProducts.products.length < featuredProducts.total_size &&
      !featuredProductsLoading
    ) {
      dispatch(
        loadFeaturedProducts({
          limit: featuredProducts.limit,
          offset: featuredProducts.products.length,
        }),
      );
    }
  };

  const handleLoadMoreLatest = () => {
    if (
      latestProducts.products.length < latestProducts.total_size &&
      !latestProductsLoading
    ) {
      dispatch(
        loadLatestProducts({
          limit: latestProducts.limit,
          offset: latestProducts.products.length,
        }),
      );
    }
  };

  const handleLoadMorePopular = () => {
    if (
      popularProducts.products.length < popularProducts.total_size &&
      !popularProductsLoading
    ) {
      dispatch(
        loadPopularProducts({
          limit: popularProducts.limit,
          offset: popularProducts.products.length,
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(loadHomeBanners({bannerType: 'all'}));
    dispatch(loadProductCategories());
    dispatch(loadFeaturedProducts({limit: 10}));
    dispatch(loadLatestProducts({limit: 10}));
    dispatch(loadPopularProducts({limit: 10}));
  }, []);

  return (
    <Layout level="3" style={{flex: 1}}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingTop: 10,
          paddingBottom: 90,
        }}>
        <FeaturedImages
          slideList={homeBanners}
          loading={homeBannersLoading}
          error={homeBannersError}
        />
        <HorizontalItemsList
          containerStyle={{marginVertical: 16}}
          list={topCategories}
          loading={categoriesLoading}
          loadingError={categoriesError}
          listTitle={t('categories')}
          roundedImage={true}
          onItemPress={navigateToProductsSearch}
          onViewAll={navigateToAllCategoriesScreen}
        />
        <ProductsList
          list={parsedProducts(featuredProducts.products)}
          loading={featuredProductsLoading}
          loadingError={featuredProductsError}
          listTitle={t('featuredProducts')}
          containerStyle={{marginVertical: 0,paddingHorizontal: 14}}
          onProductDetail={navigateToProductDetail}
          onLoadMore={handleLoadMoreFeatured}
          hasMore={featuredProducts.products.length < featuredProducts.total_size}
        />
        <ProductsList
          list={parsedProducts(latestProducts.products)}
          loading={latestProductsLoading}
          loadingError={latestProductsError}
          listTitle={t('latest')}
          containerStyle={{marginVertical: 16,paddingHorizontal: 14}}
          onProductDetail={navigateToProductDetail}
          onLoadMore={handleLoadMoreLatest}
          hasMore={latestProducts.products.length < latestProducts.total_size}
        />
        <ProductsList
          list={parsedProducts(popularProducts.products)}
          loading={popularProductsLoading}
          loadingError={popularProductsError}
          listTitle={t('popular')}
          containerStyle={{marginVertical: 16, paddingHorizontal: 14}}
          onProductDetail={navigateToProductDetail}
          onLoadMore={handleLoadMorePopular}
          hasMore={popularProducts.products.length < popularProducts.total_size}
        />
        <HorizontalItemsList
          containerStyle={{marginVertical: 10, paddingHorizontal: 14}}
          list={sellersList}
          listTitle={t('sellers')}
          roundedImage={true}
          onItemPress={navigateToVandorDetail}
          onViewAll={navigateToAllVandorsScreen}
        />
      </ScrollView>
    </Layout>
  );
};
