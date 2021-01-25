import andDe from "antd/lib/locale-provider/de_DE";
import appLocaleData from "react-intl/locale-data/de";
import deMessages from "../locales/de_DE.json";

const deLang = {
  messages: {
    ...deMessages
  },
  antd: andDe,
  locale: 'de',
  data: appLocaleData
};
export default deLang;
