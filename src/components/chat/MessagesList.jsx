import {FlatList} from 'react-native';
import {SingleMessage} from './SingleMessage';

export const MessagesList = ({messagesList}) => {
  return (
    <FlatList
      data={messagesList}
      contentContainerStyle={{flexGrow: 1, padding: 10}}
      showsVerticalScrollIndicator={false}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => <SingleMessage {...item} />}
      inverted={true}
    />
  );
};
