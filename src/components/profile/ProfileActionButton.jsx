import {useTranslation} from 'react-i18next';
import {Text, Icon} from '@ui-kitten/components';
import {useTheme} from '../../theme/ThemeContext';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {spacingStyles} from '../../utils/globalStyles';

export const ProfileActionButton = ({
  title,
  subtitle,
  rightTitle,
  iconName,
  rightIconName,
  onPress,
  disabled = false,
  rightButton = null,
}) => {
  const {theme, isDark} = useTheme();
  const {i18n} = useTranslation();
  return (
    <TouchableOpacity 
      style={[
        styles.actionRow,
        spacingStyles.px32,
        { 
          borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300'],
          opacity: disabled ? 0.5 : 1
        }
      ]} 
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={[
        styles.actionIconCircle,
        { 
          backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
        }
      ]}>
        <Icon 
          name={iconName} 
          fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']} 
          style={{ width: 22, height: 22 }} 
        />
      </View>
      <View style={styles.actionTextContainer}>
        <Text style={[
          styles.actionTitle,
          { 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }
        ]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[
            styles.actionSubtitle,
            { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }
          ]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightButton ? (
        rightButton
      ) : (
        <View style={[
          styles.actionArrowBox,
          { 
            backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
          }
        ]}>
          <Icon
            name={rightIconName
              ? rightIconName
              : i18n.dir() === 'rtl'
              ? 'arrow-ios-back-outline'
              : 'arrow-ios-forward'}
            fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
            style={{ width: 18, height: 18 }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  actionArrowBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
