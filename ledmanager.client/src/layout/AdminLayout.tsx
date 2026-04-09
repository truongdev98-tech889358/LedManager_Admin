import { images } from "@/assets/images";
import { CoreButton, CoreSelect } from "@/components";
import { LanguageEnum, LocalStorageEnum, PageEnum } from "@/configs/constants";

import { setUserInfo } from "@/redux/slices/CommonSlice";
import type { RootState } from "@/redux/store";
import { Drawer, Dropdown, Layout, Spin } from "antd";
import { t } from "i18next";
import { LogOut, MenuIcon, User, UserCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import style from "./Layout.module.scss";
import LeftMenu from "./LeftMenu";
import { getSystemConfigByKey } from "@/container/Settings/apis";
import { BASE_URL } from "@/configs/constants";
import { removeToken } from "@/utils/auth";

const AdminLayout = () => {
  const { Header, Content, Sider } = Layout;
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector((state: RootState) => state.common.userInfo);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    const logoConfig = await getSystemConfigByKey("SiteLogo");
    if (logoConfig && logoConfig.configValue) {
      setLogoUrl(logoConfig.configValue.startsWith("http") ? logoConfig.configValue : `${BASE_URL || ""}${logoConfig.configValue}`);
    }
  };

  const routeNoCheck = useMemo(() => {
    return [
      PageEnum.BookingSuccess,
      PageEnum.Payment,
      PageEnum.XmlRequestResponse,
      PageEnum.CustomerFinance,
      PageEnum.Dashboard,
      PageEnum.SystemSettings,
      PageEnum.MenuManagement,
      PageEnum.Categories,
      PageEnum.Products,
      PageEnum.Articles,
      PageEnum.Banners,
      PageEnum.UserManagement,
      PageEnum.ProductManagement,
      PageEnum.CategoryManagement,
      PageEnum.ArticleManagement,
      PageEnum.BannerManagement,
    ];
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (window.innerWidth < 1200 && !mobile) {
        setCollapsed(true);
      } else if (!mobile) {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    handleValidateRoute();
  }, [userInfo]);

  const isDisabledCurrency = useMemo(() => {
    const paths = [`${PageEnum.Booking}/${PageEnum.Information}`, PageEnum.BookingSuccess];
    return paths.some((path) => window.location.pathname.includes(path));
  }, [window.location.pathname]);

  const handleChangeLanguage = useCallback(
    (value: string) => {
      window.localStorage.setItem(LocalStorageEnum.I18NLng, value);
      let currency = "VND";
      if (value === LanguageEnum.EN) {
        currency = "USD";
      }
      window.localStorage.setItem(LocalStorageEnum.Currency, currency);
      window.location.reload();
    },
    [location.pathname],
  );

  const handleValidateRoute = () => {
    if (!userInfo) {
      return;
    }
    const pathName = window.location.pathname.split("/")[1];

    if (routeNoCheck.includes(pathName as any)) {
      return;
    }

  };

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  if (!userInfo) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="whitespace-nowrap">
          <Spin size="large" tip="Đang tải dữ liệu...">
            <div className="h-full w-full" />
          </Spin>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div
        className="cursor-pointer bg-[#001529] w-full"
        onClick={() => {
          navigate("/");
          if (isMobile) setMobileDrawerOpen(false);
        }}
      >
        <img
          src={logoUrl || (collapsed && !isMobile ? images.logo2 : images.logo)}
          alt="logo"
          className="w-full h-auto p-2 object-contain block"
          onError={(e) => {
            (e.target as HTMLImageElement).src = images.noImageAvailable;
          }}
        />
      </div>
      <LeftMenu collapsed={collapsed && !isMobile} />
    </>
  );

  return (
    <Layout className={`admin-layout h-screen overflow-hidden ${style["admin-layout"]}`}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider className="hidden md:block" width={collapsed ? 60 : 240}>
          <SidebarContent />
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        className={style["mobile-drawer"]}
        width={240}
        styles={{
          body: { padding: 0, background: "#001529" },
          header: { display: "none" },
        }}
      >
        <div className="flex justify-end p-2">
          <CoreButton
            icon={<X />}
            type="text"
            onClick={() => setMobileDrawerOpen(false)}
            className="text-white"
          />
        </div>
        <SidebarContent />
      </Drawer>

      <Layout>
        <Header className="flex items-center justify-between !bg-white !px-2 md:!px-4 shadow z-10">
          <div className="flex items-center gap-2">
            {/* Logo on mobile */}
            {isMobile && (
              <img
                src={logoUrl || images.logo}
                alt="logo"
                className="h-8 object-contain cursor-pointer"
                onClick={() => navigate("/")}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = images.noImageAvailable;
                }}
              />
            )}

            <CoreButton
              icon={<MenuIcon />}
              type="text"
              onClick={handleMenuToggle}
            ></CoreButton>
          </div>

          <div className="flex flex-0 items-center gap-2 md:gap-4">
            {/* Hide language/currency selects on very small screens */}
            <div className="hidden sm:block">
              <CoreSelect
                value={localStorage.getItem(LocalStorageEnum.I18NLng) ?? LanguageEnum.VI}
                style={{ width: isMobile ? 100 : 140 }}
                onChange={handleChangeLanguage}
                disabled={isDisabledCurrency}
                options={[
                  { label: "Tiếng Việt", value: LanguageEnum.VI },
                  { label: "English", value: LanguageEnum.EN },
                ]}
              />
            </div>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "profile",
                    label: t("common.profile"),
                    icon: <UserCircle size={18} />,
                    onClick: () => {
                      console.log("profile");
                      navigate(`/${PageEnum.UserInformation}/` + userInfo?.id);
                    },
                  },
                  {
                    type: "divider",
                  },
                  {
                    key: "logout",
                    label: t("common.logout"),
                    icon: <LogOut size={18} />,
                    onClick: () => {
                      removeToken();
                      dispatch(setUserInfo(null));
                      navigate(`/${PageEnum.Login}`);
                    },
                  },
                ],
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <CoreButton type="text" icon={<User />} />
            </Dropdown>
          </div>
        </Header>

        <Content id="admin-layout-content" className="flex-1 flex flex-col overflow-auto p-2 md:p-4">
          <Outlet />
        </Content>

        {/* <Footer>© 2025 Air Ticket. All rights reserved.</Footer> */}
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
