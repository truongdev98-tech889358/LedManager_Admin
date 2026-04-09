import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import style from "./Layout.module.scss";
import { getMenus, type IMenu } from "@/container/MenuManagement/apis";
import { getSystemConfigByKey } from "@/container/Settings/apis";
import { MenuType } from "@/container/MenuManagement/apis";
import { BASE_URL } from "@/configs/constants";
import { images } from "@/assets/images";
import { ShoppingCart, Search, User, Menu, X } from "lucide-react";

const MainLayout = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    fetchData();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch menus for header
      const menuRes = await getMenus({ pageSize: 100 });
      const headerMenus = (menuRes?.items || []).filter(
        (m: IMenu) => m.type === MenuType.HeaderHorizontal && !m.parentId
      );
      setMenus(headerMenus.sort((a: IMenu, b: IMenu) => a.sortOrder - b.sortOrder));

      // Fetch logo
      const logoConfig = await getSystemConfigByKey("SiteLogo");
      if (logoConfig?.configValue) {
        setLogoUrl(
          logoConfig.configValue.startsWith("http")
            ? logoConfig.configValue
            : `${BASE_URL || ""}${logoConfig.configValue}`
        );
      }
    } catch (error) {
      console.error("Failed to fetch store data:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`main-layout ${style["main-layout"]}`}>
      <header className={`${style["main-layout__header"]} ${isScrolled ? style["scrolled"] : ""}`}>
        <div className={style["header-inner"]}>
          {/* Mobile Menu Toggle */}
          <button
            className={style["main-layout__mobile-toggle"]}
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className={style["main-layout__logo"]} onClick={() => navigate("/")}>
            <img src={logoUrl || images.logo} alt="Store Logo" />
          </div>

          <nav className={style["main-layout__nav"]}>
            {menus.map((menu) => (
              <Link key={menu.id} to={menu.link || "#"}>
                {menu.name}
              </Link>
            ))}
            {/* Fallback menus if database is empty */}
            {menus.length === 0 && (
              <>
                <Link to="/shop">SHOP</Link>
                <Link to="/learning-hub">LEARNING HUB</Link>
                <Link to="/about">ABOUT</Link>
                <Link to="/contact">CONTACT</Link>
              </>
            )}
          </nav>

          <div className={style["main-layout__actions"]}>
            <button className={style["action-btn"]}>
              <Search size={20} />
            </button>
            <button className={style["action-btn"]} onClick={() => navigate("/login")}>
              <User size={20} />
            </button>
            <button className={`${style["action-btn"]} ${style["primary"]}`}>
              UPLOAD YOUR LOGO
            </button>
            <button className={style["action-btn"]}>
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`${style["main-layout__mobile-menu"]} ${isMobileMenuOpen ? style["open"] : ""}`}>
        {menus.map((menu) => (
          <Link key={menu.id} to={menu.link || "#"} onClick={closeMobileMenu}>
            {menu.name}
          </Link>
        ))}
        {menus.length === 0 && (
          <>
            <Link to="/shop" onClick={closeMobileMenu}>SHOP</Link>
            <Link to="/learning-hub" onClick={closeMobileMenu}>LEARNING HUB</Link>
            <Link to="/about" onClick={closeMobileMenu}>ABOUT</Link>
            <Link to="/contact" onClick={closeMobileMenu}>CONTACT</Link>
          </>
        )}

        <div className={style["mobile-actions"]}>
          <button className={`${style["action-btn"]} ${style["primary"]}`} onClick={() => { navigate("/upload"); closeMobileMenu(); }}>
            UPLOAD YOUR LOGO
          </button>
          <button className={style["action-btn"]} onClick={() => { navigate("/login"); closeMobileMenu(); }}>
            LOGIN / REGISTER
          </button>
        </div>
      </div>

      <main className={style["main-layout__content-wrapper"]}>
        <div className={style["main-layout__content"]}>
          <Outlet />
        </div>
      </main>

      {/* Footer could be added here in a similar way */}
    </div>
  );
};

export default MainLayout;
