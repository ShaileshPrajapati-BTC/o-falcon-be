import { INIT_URL, SIGNOUT_USER_SUCCESS, USER_DATA, USER_TOKEN_SET, USER_DEFAULT_PASSWORD_SET, TOKEN_KEY, MAP_CENTER, IS_SOCKET_CONNECTED, SET_SOCKET } from "../../constants/ActionTypes";
import { DEFAULT_MAP_CENTER } from "../../constants/Setup";
import UtilLocalService from '../../services/localServiceUtil';

const INIT_STATE = {
  token: UtilLocalService.getLocalStorage(TOKEN_KEY),
  initURL: '',
  authUser: UtilLocalService.getLocalStorage('user'),
  defaultPassword: null,
  mapCenter: DEFAULT_MAP_CENTER,
  isConnectSocket: false,
  socket: null
};

export default (state = INIT_STATE, action) => {
  switch (action.type) {


    case INIT_URL: {
      return { ...state, initURL: action.payload };
    }

    case SIGNOUT_USER_SUCCESS: {
      return {
        ...state,
        token: null,
        authUser: null,
        initURL: ''
      }
    }

    case USER_DATA: {
      return {
        ...state,
        authUser: action.payload,
      };
    }

    case USER_TOKEN_SET: {
      return {
        ...state,
        token: action.payload,
      };
    }

    case USER_DEFAULT_PASSWORD_SET: {
      return {
        ...state,
        defaultPassword: action.payload,
      };
    }

    case MAP_CENTER: {
      return {
        ...state,
        mapCenter: action.payload,
      };
    }

    case IS_SOCKET_CONNECTED: {
      return {
        ...state,
        isConnectSocket: action.payload,
      };
    }

    case SET_SOCKET: {
      return {
        ...state,
        socket: action.payload,
      };
    }
    default:
      return state;
  }
}
