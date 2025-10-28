import {Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {ScrollView, View, TouchableOpacity} from 'react-native';
import {FeaturedImages} from '../../components/buyer';
import {ProductsList} from '../../components/buyer/ProductsList';
import {HorizontalItemsList} from '../../components/listing';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../theme/ThemeContext';
import {ProductCardShimmer} from '../../components/ProductCardShimmer';
import {ThemedIcon} from '../../components/Icon';
import {
  loadFeaturedProducts,
  loadHomeBanners,
  loadLatestProducts,
  loadPopularProducts,
  loadSellers,
  selectFeaturedProducts,
  selectHomeBanners,
  selectLatestProducts,
  selectPopularProducts,
  selectSellers,
} from '../../store/buyersHome';
import {loadWishlist} from '../../store/wishlist';
import {
  loadProductCategories,
  loadProductsByCategory,
  selectProductCategories,
} from '../../store/productCategories';
import {BASE_URLS, selectBaseUrls} from '../../store/configs';
import {calculateDiscountedPrice} from '../../utils/products';
import {AppScreens} from '../../navigators/AppNavigator';
import {Image} from 'react-native';

export const HomeMainScreen = ({navigation}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {isDark} = useTheme();

  const baseUrls = useSelector(selectBaseUrls);
  const {homeBanners, homeBannersLoading, homeBannersError} =
    useSelector(selectHomeBanners);
  const {sellers, sellersLoading, sellersError} = useSelector(selectSellers);

  const {categories, categoriesLoading, categoriesError} = useSelector(
    selectProductCategories,
  );
  const {featuredProducts, featuredProductsLoading, featuredProductsError} =
    useSelector(selectFeaturedProducts);
  const {latestProducts, latestProductsLoading, latestProductsError} =
    useSelector(selectLatestProducts);
  const {popularProducts, popularProductsLoading, popularProductsError} =
    useSelector(selectPopularProducts);

  const navigateToProductDetail = (productId, slug) => {
    // console.log("[navigateToProductDetail]", productId, slug);
    navigation.navigate(AppScreens.PRODUCT_DETAIL_BUYER, {
      productId: productId,
      slug: slug,
    });
  };

  const navigateToVandorDetail = vandorId => {
    // console.log("[navigateToVandorDetail]", vandorId);
    navigation.navigate('VandorDetail', {sellerId: vandorId});
  };

  const navigateToProductsSearch = () => {
    navigation.navigate('ProductsSearch');
  };

  const navigateToAllCategoriesScreen = () =>
    navigation.navigate('CategoriesList');
  const navigateToAllVandorsScreen = () => {
    try {
      navigation.navigate('VandorsList');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToCategory = categoryId => {
    // Find the category by ID
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      // Navigate to CategoriesList with the selected category
      navigation.navigate('CategoriesList', {selectedCategoryId: categoryId});
    }
  };

  const navigateToAllProducts = (productType, title, categoryId) => {
    navigation.navigate(AppScreens.ALL_PRODUCTS, {
      productType,
      title,
      categoryId,
    });
  };

  const topCategories = useMemo(() => {
    return categories.map(item => ({
      id: item.id,
      name: item.name,
      image: `${BASE_URLS.category_image_url}/${item.icon}`,
    }));
  }, [baseUrls, categories]);

  const parsedProducts = useCallback(
    list => {
      if (!Array.isArray(list)) return [];
      // // console.log('list', list, "baseUrls", baseUrls['product_thumbnail_url']);
      return list.map(productItem => ({
        id: productItem.id,
        name: productItem.name,
        image: `${BASE_URLS.product_thumbnail_url}/${productItem.thumbnail}`,
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
        slug: productItem.slug,
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

  const handleLoadMoreCategory = useCallback(
    categoryName => {
      // console.log('handleLoadMoreCategory called for:', categoryName);

      // Find the category by name
      const category = categories.find(cat => cat.name === categoryName);
      if (!category) {
        // console.log('Category not found:', categoryName);
        return;
      }

      const existingProducts = categorizedProducts[categoryName] || [];
      const isLoading = categoryLoaders[categoryName];
      const totalSize = categoryTotals[categoryName] || 0;

      // console.log('Load more check:', {
      // categoryName,
      // existingProducts: existingProducts.length,
      // totalSize,
      // isLoading,
      // shouldLoad: existingProducts.length < totalSize && !isLoading
      // });

      // Check if we need to load more
      if (existingProducts.length < totalSize && !isLoading) {
        // console.log('Loading more products for:', categoryName, 'offset:', existingProducts.length);
        setCategoryLoaders(prev => ({...prev, [categoryName]: true}));

        dispatch(
          loadProductsByCategory({
            categoryId: category.id,
            limit: 10,
            offset: existingProducts.length,
          }),
        )
          .then(action => {
            // console.log('Load more response:', action.payload);
            const newData = action.payload;
            if (newData?.products) {
              const newProducts = parsedProducts(newData.products);
              // console.log('New products count:', newProducts.length);
              setCategorizedProducts(prev => ({
                ...prev,
                [categoryName]: [...(prev[categoryName] || []), ...newProducts],
              }));
            }
            setCategoryLoaders(prev => ({...prev, [categoryName]: false}));
          })
          .catch(error => {
            console.error('Error loading more category products:', error);
            setCategoryLoaders(prev => ({...prev, [categoryName]: false}));
          });
      } else {
        // console.log('Not loading more - conditions not met');
      }
    },
    [
      categorizedProducts,
      categoryLoaders,
      categoryTotals,
      categories,
      dispatch,
      parsedProducts,
    ],
  );

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

  const [categorizedProducts, setCategorizedProducts] = useState({});
  const [categoryLoaders, setCategoryLoaders] = useState({});
  const [categoryErrors, setCategoryErrors] = useState({});
  const [categoryTotals, setCategoryTotals] = useState({});

  const loadCategoryProducts = useCallback(
    (categoryId, categoryName) => {
      setCategoryLoaders(prev => ({...prev, [categoryName]: true}));
      dispatch(loadProductsByCategory({categoryId, limit: 10}))
        .then(response => {
          if (response?.payload?.products) {
            setCategorizedProducts(prev => ({
              ...prev,
              [categoryName]: parsedProducts(response.payload.products),
            }));
            setCategoryErrors(prev => ({...prev, [categoryName]: null}));
          }
        })
        .catch(err => {
          setCategoryErrors(prev => ({...prev, [categoryName]: err.message}));
        })
        .finally(() => {
          setCategoryLoaders(prev => ({...prev, [categoryName]: false}));
        });
    },
    [dispatch, parsedProducts],
  );

  useEffect(() => {
    dispatch(loadHomeBanners({bannerType: 'all'}));
    dispatch(loadProductCategories());
    dispatch(loadFeaturedProducts({limit: 10}));
    // dispatch(loadLatestProducts({limit: 10}));
    // dispatch(loadPopularProducts({limit: 10}));
    dispatch(loadSellers());
    dispatch(loadWishlist());
  }, []);

  //   useEffect(() => {
  //     console.debug("STARTING EFFECT ", categories)
  //   if (categories.length > 0) {
  //   const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

  //     sortedCategories.forEach(category => {
  //       // console.log("-ID ", category.id, " -Name ", category.name)
  //       loadCategoryProducts(category.id, category.name);
  //     });
  //   }
  // }, [categories]);

  useEffect(() => {
    if (categories.length > 0) {
      const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

      const loadAll = async () => {
        setCategoryLoaders(prev => {
          const loaders = {};
          sortedCategories.forEach(cat => (loaders[cat.name] = true));
          return {...prev, ...loaders};
        });

        try {
          const results = await Promise.all(
            sortedCategories.map(cat =>
              dispatch(loadProductsByCategory({categoryId: cat.id, limit: 10}))
                .then(response => ({
                  name: cat.name,
                  products: parsedProducts(response?.payload?.products || []),
                  total_size: response?.payload?.total_size || 0,
                }))
                .catch(error => ({
                  name: cat.name,
                  error: error?.message || 'Failed to load category',
                })),
            ),
          );

          const newData = {};
          const errors = {};
          const loaders = {};
          const totals = {};

          results.forEach(result => {
            if (result.error) {
              errors[result.name] = result.error;
              // console.log('Category error:', result.name, result.error);
            } else {
              newData[result.name] = result.products;
              totals[result.name] = result.total_size;
              // console.log('Category loaded:', result.name, 'products:', result.products.length, 'total:', result.total_size);
            }
            loaders[result.name] = false;
          });

          setCategorizedProducts(newData);
          setCategoryErrors(errors);
          setCategoryLoaders(loaders);
          setCategoryTotals(totals);
        } catch (err) {
          console.error('Error loading categories:', err);
        }
      };

      loadAll();
    }
  }, [categories]);

  const parsedSellers = useMemo(() => {
    if (!Array.isArray(sellers)) return [];
    // // console.log('sellers', sellers);
    return sellers.map(seller => ({
      id: seller.id,
      name: seller.name,
      image: `${baseUrls['shop_image_url']}/${seller.image}`,
    }));
  }, [baseUrls, sellers]);

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
          // backgroundColor: isDark ? '#121212' : 'white',
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
          onItemPress={navigateToCategory}
          onViewAll={navigateToAllCategoriesScreen}
        />
        <ProductsList
          list={parsedProducts(featuredProducts.products)}
          loading={featuredProductsLoading}
          loadingError={featuredProductsError}
          listTitle={t('featuredProducts')}
          containerStyle={{
            marginVertical: 0,
            paddingHorizontal: 14,
            // backgroundColor: isDark ? '#101426' : 'white',
          }}
          onProductDetail={(productId, slug) =>
            navigateToProductDetail(productId, slug)
          }
          onLoadMore={handleLoadMoreFeatured}
          hasMore={
            featuredProducts.products.length < featuredProducts.total_size
          }
          onViewAll={() =>
            navigateToAllProducts('featured', t('featuredProducts'))
          }
          productType="featured"
        />
        {/* <ProductsList
          list={parsedProducts(latestProducts.products)}
          loading={latestProductsLoading}
          loadingError={latestProductsError}
          listTitle={t('latest')}
          containerStyle={{
            marginVertical: 16,
            paddingHorizontal: 14,
            // backgroundColor: isDark ? '#101426' : 'white',
          }}
          onProductDetail={(productId, slug) => navigateToProductDetail(productId, slug)}
          onLoadMore={handleLoadMoreLatest}
          hasMore={latestProducts.products.length < latestProducts.total_size}
        /> */}
        {/* <ProductsList
          list={parsedProducts(popularProducts.products)}
          loading={popularProductsLoading}
          loadingError={popularProductsError}
          listTitle={t('popular')}
          containerStyle={{
            marginVertical: 16,
            paddingHorizontal: 14,
            //  backgroundColor: isDark ? '#101426' : 'white',
          }}
          onProductDetail={(productId, slug) => navigateToProductDetail(productId, slug)}
          onLoadMore={handleLoadMorePopular}
          hasMore={popularProducts.products.length < popularProducts.total_size}
        /> */}

        <CategoryWiseProductsList
          categorizedProducts={categorizedProducts}
          loadingMap={categoryLoaders}
          errorMap={categoryErrors}
          onProductDetail={(productId, slug) =>
            navigateToProductDetail(productId, slug)
          }
          onLoadMore={handleLoadMoreCategory}
          onViewAll={(categoryId, categoryName) =>
            navigateToAllProducts(null, categoryName, categoryId)
          }
          categories={categories}
          categoriesLoading={categoriesLoading}
          categoryTotals={categoryTotals}
          // onLoadMore={categoryName => {
          //   const category = categories.find(c => c.name === categoryName);
          //   if (category) {
          //     loadCategoryProducts(category.id, category.name);
          //   }
          // }}
        />
        <HorizontalItemsList
          containerStyle={{marginVertical: 10, paddingHorizontal: 14}}
          list={parsedSellers}
          listTitle={t('sellers.Sellers')}
          roundedImage={true}
          loading={sellersLoading}
          loadingError={sellersError}
          onItemPress={item => navigateToVandorDetail(item)}
          onViewAll={navigateToAllVandorsScreen}
        />
      </ScrollView>
    </Layout>
  );
};

export const CategoryWiseProductsList = ({
  categorizedProducts = {},
  loadingMap = {},
  errorMap = {},
  onProductDetail,
  onLoadMore,
  onViewAll,
  categories = [],
  categoriesLoading = false,
  categoryTotals = {},
}) => {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();

  // If categories are still loading, show nothing
  if (categoriesLoading) {
    return null;
  }

  // If categories are loaded but no categorized products yet, show all categories with shimmer
  if (categories.length > 0 && Object.keys(categorizedProducts).length === 0) {
    return (
      <View>
        {categories.map(category => (
          <View
            key={category.id}
            style={{marginVertical: 16, paddingHorizontal: 14}}>
            {/* Category Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
                marginBottom: 8,
              }}>
              <Text
                category="p1"
                style={{
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  fontSize: 15,
                  letterSpacing: 0.5,
                  color: isDark
                    ? theme['color-shadcn-foreground']
                    : theme['color-basic-900'],
                }}>
                {category.name}
              </Text>
              <TouchableOpacity
                style={{flexDirection: 'row', alignItems: 'center'}}
                activeOpacity={0.7}
                onPress={() =>
                  onViewAll && onViewAll(category.id, category.name)
                }>
                <Text
                  category="label"
                  style={{
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    fontSize: 15,
                    letterSpacing: 0.5,
                    color: theme['color-shadcn-primary'],
                  }}>
                  {t('viewAll')}
                </Text>
                <ThemedIcon
                  name="arrow-ios-forward-outline"
                  fill={theme['color-shadcn-primary']}
                  style={{marginLeft: 2}}
                />
              </TouchableOpacity>
            </View>

            {/* Shimmer Products */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
              }}>
              {[...Array(3)].map((_, idx) => (
                <ProductCardShimmer
                  key={idx}
                  shimmerColors={
                    isDark
                      ? [
                          theme['color-shadcn-card'],
                          theme['color-shadcn-secondary'],
                          theme['color-shadcn-card'],
                        ]
                      : [
                          theme['color-basic-200'],
                          theme['color-basic-300'],
                          theme['color-basic-200'],
                        ]
                  }
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Show actual categorized products
  return (
    <View>
      {Object.entries(categorizedProducts).map(([categoryName, products]) => {
        // Find category ID for navigation
        const category = categories.find(cat => cat.name === categoryName);
        const isLoading = loadingMap[categoryName];
        const totalSize = categoryTotals[categoryName] || 0;

        // Check if there are more products to load
        const hasMore = products.length < totalSize && !isLoading;

        // console.log('CategoryWiseProductsList:', {
        //   categoryName,
        //   productsCount: products.length,
        //   totalSize,
        //   isLoading,
        //   hasMore
        // });

        return (
          <ProductsList
            key={categoryName}
            list={products}
            loading={isLoading}
            loadingError={errorMap[categoryName]}
            listTitle={categoryName}
            containerStyle={{marginVertical: 16, paddingHorizontal: 14}}
            onProductDetail={onProductDetail}
            onLoadMore={() => onLoadMore(categoryName)}
            hasMore={hasMore}
            onViewAll={() => onViewAll && onViewAll(category?.id, categoryName)}
            categoryId={category?.id}
          />
        );
      })}
    </View>
  );
};
