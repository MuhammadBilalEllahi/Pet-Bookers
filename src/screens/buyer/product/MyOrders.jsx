import { Layout, Text } from '@ui-kitten/components'
import React from 'react'
import { Button, Icon, FlatList } from 'react-native'
import { AppScreens } from '../../../navigators/AppNavigator'
import { useTheme } from '../../../theme/ThemeContext'

export const MyOrders = ({navigation}) => {
  const {theme, isDark}  = useTheme();
  return (
    <Layout style={{backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
      <Text>MyOrders</Text>
      
      <FlatList
        data={[]}
        renderItem={({item}) => <Text>{item.name}</Text>}
      />
    </Layout>
  )
}