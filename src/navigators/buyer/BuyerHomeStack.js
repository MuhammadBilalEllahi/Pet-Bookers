import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {MainScreensHeader} from '../../components/buyer';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {selectIfAnonymous} from '../../store/user';

// Screens
import {HomeMainScreen} from '../../screens/buyer/HomeMainScreen';
import {ProductDetailScreen} from '../../screens/buyer/ProductDetailScreen';
import {VandorsListScreen} from '../../screens/buyer/VandorsListScreen';
import {VandorDetailScreen} from '../../screens/buyer/VandorDetailScreen';
import {NotificationsScreen} from '../../screens/NotificationsScreen';
import {AppSettingsScreen} from '../../screens/AppSettingsScreen';
import {CategoriesListScreen} from '../../screens/buyer/CategoriesListScreen';
import {ProductsSearchScreen} from '../../screens/buyer/ProductsSearchScreen';
import {AuthRestrictedError} from '../../components/auth/AuthRestrictedError';

const {Navigator, Screen} = createNativeStackNavigator();

export const BuyerHomeStack = () => {
  const isAnonymous = useSelector(selectIfAnonymous);

  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <ScreenHeaderSecondary {...props} />,
      }}
      initialRouteName="HomeMainScreen">
      <Screen
        name="HomeMainScreen"
        component={HomeMainScreen}
        options={{
          header: props => <MainScreensHeader {...props} />,
        }}
      />
      <Screen name="ProductDetail" component={ProductDetailScreen} />
      <Screen
        name="ProductsSearch"
        component={ProductsSearchScreen}
        options={{
          title: 'ProductsSearch',
        }}
      />
      <Screen
        name="CategoriesList"
        component={CategoriesListScreen}
        options={{
          title: 'CategoriesList',
          header: props=>(<MainScreensHeader {...props }  
            activateGoBack={true}
            />)
        }}
      />
      <Screen
        name="VandorsList"
        component={VandorsListScreen}
        options={{
          title: 'VandorsList',
        }}
      />
      <Screen
        name="VandorDetail"
        component={VandorDetailScreen}
        options={{
          title: 'VandorDetail',
        }}
      />
      {isAnonymous ? (
        <Screen
          key="Notifications"
          name="Notifications"
          options={{
            title: 'Notifications',
          }}>
          {props => (
            <AuthRestrictedError {...props} subTitle="messages.loginRequired" />
          )}
        </Screen>
      ) : (
        <Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            title: 'Notifications',
          }}
        />
      )}
      <Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Navigator>
  );
};
