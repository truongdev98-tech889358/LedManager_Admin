import { CurrencyEnum, LoadingEnum, LocalStorageEnum } from "@/configs/constants";
import type { IUserInfo } from "@/configs/types";
import { getCurrencyStorage } from "@/utils/helper";
import { createSlice } from "@reduxjs/toolkit";

interface ICommonState {
  userInfo: IUserInfo | null;
  currency: CurrencyEnum;
  loading: object;
}

const initialState: ICommonState = {
  userInfo: null,
  currency: getCurrencyStorage(),
  loading: {},
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
    setCurrency(state, action) {
      localStorage.setItem(LocalStorageEnum.Currency, action.payload);
      state.currency = action.payload;
    },
    setLoading(state, action) {
      const { key, value } = action.payload;
      state.loading = { ...state.loading, [key]: value };
    },
    setLoadingTrue(state) {
      state.loading = { ...state.loading, [LoadingEnum.Common]: true };
    },
    setLoadingFalse(state) {
      state.loading = { ...state.loading, [LoadingEnum.Common]: false };
    },
  },
});

export const { setUserInfo, setCurrency, setLoading, setLoadingTrue, setLoadingFalse } =
  commonSlice.actions;
export default commonSlice.reducer;
