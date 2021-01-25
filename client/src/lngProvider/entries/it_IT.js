import antdIT from "antd/lib/locale-provider/it_IT";
import appLocaleData from "react-intl/locale-data/it";
import itMessages from "../locales/it_IT.json";

const saLang = {
  messages: {
    ...itMessages
  },
  antd: antdIT,
  locale: 'it-IT',
  data: appLocaleData
};
export default saLang;
