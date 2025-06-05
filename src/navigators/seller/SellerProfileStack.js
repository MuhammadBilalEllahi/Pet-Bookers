import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreensHeader} from '../../components/buyer';

// Screens
import {SellerProfileScreen} from '../../screens/seller/profile/SellerProfileScreen';
import {UpdatePasswordScreen} from '../../screens/profile/UpdatePasswordScreen';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {UpdateProfileScreen} from '../../screens/profile/UpdateProfileScreen';
import {MyOrders} from '../../screens/buyer/product/MyOrders';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerProfileStack = () => {
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <ScreenHeaderSecondary {...props} />,
      }}
      initialRouteName="SellerProfileMain">
      <Screen
        name="SellerProfileMain"
        component={SellerProfileScreen}
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
        }}
      />
      <Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
        options={{
          title: 'UpdateProfile',
        }}
      />
      <Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{
          title: 'UpdatePassword',
        }}
      />
    </Navigator>
  );
};
