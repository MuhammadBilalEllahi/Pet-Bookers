import {Dimensions, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Divider, Layout, Text} from '@ui-kitten/components';
import {BackButton} from './BackButton';
import {setBottomTabBarVisibility} from '../store/configs';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';
import {useTheme} from '../theme/ThemeContext';

const {width} = Dimensions.get('window');

export const ScreenHeaderAd = ({navigation, options, title}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const {theme, isDark} = useTheme();
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
        flexDirection: 'column',
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
    }}>
      <Divider style={{width: width, backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']}} />
        <Layout
      style={[
        spacingStyles.p12,
        flexeStyles.row,
        flexeStyles.itemsCenter,
          {backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']},
      ]}>
        <BackButton
          onPress={onGoBack}
          iconName="close-outline"
          fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-600']}
        />
      <Layout style={[flexeStyles.grow1, flexeStyles.itemsCenter]}>
          <Text 
            category="h6" 
            style={[
              styles.title, 
              {color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']}
            ]}>
          {t(`pagesTitles.${title || activeLocationName}`)}
        </Text>
      </Layout>
    </Layout>
      <Divider style={{width: width, backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']}} />
    </Layout>
  );
};

const styles = StyleSheet.create({
  title: {
    textTransform: 'uppercase',
    marginLeft: -30,
  },
});
