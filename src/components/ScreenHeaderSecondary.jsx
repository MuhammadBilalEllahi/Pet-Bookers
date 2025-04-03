import {StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {Layout, Text, useTheme} from '@ui-kitten/components';
import {BackButton} from './BackButton';
import {setBottomTabBarVisibility} from '../store/configs';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';

export const ScreenHeaderSecondary = ({navigation, options, title}) => {
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
      style={[
        spacingStyles.p8,
        flexeStyles.row,
        flexeStyles.itemsCenter,
        {backgroundColor: theme['color-primary-default']},
      ]}>
      <BackButton onPress={onGoBack} />
      <Layout style={[flexeStyles.grow1, flexeStyles.itemsCenter]}>
        <Text category="h6" style={styles.title}>
          {t(`pagesTitles.${title || activeLocationName}`)}
        </Text>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  title: {
    color: '#fff',
    textTransform: 'uppercase',
    marginLeft: -30,
  },
});
