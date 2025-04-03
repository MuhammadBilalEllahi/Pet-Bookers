import {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Avatar,
  Button,
  Card,
  Layout,
  Modal,
  Text,
  useTheme,
} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

const availableLanguages = [
  {
    key: 'en',
    name: 'English',
    flag: require('../../../assets/us-flag.png'),
  },
  {key: 'ur', name: 'اردو', flag: require('../../../assets/pakistan-flag.png')},
];

export const LanguageSwitcher = ({visible, onCloseModal, selectedLanguage}) => {
  const theme = useTheme();
  const {t, i18n} = useTranslation();
  const [selectedLang, setSelectedLang] = useState(selectedLanguage);

  const saveLanguage = () => {
    if (selectedLang !== selectedLanguage) {
      i18n.changeLanguage(selectedLang);
      AsyncStorage.setItem('user-language', selectedLang);
    }
    onCloseModal();
  };

  useEffect(() => {
    setSelectedLang(selectedLanguage);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      backdropStyle={styles.backdrop}
      style={[styles.modalContainer, spacingStyles.p16]}
      onBackdropPress={onCloseModal}>
      <Layout
        style={[flexeStyles.row, flexeStyles.itemsCenter, styles.modalHeader]}>
        <Text category="h6" style={styles.modalTitle}>
          {t('changeLanguage')}
        </Text>
        <Button
          appearance="ghost"
          size="tiny"
          accessoryLeft={<ThemedIcon name="close-outline" />}
          onPress={onCloseModal}
        />
      </Layout>
      <Layout>
        {availableLanguages.map(langItem => (
          <Card
            key={langItem.key}
            disabled={selectedLang === langItem.key}
            style={[
              styles.languageOption,
              selectedLang === langItem.key && {
                borderColor: theme['color-primary-default'],
                backgroundColor: theme['color-primary-100'],
              },
            ]}
            onPress={() => setSelectedLang(langItem.key)}>
            <Layout style={[flexeStyles.row, flexeStyles.itemsCenter]}>
              <Avatar
                source={langItem.flag}
                style={{
                  borderWidth: 1,
                  borderColor: theme['color-basic-500'],
                }}
              />
              <Text category="s1" style={{marginLeft: 8}}>
                {langItem.name}
              </Text>
            </Layout>
          </Card>
        ))}
      </Layout>
      <Layout style={[styles.cancelButton, flexeStyles.row]}>
        <Button onPress={onCloseModal} appearance="outline" size="small">
          {t('buttons.cancel')}
        </Button>
        <Button onPress={saveLanguage} size="small" style={styles.saveButton}>
          {t('buttons.save')}
        </Button>
      </Layout>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    minWidth: 300,
  },
  modalHeader: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {flexGrow: 1, textAlign: 'center'},
  languageOption: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  cancelButton: {
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  saveButton: {paddingHorizontal: 36, marginLeft: 10},
});
