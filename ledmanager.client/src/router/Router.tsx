import AuthCallback from "@/components/AuthCallback";
import Login from "@/container/Login";
import { CurrencyEnum, LanguageEnum, LocalStorageEnum, PageEnum } from "@/configs/constants";
import i18n from "@/configs/i18n";
import { getUserInfo } from "@/container/User/apis";
import { setUserInfo } from "@/redux/slices/CommonSlice";
import type { Locale } from "antd/es/locale";
import enUS from "antd/locale/en_US";
import viVN from "antd/locale/vi_VN";
import { useEffect, type SetStateAction } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import { getToken } from "@/utils/auth";

interface IProps {
  setAntdLocale: (value: SetStateAction<Locale>) => void;
}

const Router = (props: IProps) => {
  const { setAntdLocale } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const langUrl = searchParams.get("lang");
  const { pathname } = useLocation();
  const token = getToken();

  useEffect(() => {
    fetchUserInfo();
    handleInitStorage();
    handleInitLanguage();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const fetchUserInfo = async () => {
    if (!token) {
      return;
    }
    const data = await getUserInfo();
    if (data) {
      dispatch(setUserInfo(data));
    } else {
      // If token exists but failed to get info, likely token is invalid/expired
      dispatch(setUserInfo(null));
      const isManagePath = !window.location.pathname.includes(PageEnum.Outer);
      if (isManagePath && window.location.pathname !== `/${PageEnum.Login}`) {
        navigate(`/${PageEnum.Login}`);
      }
    }
  };

  const handleInitStorage = () => {
    const currency = localStorage.getItem(LocalStorageEnum.Currency);
    if (!currency) localStorage.setItem(LocalStorageEnum.Currency, CurrencyEnum.VND);
  };

  const handleInitLanguage = () => {
    const langStorage = localStorage.getItem(LocalStorageEnum.I18NLng)?.split("-")?.at(0);
    const lang = langUrl ? langUrl : langStorage ? langStorage : LanguageEnum.VI;
    if (!lang) {
      localStorage.setItem(LocalStorageEnum.I18NLng, lang);
    }
    if (lang === LanguageEnum.VI) setAntdLocale(viVN);
    else if (lang === LanguageEnum.EN) setAntdLocale(enUS);
    i18n.changeLanguage(lang);
  };

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path={`/${PageEnum.Login}`} element={<Login />} />
      {/* public routes */}
      <Route path={`/${PageEnum.Outer}/*`} element={<PublicRoute />} />
      {/* protected routes */}
      <Route path="/*" element={<PrivateRoute />} />
    </Routes>
  );
};

export default Router;
