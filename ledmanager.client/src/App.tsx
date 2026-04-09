import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { useState } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { CoreAppLoading } from "./components";
import { store } from "./redux/store";
import Router from "./router/Router";
import "./styles/index.css";
import "./styles/index.scss";
import { COLORS } from "./utils/colors";

function App() {
  const [antdLocale, setAntdLocale] = useState(viVN);

  return (
    <ConfigProvider
      getPopupContainer={() => document.body}
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: COLORS.primary,
          fontFamily: "Segoe UI",
        },
      }}
    >
      <Provider store={store}>
        <BrowserRouter>
          <Router setAntdLocale={setAntdLocale} />
          <ToastContainer />
          <CoreAppLoading />
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  );
}

export default App;
