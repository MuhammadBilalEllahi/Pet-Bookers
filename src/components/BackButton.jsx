import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {ThemedIcon} from './Icon';

export const BackButton = ({onPress, fill='#fff', iconName}) => {
  const {i18n} = useTranslation();
  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedIcon
        name={
            iconName || (i18n.dir() === 'rtl' ? 'arrow-forward-outline' : 'arrow-back-outline')
        }
        fill={fill}
        iconStyle={{
          width: 30,
          height: 30,
        }}
      />
    </TouchableOpacity>
  );
};
