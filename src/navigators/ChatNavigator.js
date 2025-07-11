import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Pages
import {ChatScreen} from '../screens/ChatScreen';
import {MessagesScreen} from '../screens/MessagesScreen';
import { MainScreensHeader } from '../components/buyer';

const {Navigator, Screen} = createNativeStackNavigator();

export const ChatRoutes = Object.freeze({
  ROOMS_LIST: 'RoomsList',
  MESSAGES: 'Messages'
});

export const ChatNavigator = () => {
  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
                  contentStyle: { backgroundColor: 'white' }

      }}
      initialRouteName={ChatRoutes.ROOMS_LIST}>
      <Screen name={ChatRoutes.ROOMS_LIST} component={ChatScreen}
      options={{
        header: props=><MainScreensHeader {...props}/>
      }} />
        <Screen name={ChatRoutes.MESSAGES} component={MessagesScreen} 
      options={{
        header: props=><MainScreensHeader {...props}/>
      }}
      />
    </Navigator>
  );
};
