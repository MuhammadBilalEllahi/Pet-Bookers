import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreensHeader} from '../../components/buyer';

// Screens
import {UnifiedProfileScreen} from '../../screens/profile/UnifiedProfileScreen';
import {UpdatePasswordScreen} from '../../screens/profile/UpdatePasswordScreen';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {UpdateProfileScreen} from '../../screens/profile/UpdateProfileScreen';
import {MyOrders} from '../../screens/buyer/product/MyOrders';
import {AddressListScreen} from '../../screens/profile/AddressListScreen';
import {AppSettingsScreen} from '../../screens/AppSettingsScreen';
import {SellerOptionsScreen} from '../../screens/buyer/SellerOptionsScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const BuyerProfileStack = () => {
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <ScreenHeaderSecondary {...props} />,
      }}
      initialRouteName="BuyerProfileMain">
      <Screen
        name="BuyerProfileMain"
        component={UnifiedProfileScreen}
        options={{
          header: props => (
            <MainScreensHeader {...props} title="Profile" hideSearch={true} />
          ),
        }}
      />
      <Screen
        name="MyOrders"
        component={MyOrders}
        options={{
          title: 'MyOrders',
          header: props => (
            <MainScreensHeader {...props} hideSearch={false} title="MyOrders" />
          ),
        }}
      />
      <Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
        options={{
          title: 'UpdateProfile',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={true}
              title="UpdateProfile"
            />
          ),
        }}
      />
      <Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{
          title: 'UpdatePassword',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={true}
              title="UpdatePassword"
            />
          ),
        }}
      />
      <Screen
        name="AddressList"
        component={AddressListScreen}
        options={{
          title: 'Manage Addresses',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={true}
              title="Manage Addresses"
            />
          ),
        }}
      />
      <Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'Settings',
          header: props => (
            <MainScreensHeader
              {...props}
              title="App Settings"
              hideSearch={true}
              activateGoBack={true}
              hideCart={true}
              hideWishlist={true}
              hideNotification={true}
              hideSettings={true}
            />
          ),
        }}
      />
      <Screen
        name="SellerOptions"
        component={SellerOptionsScreen}
        options={{
          title: 'Seller Options',
          header: props => (
            <MainScreensHeader
              {...props}
              title="Seller Options"
              hideSearch={true}
              activateGoBack={true}
              hideCart={true}
              hideWishlist={true}
              hideNotification={true}
              hideSettings={true}
            />
          ),
        }}
      />
    </Navigator>
  );
};
