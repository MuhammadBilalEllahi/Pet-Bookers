import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Pages
import {ChatScreen} from '../screens/ChatScreen';
import {MessagesScreen} from '../screens/MessagesScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const ChatNavigator = () => {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="RoomsList">
      <Screen name="RoomsList" component={ChatScreen} />
      <Screen name="Messages" component={MessagesScreen} />
    </Navigator>
  );
};
