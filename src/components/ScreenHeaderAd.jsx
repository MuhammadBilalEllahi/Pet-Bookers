import {Dimensions, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Divider, Layout, Text, useTheme} from '@ui-kitten/components';
import {BackButton} from './BackButton';
import {setBottomTabBarVisibility} from '../store/configs';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';

const {width} = Dimensions.get('window');

export const ScreenHeaderAd = ({navigation, options, title}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const state = navigation.getState();
  const activeLocationName = options?.title || state.routeNames[state.index];

  const onGoBack = () => {
    navigation.goBack();
  };

  useFocusEffect(() => {
    dispatch(setBottomTabBarVisibility(false));
    return () => {
      dispatch(setBottomTabBarVisibility(true));
    };
  });

  return (
    <Layout
    style={{
        flexDirection:'column',
        
    }}>
        
    <Divider style={{ width: width, backgroundColor: '#acacac'}}/>
        <Layout
      style={[
        spacingStyles.p12,
        flexeStyles.row,
        flexeStyles.itemsCenter,
        
        {backgroundColor: 'white'},
      ]}>
      <BackButton onPress={onGoBack} iconName="close-outline"  fill='#acacac'/>
      <Layout style={[flexeStyles.grow1, flexeStyles.itemsCenter]}>
        <Text category="h6" style={styles.title}>
          {t(`pagesTitles.${title || activeLocationName}`)}
        </Text>
      </Layout>
      
    </Layout>
    <Divider style={{ width: width, backgroundColor: '#acacac'}}/>
    </Layout>
  );
};

const styles = StyleSheet.create({
  title: {
    color:'#acacac',
    textTransform: 'uppercase',
    marginLeft: -30,
  },
});
