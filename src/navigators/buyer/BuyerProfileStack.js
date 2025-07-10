import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreensHeader} from '../../components/buyer';

// Screens
import {BuyerProfileScreen} from '../../screens/buyer/BuyerProfileScreen';
import {UpdatePasswordScreen} from '../../screens/profile/UpdatePasswordScreen';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {UpdateProfileScreen} from '../../screens/profile/UpdateProfileScreen';
import {MyOrders} from '../../screens/buyer/product/MyOrders';
import {AddressListScreen} from '../../screens/profile/AddressListScreen';

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
        component={BuyerProfileScreen}
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
                      <MainScreensHeader
                        {...props}
                        hideSearch={false}
                        title="MyOrders"
                      />
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
    </Navigator>
  );
};
