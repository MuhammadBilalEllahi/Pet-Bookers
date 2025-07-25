import React, {Suspense, useEffect, useMemo} from 'react';
import {SafeAreaView, I18nManager, ActivityIndicator, View, StatusBar} from 'react-native';
import {Provider as StoreProvider, useDispatch} from 'react-redux';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {useTranslation} from 'react-i18next';
import * as eva from '@eva-design/eva';
import {default as mapping} from './mapping.json';
import {AppNavigator} from './src/navigators/AppNavigator';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateDayjsLocale from 'dayjs/plugin/updateLocale';
import {store} from './src/store';
import 'dayjs/locale/en';
import 'dayjs/locale/ur';

import './src/locale';
import {flexeStyles} from './src/utils/globalStyles';
import { SplashScreen } from './src/screens/SplashScreen';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';

dayjs.extend(calendar);
dayjs.extend(localizedFormat);
dayjs.extend(updateDayjsLocale);
dayjs.updateLocale('en', {
  calendar: {
    sameDay: 'h:mm A',
    lastDay: '[Yesterday]',
    lastWeek: 'dddd',
    sameElse: 'DD/MM/YYYY',
  },
});
dayjs.updateLocale('ur', {
  formats: {
    lll: 'D MMMM, YYYY h:mm A',
  },
  calendar: {
    sameDay: 'hh:mm A',
    lastDay: 'کل',
    lastWeek: 'dddd',
    sameElse: 'DD/MM/YYYY',
  },
});

const AppContent = () => {
  const {theme, isDark} = useTheme();
  const {i18n} = useTranslation();

  useEffect(() => {
    I18nManager.forceRTL(i18n.language === 'ur');
    dayjs.locale(i18n.language);
    const langChangeSub = i18n.on('languageChanged', newLang => {
      dayjs.locale(newLang);
      I18nManager.forceRTL(newLang === 'ur');
    });

    return () => {
      langChangeSub && langChangeSub();
    };
  }, []);

  return (
    <SafeAreaView style={{flex: 1, direction: i18n.dir()}}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme['background-basic-color-1']}
      />
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider
        {...eva}
        theme={theme}
        customMapping={mapping}>
        <AppNavigator />
      </ApplicationProvider>
      <Toast />
    </SafeAreaView>
  );
};

export default function Root() {
  return (
    <StoreProvider store={store}>
      <ThemeProvider>
        <Suspense fallback={<SplashScreen/>}>
          <AppContent />
        </Suspense>
      </ThemeProvider>
    </StoreProvider>
  );
};
