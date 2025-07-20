import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, { payload }) => {
      state.notifications = payload;
    },
    removeNotification: (state, { payload }) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setNotifications,
  removeNotification,
  clearNotifications,
} = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.notifications;

export default notificationsSlice.reducer; 