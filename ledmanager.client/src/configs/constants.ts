export const DATE_FORMAT = "YYYY-MM-DD";
export const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";
export const DATE_DISPLAY_FORMAT = "DD/MM/YYYY";
export const DATE_TIME_DISPLAY = "HH:mm:ss, DD/MM/YYYY";
export const DATE_TIME_DISPLAY2 = "DD/MM/YYYY HH:mm";
export const TIME_DISPLAY = "HH:mm";

export enum LocalStorageEnum {
  SearchFlight = "searchFlight",
  Ticket = "ticket",
  Flight = "flight",
  I18NLng = "i18nextLng",
  Currency = "currency",
  OrderManagementColumnState = "orderManagementColumnState",
  BookingManagementColumnState = "bookingManagementColumnState",
  CustomerTypeColumnState = "customerTypeColumnState",
  CustomerGroupColumnState = "customerGroupColumnState",
  CustomerColumnState = "customerColumnState",
  UserGroupColumnState = "userGroupColumnState",
  UserColumnState = "userColumnState",
  TicketManagementColumnState = "ticketManagementColumnState",
  AccessToken = "accessToken",
  RefreshToken = "refreshToken",
  XMLRequestResponseAdminColumnState = "xmlRequestResponseAdminColumnState",
  ExchangeRateColumnState = "exchangeRateColumnState",
  CustomerFinanceColumnState = "customerFinanceColumnState",
  CustomerFinanceListColumnState = "customerFinanceListColumnState",
  FlightInfoLater = "flightInfoLater",
  ArticleManagementColumnState = "articleManagementColumnState",
  ProductManagementColumnState = "productManagementColumnState",
  CategoryManagementColumnState = "categoryManagementColumnState",
  BannerManagementColumnState = "bannerManagementColumnState",
  ProductFeaturesColumnState = "productFeaturesColumnState",
}

export enum CustomerTypeEnum {
  Individual = 0,
  Agency = 1,
  Company = 2,
}

export enum CurrencyEnum {
  VND = "VND",
  USD = "USD",
}

export enum LanguageEnum {
  VI = "vi",
  EN = "en",
}

export enum TYPE_EMAIL {
  BOOKING = "BookingEmail",
  PAYMENT_LATER = "PaymentLaterEmail",
  REFUND = "RefundEmail",
  CANCEL = "CancelEmail",
  VERIFY = "VerifyEmail",
  NOTIFICATION = "NotificationEmail",
  PAYMENT_LATER_ADMIN = "PaymentLaterEmailAdmin",
}

export enum PageEnum {
  Booking = "booking",
  OrderManagement = "orderManagement",
  BookingManagement = "bookingManagement",
  TicketManagement = "ticketManagement",
  RetailCustomer = "retailCustomer",
  AgencyCustomer = "agencyCustomer",
  CompanyCustomer = "companyCustomer",
  CustomerGroup = "customerGroup",
  CustomerType = "customerType",
  Account = "account",
  AccountGroup = "accountGroup",
  Permission = "permission",
  OrchardCoreAdmin = "orchardCoreAdmin",
  Outer = "outer",
  BookingSuccess = "bookingSuccess",
  Payment = "payment",
  Search = "search",
  Information = "information",
  UserInformation = "userInformation",
  NotFound = "notFound",
  XmlRequestResponse = "xmlRequestResponse",
  ExchangeRate = "exchangeRate",
  CustomerFinance = "customerFinance",
  TopUp = "topUp",
  Deposit = "deposit",
  Debt = "debt",
  AgencyCustomerFinance = "agencyCustomerFinance",
  CompanyCustomerFinance = "companyCustomerFinance",
  PayLater = "payLater",
  OrderDetails = "orderDetails",
  bookingDetails = "bookingDetails",
  Dashboard = "dashboard",
  Login = "login",
  Products = "products",
  Categories = "categories",
  Articles = "articles",
  Banners = "banners",
  ProductFeatures = "product-features",
  Statistics = "statistics",
  MenuManagement = "menu-management",
  MenuHeaderVertical = "menu-header-vertical",
  MenuHeaderHorizontal = "menu-header-horizontal",
  MenuFooter = "menu-footer",
  UserManagement = "user-management",
  ArticleManagement = "articleManagement",
  CategoryManagement = "categoryManagement",
  ProductManagement = "productManagement",
  BannerManagement = "bannerManagement",
  Settings = "settings",
  ArticleCategories = "article-categories",
  SystemSettings = "system-settings",
  NeonConfig = "neon-config",
  HomePageContent = "homepage-content",
}
export const PASSENGER_TYPE = {
  Adult: "ADT",
  Child: "CNN",
  Infant: "INF",
};
export const BASE_URL = import.meta.env.VITE_CONTENT_URL;

export enum LoadingEnum {
  Common,
  SendPayLaterEmail,
  SendReminderFlightEmail,
}

export const SYSTEM_AMADEUS = "AMADEUS_EDT";
