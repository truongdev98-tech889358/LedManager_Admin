import { LocalStorageEnum, PageEnum } from "@/configs/constants";
import OrderManagement from "@/container/OrderManagement/views/OrderManagement";
import User from "@/container/User/views/User";
import UserInformation from "@/container/UserInfomation/views/UserInformation";
import Products from "@/container/Products/views/Products";
import ProductForm from "@/container/Products/views/ProductForm";
import Categories from "@/container/Categories/views/Categories";
import Articles from "@/container/Articles/views/Articles";
import Banners from "@/container/Banners/views/Banners";
import BannerForm from "@/container/Banners/views/BannerForm";
import { ProductFeatures, ProductFeatureForm } from "@/container/ProductFeatures";
import MenuManagement from "@/container/MenuManagement/views/MenuManagement";
import OrderDetails from "@/container/OrderManagement/views/Details/OrderDetails";
import AdminLayout from "@/layout/AdminLayout";
import NotFound from "@/layout/NotFound";
import SystemSettings from "@/container/Settings/views/SystemSettings";
import ArticleForm from "@/container/Articles/views/ArticleForm";
import ArticleCategories from "@/container/ArticleCategories/views/ArticleCategories";
// import { getAuthorizationUrl } from "@/services/auth";
import { useEffect } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import RequiredRole from "./RequiredRole";
import Dashboard from "@/container/Dashboard/views/Dashboard";
import NeonConfig from "@/container/NeonConfig";
import HomePageContent from "@/container/HomePageContent";

const PrivateRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    handleCheckToken();
  }, []);

  const handleCheckToken = () => {
    const token = localStorage.getItem(LocalStorageEnum.AccessToken);
    if (!token) {
      navigate(`/${PageEnum.Login}`);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to={`/${PageEnum.Dashboard}`} replace />} />
        <Route path={PageEnum.Dashboard} element={<Dashboard />} />
        <Route path={PageEnum.OrderManagement} element={<RequiredRole roles={["Product"]}><OrderManagement /></RequiredRole>} />
        <Route path={`${PageEnum.OrderDetails}/:id`} element={<RequiredRole roles={["Product"]}><OrderDetails /></RequiredRole>} />
        {/* ... existing customer routes ... */}
        <Route path={PageEnum.Account} element={<RequiredRole roles={["Admin"]}><User /></RequiredRole>} />
        <Route path={`${PageEnum.UserInformation}/:id`} element={<UserInformation />} />
        <Route path={PageEnum.Dashboard} element={<Dashboard />} />
        <Route path={PageEnum.Products} element={<RequiredRole roles={["Product"]}><Products /></RequiredRole>} />
        <Route path={`${PageEnum.Products}/add`} element={<RequiredRole roles={["Product"]}><ProductForm /></RequiredRole>} />
        <Route path={`${PageEnum.Products}/edit/:id`} element={<RequiredRole roles={["Product"]}><ProductForm /></RequiredRole>} />
        <Route path={`${PageEnum.Products}/view/:id`} element={<RequiredRole roles={["Product"]}><ProductForm /></RequiredRole>} />
        <Route path={PageEnum.Categories} element={<RequiredRole roles={["Product"]}><Categories /></RequiredRole>} />
        <Route path={PageEnum.Articles} element={<RequiredRole roles={["Content"]}><Articles /></RequiredRole>} />
        <Route path={`${PageEnum.Articles}/add`} element={<RequiredRole roles={["Content"]}><ArticleForm /></RequiredRole>} />
        <Route path={`${PageEnum.Articles}/edit/:id`} element={<RequiredRole roles={["Content"]}><ArticleForm /></RequiredRole>} />
        <Route path={PageEnum.ArticleCategories} element={<RequiredRole roles={["Content"]}><ArticleCategories /></RequiredRole>} />
        <Route path={PageEnum.Banners} element={<RequiredRole roles={["Content"]}><Banners /></RequiredRole>} />
        <Route path={`${PageEnum.Banners}/add`} element={<RequiredRole roles={["Content"]}><BannerForm /></RequiredRole>} />
        <Route path={`${PageEnum.Banners}/edit/:id`} element={<RequiredRole roles={["Content"]}><BannerForm /></RequiredRole>} />
        <Route path={`${PageEnum.Banners}/view/:id`} element={<RequiredRole roles={["Content"]}><BannerForm /></RequiredRole>} />
        <Route path={PageEnum.ProductFeatures} element={<RequiredRole roles={["Content", "Product"]}><ProductFeatures /></RequiredRole>} />
        <Route path={`${PageEnum.ProductFeatures}/add`} element={<RequiredRole roles={["Content", "Product"]}><ProductFeatureForm /></RequiredRole>} />
        <Route path={`${PageEnum.ProductFeatures}/edit/:id`} element={<RequiredRole roles={["Content", "Product"]}><ProductFeatureForm /></RequiredRole>} />
        <Route path={`${PageEnum.ProductFeatures}/view/:id`} element={<RequiredRole roles={["Content", "Product"]}><ProductFeatureForm /></RequiredRole>} />
        <Route path={PageEnum.MenuManagement} element={<RequiredRole roles={["Admin"]}><MenuManagement /></RequiredRole>} />
        <Route path={PageEnum.MenuHeaderVertical} element={<RequiredRole roles={["Admin"]}><MenuManagement /></RequiredRole>} />
        <Route path={PageEnum.MenuHeaderHorizontal} element={<RequiredRole roles={["Admin"]}><MenuManagement /></RequiredRole>} />
        <Route path={PageEnum.MenuFooter} element={<RequiredRole roles={["Admin"]}><MenuManagement /></RequiredRole>} />
        <Route path={PageEnum.UserManagement} element={<RequiredRole roles={["Admin"]}><User /></RequiredRole>} />
        <Route path={PageEnum.SystemSettings} element={<RequiredRole roles={["Admin"]}><SystemSettings /></RequiredRole>} />
        <Route path={PageEnum.NeonConfig} element={<RequiredRole roles={["Admin"]}><NeonConfig /></RequiredRole>} />
        <Route path={PageEnum.HomePageContent} element={<RequiredRole roles={["Admin"]}><HomePageContent /></RequiredRole>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default PrivateRoute;
