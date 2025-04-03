import {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {
  Button,
  CheckBox,
  Input,
  Layout,
  Modal,
  Select,
  SelectItem,
  Text,
  useTheme,
} from '@ui-kitten/components';
import {ThemedIcon} from '../Icon';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';

const petCategories = [
  {
    id: 1,
    name: 'Dogs',
    hasSubCategories: true,
    subcategories: [
      {
        id: 2,
        name: 'Small Breeds',
        hasSubCategories: false,
        subcategories: [],
      },
      {
        id: 3,
        name: 'Medium Breeds',
        hasSubCategories: false,
        subcategories: [],
      },
      {
        id: 4,
        name: 'Large Breeds',
        hasSubCategories: false,
        subcategories: [],
      },
    ],
  },
  {
    id: 5,
    name: 'Cats',
    hasSubCategories: true,
    subcategories: [
      {
        id: 6,
        name: 'Indoor Cats',
        hasSubCategories: false,
        subcategories: [],
      },
      {
        id: 7,
        name: 'Outdoor Cats',
        hasSubCategories: false,
        subcategories: [],
      },
    ],
  },
  {
    id: 8,
    name: 'Fish',
    hasSubCategories: false,
    subcategories: [],
  },
  {
    id: 9,
    name: 'Birds',
    hasSubCategories: false,
    subcategories: [],
  },
  {
    id: 10,
    name: 'Reptiles',
    hasSubCategories: false,
    subcategories: [],
  },
];

export const ProductsFilterModal = ({visible, onCloseModal}) => {
  const theme = useTheme();
  const [openCategories, setOpenCategories] = useState([]);

  const toggleCatagory = categoryId => {
    const allCategories = [...openCategories];
    const categoryIndex = allCategories.findIndex(item => item === categoryId);
    if (categoryIndex === -1) {
      allCategories.push(categoryId);
    } else {
      allCategories.splice(categoryIndex, 1);
    }
    setOpenCategories(allCategories);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      style={styles.modalContainer}
      onBackdropPress={onCloseModal}>
      <Layout
        style={[
          flexeStyles.row,
          flexeStyles.itemsCenter,
          flexeStyles.contentBetween,
          spacingStyles.px16,
          spacingStyles.py8,
        ]}>
        <Text category="h6" style={styles.modalTitle}>
          Filter
        </Text>
        <Button
          appearance="ghost"
          size="tiny"
          accessoryLeft={<ThemedIcon name="close-outline" />}
          onPress={onCloseModal}
        />
      </Layout>
      <ScrollView
        style={[
          spacingStyles.p16,
          {
            paddingBottom: 90,
          },
        ]}>
        <Text appearance="hint" style={styles.inputLabel}>
          Sort By
        </Text>
        <Select placeholder="Sort By">
          <SelectItem title="Option 1" />
          <SelectItem title="Option 2" />
          <SelectItem title="Option 3" />
        </Select>
        <Text appearance="hint" style={[styles.inputLabel, styles.mt16]}>
          Filter By
        </Text>
        <Select placeholder="Filter By">
          <SelectItem title="Option 1" />
          <SelectItem title="Option 2" />
          <SelectItem title="Option 3" />
        </Select>

        <Layout
          style={[
            flexeStyles.row,
            flexeStyles.itemsCenter,
            flexeStyles.contentBetween,
            styles.mt16,
          ]}>
          <Input
            placeholder="Min"
            label="Min Price"
            style={{width: '40%'}}
            keyboardType="decimal-pad"
          />
          <Text
            style={[
              styles.mt16,
              {
                marginHorizontal: 8,
                backgroundColor: theme['text-hint-color'],
                height: 1.5,
                width: 20,
              },
            ]}
          />
          <Input
            placeholder="Max"
            label="Max Price"
            style={{width: '40%'}}
            keyboardType="decimal-pad"
          />
          <Button
            size="tiny"
            appearance="ghost"
            style={{marginLeft: 8, marginTop: 20}}
            accessoryLeft={
              <ThemedIcon
                name="close-outline"
                iconStyle={{width: 20, height: 20}}
              />
            }
          />
        </Layout>
        <Layout style={{marginVertical: 16}}>
          <Text appearance="hint" style={styles.inputLabel}>
            Categories
          </Text>
          {petCategories.map((category, index) => {
            const categoryOpened = openCategories.some(
              item => item === category.id,
            );
            return (
              <Layout
                key={index}
                style={[
                  styles.categoryOptionContainer,
                  {
                    borderColor: theme['color-basic-400'],
                  },
                ]}>
                <Layout
                  style={[
                    flexeStyles.row,
                    flexeStyles.itemsCenter,
                    flexeStyles.contentBetween,
                  ]}>
                  <CheckBox style={styles.categoryOption}>
                    {category.name}
                  </CheckBox>
                  {category.hasSubCategories && (
                    <Button
                      appearance="ghost"
                      size="tiny"
                      accessoryLeft={
                        <ThemedIcon
                          name={
                            categoryOpened ? 'minus-outline' : 'plus-outline'
                          }
                          iconStyle={{width: 18, height: 18}}
                        />
                      }
                      onPress={() => toggleCatagory(category.id)}
                    />
                  )}
                </Layout>
                {category.hasSubCategories && (
                  <Layout
                    style={[
                      {marginLeft: 16, display: 'none'},
                      categoryOpened && {
                        display: 'flex',
                      },
                    ]}>
                    {category.subcategories.map(subCategory => (
                      <CheckBox
                        key={subCategory.id}
                        style={styles.categoryOption}>
                        {subCategory.name}
                      </CheckBox>
                    ))}
                  </Layout>
                )}
              </Layout>
            );
          })}
        </Layout>
      </ScrollView>
      <Layout
        style={[
          flexeStyles.row,
          flexeStyles.itemsCenter,
          styles.actionBar,
          spacingStyles.px16,
          spacingStyles.py8,
        ]}>
        <Button appearance="outline" style={styles.resetButton}>
          RESET
        </Button>
        <Button style={styles.saveButton}>APPLY</Button>
      </Layout>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    position: 'absolute',
    top: '30%',
    bottom: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputLabel: {marginBottom: 4, fontSize: 12, fontWeight: '500'},
  modalTitle: {flexGrow: 1, textAlign: 'center'},
  categoryOptionContainer: {
    borderBottomWidth: 1,
    marginBottom: 4,
    paddingBottom: 4,
  },
  categoryOption: {
    marginVertical: 4,
  },
  mt16: {
    marginTop: 16,
  },
  actionBar: {
    marginBottom: 30,
  },
  resetButton: {width: '35%', borderRadius: 100},
  saveButton: {flexGrow: 1, marginLeft: 8, borderRadius: 100},
});
