import {createSelector, createSlice} from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  conversationsLoading: true,
  conversationsError: null,
  activeRoomId: null,
  activeRoomMessages: [],
  activeRoomMessagesLoading: false,
  activeRoomMessagesFailed: null,
  activeRecipient: null,
};

const slice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, {payload}) => {
      state.activeRoomId = payload.roomId;
      state.activeRecipient = payload.recipient;
    },
    resetActiveRoom: (state, _) => {
      state.activeRoomId = null;
      state.activeRecipient = null;
      state.activeRoomMessages = [];
    },
  },
});

// ACTIONS
export const {setActiveRoom, resetActiveRoom} = slice.actions;

// SELECTORS
const selectChatData = state => {
  return state.chat;
};

export const selectConversationsData = createSelector(selectChatData, data => {
  return {
    conversations: data.conversations,
    activeRoomId: data.activeRoomId,
    conversationsLoading: data.conversationsLoading,
  };
});

export default slice.reducer;
