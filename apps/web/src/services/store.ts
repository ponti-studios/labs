import {
  configureStore,
  ThunkAction,
  Action,
  createSlice,
} from "@reduxjs/toolkit";
import auth from "./auth";

const initialState: {
  isOpen: boolean;
  onClose: () => void;
  place: google.maps.places.PlaceResult;
} = {
  isOpen: false,
  place: null,
  onClose: null,
};

const placeModalSlice = createSlice({
  name: "placeModal",
  initialState,
  reducers: {
    openPlaceModal(state, action) {
      state.isOpen = true;
      state.place = action.payload.place;
      state.onClose = action.payload.onClose;
    },
    closePlaceModal(state) {
      state.isOpen = false;
      state.place = null;
      state.onClose?.();
      state.onClose = null;
    },
  },
});

export const { openPlaceModal, closePlaceModal } = placeModalSlice.actions;

export const rootReducer = {
  auth,
  placeModal: placeModalSlice.reducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export const getIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const getLoginEmail = (state: RootState) => state.auth.loginEmail;
export const getUser = (state: RootState) => state.auth.user;
export const getIsAuthenticated = (state: RootState) => !!state.auth.user;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
