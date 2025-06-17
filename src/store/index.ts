/**
 * Redux Store Configuration - Rotary Club Mobile
 * Store simplifié pour Expo Snack
 */

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import meetingsReducer from './slices/meetingsSlice';
import membersReducer from './slices/membersSlice';

// Configuration du store simplifié
export const store = configureStore({
  reducer: {
    user: userReducer,
    meetings: meetingsReducer,
    members: membersReducer,
  },
});

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export par défaut
export default store;
