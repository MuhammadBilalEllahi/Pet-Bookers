import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {ThemedIcon} from './Icon';

export const BackButton = ({onPress}) => {
  const {i18n} = useTranslation();
  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedIcon
        name={
          i18n.dir() === 'rtl' ? 'arrow-forward-outline' : 'arrow-back-outline'
        }
        fill="#fff"
        iconStyle={{
          width: 30,
          height: 30,
        }}
      />
    </TouchableOpacity>
  );
};
