import { Menu } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { LEFT_MENU_ITEMS } from "./constants";
import style from "./Layout.module.scss";

interface IProps {
  collapsed: boolean;
}

const LeftMenu = (props: IProps) => {
  const { collapsed } = props;
  const navigate = useNavigate();
  const [currentMenu, setCurrentMenu] = useState("home");

  useEffect(() => {
    handleInitMenu();
  }, [window.location.pathname]);

  const userInfo = useSelector((state: RootState) => state.common.userInfo);

  const items = useMemo(() => {
    return LEFT_MENU_ITEMS(userInfo);
  }, [userInfo]);

  const handleInitMenu = () => {
    const path = location.pathname.split("/")[1];
    setCurrentMenu(path);
  };

  return (
    <Menu
      className={`${style["left-menu"]} !p-2 max-h-[calc(100vh-64px)] overflow-auto`}
      selectedKeys={[currentMenu]}
      onSelect={(e) => {
        navigate(`/${e.key}`);
      }}
      mode="inline"
      theme="dark"
      inlineCollapsed={collapsed}
      items={items}
    />
  );
};

export default LeftMenu;
