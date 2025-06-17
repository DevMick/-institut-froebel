import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: string;
  club: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@rotary.org',
  role: 'member',
  club: 'Rotary Club Paris',
  isAuthenticated: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    logout: (state) => {
      return { ...initialState, isAuthenticated: false };
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer; 