import andNl from "antd/lib/locale-provider/nl_BE";
import appLocaleData from "react-intl/locale-data/nl";
import nlMessages from "../locales/nl_BE.json";

const nlLang = {
  messages: {
    ...nlMessages
  },
  antd: andNl,
  locale: 'nl',
  data: appLocaleData
};
export default nlLang;
