import React from 'react'
import { View } from 'react-native'
import { Divider } from '@ui-kitten/components'

import { useTranslation } from 'react-i18next'
import { AppScreens } from '../../../../navigators/AppNavigator'
import { ProfileActionButton } from '../../../../components/profile'
import { useTheme } from '../../../../theme/ThemeContext'


const BuyerOptionInSellerPRofile = ({navigation}) => {
    const { t } = useTranslation()
    const { isDark, theme } = useTheme()

    

    const navigateToOrdersList = () => {
        navigation.navigate(AppScreens.CART);
      };
     
      const navigateToMyWishlist = () => {
        navigation.navigate(AppScreens.MY_WISHLIST);
      };
      
      const navigateToMyOrderList = () => {
        navigation.navigate(AppScreens.MY_ORDER_LIST);
      };
    

    
        return (
        <View style={
          {
            backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],          flex: 1,
            overflow: 'scroll',
          }
        }>
                      <ProfileActionButton
            title={t('profile.cart')}
            subtitle={t('profile.cartSubtitle')}
            iconName="shopping-cart-outline"
            onPress={navigateToOrdersList}
          />
           <ProfileActionButton
            title={t('profile.myOrders')}
            subtitle={t('profile.myOrdersSubtitle')}
            iconName="map-outline"
            onPress={navigateToMyOrderList}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
         
            
            
            <ProfileActionButton
              title={t('profile.favoritesAds')}
              subtitle={t('profile.favoritesAdsSubtitle')}
              iconName="heart"
              onPress={navigateToMyWishlist}
            />


        </View>
    )
}

export default BuyerOptionInSellerPRofile;