import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import Settings from "./Settings";
import Auth from "./Auth";
import Common from "./Common";
import franchisee from "./franchisee";
import dealer from "./dealer";


const reducers = combineReducers({
  routing: routerReducer,
  settings: Settings,
  auth: Auth,
  commonData: Common,
  franchisee: franchisee,
  dealer: dealer
});

export default reducers;
