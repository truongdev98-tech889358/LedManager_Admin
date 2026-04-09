import { PageEnum } from "@/configs/constants";
import { t } from "i18next";
import {
  Package,
  FolderTree,
  ShoppingCart,
  Newspaper,
  Image as ImageIcon,
  Menu,
  Users,
  LayoutDashboard,
  Settings,
  Palette,
} from "lucide-react";

export const LEFT_MENU_ITEMS = (userInfo: any) => {
  const role = userInfo?.role;
  const isAdmin = role === "Admin";
  const isContent = role === "Content";
  const isProduct = role === "Product";

  return [
    {
      key: "dashboard",
      icon: <LayoutDashboard size={18} />,
      label: t("menu.dashboard"),
      visible: isAdmin || isProduct || isContent,
    },
    {
      key: PageEnum.Products,
      icon: <Package size={18} />,
      label: t("menu.productManagement"),
      visible: isAdmin || isProduct,
    },
    {
      key: PageEnum.Categories,
      icon: <FolderTree size={18} />,
      label: t("menu.categoryManagement"),
      visible: isAdmin || isProduct,
    },
    {
      key: PageEnum.OrderManagement,
      icon: <ShoppingCart size={18} />,
      label: t("menu.orderManagement"),
      visible: isAdmin || isProduct,
    },
    {
      key: PageEnum.Articles,
      icon: <Newspaper size={18} />,
      label: t("menu.articleManagement"),
      visible: isAdmin || isContent,
    },
    {
      key: PageEnum.ArticleCategories,
      icon: <FolderTree size={18} />,
      label: t("menu.articleCategoryManagement"),
      visible: isAdmin || isContent,
    },
    {
      key: PageEnum.Banners,
      icon: <ImageIcon size={18} />,
      label: t("menu.bannerManagement"),
      visible: isAdmin || isContent,
    },
    {
      key: PageEnum.ProductFeatures,
      icon: <Package size={18} />,
      label: "Content Blocks",
      visible: isAdmin || isContent || isProduct,
    },
    {
      key: PageEnum.MenuManagement,
      icon: <Menu size={18} />,
      label: t("menu.menuManagement"),
      visible: isAdmin,
    },
    {
      key: PageEnum.UserManagement,
      icon: <Users size={18} />,
      label: t("menu.userManagement"),
      visible: isAdmin,
    },
    {
      key: PageEnum.SystemSettings,
      icon: <Settings size={18} />,
      label: t("menu.systemSettings"),
      visible: isAdmin,
    },
    {
      key: PageEnum.NeonConfig,
      icon: <Palette size={18} />,
      label: "Neon Configuration",
      visible: isAdmin,
    },
    {
      key: PageEnum.HomePageContent,
      icon: <LayoutDashboard size={18} />,
      label: "Home Page Config",
      visible: isAdmin,
    },
  ].filter(item => item.visible).map(({ visible, ...item }) => item);
};
