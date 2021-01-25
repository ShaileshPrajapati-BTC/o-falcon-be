import {
    CATCH_MASTER_DATA,
    FETCH_ERROR,
    FETCH_START,
    FETCH_SUCCESS,
    INIT_URL,
    SIGNOUT_USER_SUCCESS,
    USER_DATA,
    USER_DEFAULT_PASSWORD_SET,
    USER_TOKEN_SET,
    TOKEN_KEY,
    MAP_CENTER,
    IS_SOCKET_CONNECTED,
    SET_SOCKET,
    SWITCH_LANGUAGE,
    CHANGE_LANGUAGE
} from '../../constants/ActionTypes';
import { MASTER_DATA } from '../../constants/Common';
import UtilLocalService from '../../services/localServiceUtil';
import axios from 'util/Api';
import { message } from 'antd';
import languageData from "../../containers/Topbar/languageData";

export const setInitUrl = (url) => {
    return {
        type: INIT_URL,
        payload: url
    };
};

export const userSignUp = ({ email, password, name }) => {
    return (dispatch) => {
        dispatch({ type: FETCH_START });
        axios
            .post('auth/register', {
                email: email,
                password: password,
                name: name
            })
            .then((data) => {
                console.log('data:', data);
                if (data.result) {
                    UtilLocalService.setLocalStorage(TOKEN_KEY, data.token.access_token);
                    axios.defaults.headers.common['access-token'] =
                        `JWT ${data.token.access_token}`;
                    dispatch({ type: FETCH_SUCCESS });
                    dispatch({ type: USER_TOKEN_SET, payload: data.token.access_token });
                    dispatch({ type: USER_DATA, payload: data.user });
                } else {
                    console.log('payload: data.error', data.error);
                    dispatch({ type: FETCH_ERROR, payload: 'Network Error' });
                }
            })
            .catch((error) => {
                dispatch({ type: FETCH_ERROR, payload: error.message });
                console.log("Error****:", error.message);
            });
    };
};

export const userSignIn = ({ email, password }) => {
    return (dispatch) => {
        dispatch({ type: FETCH_START });
        axios
            .post('admin/auth/login', {
                username: email,
                password: password
            })
            .then((data) => {
                if (data.code === 'OK') {
                    const user = data.data.user;
                    if (user.defaultPassword) {
                        dispatch({
                            type: USER_DEFAULT_PASSWORD_SET,
                            payload: {
                                userId: user.id,
                                defaultPassword: user.defaultPassword,
                                token: 'JWT ' + data.data.token.jwt
                            }
                        });
                    } else {
                        UtilLocalService.setLocalStorage(TOKEN_KEY, data.data.token.jwt);
                        UtilLocalService.setLocalStorage('user', user);

                        axios.defaults.headers.common['access-token'] =
                            'JWT ' + data.data.token.jwt;
                        dispatch({ type: USER_TOKEN_SET, payload: data.data.token.jwt });
                        dispatch({ type: USER_DATA, payload: data.data.user });
                        if (user.preferredLang) {
                            let locale = languageData.find(e => e.id === user.preferredLang);
                            dispatch({ type: SWITCH_LANGUAGE, payload: locale });
                            dispatch({ type: CHANGE_LANGUAGE, payload: user.preferredLang });
                        }
                        fetchMasterData();
                    }
                    dispatch({ type: FETCH_SUCCESS });
                    message.success('Login Successfully!');
                } else {
                    dispatch({ type: FETCH_ERROR, payload: data.error });
                }
            })
            .catch((error) => {
                message.error(error.message);
                dispatch({
                    type: FETCH_ERROR,
                    payload:
                        error.message
                            ? error.message
                            : "Something went wrong"
                });
            });
    };
};

export const fetchMasterData = () => {
    let obj = {
        masters: [MASTER_DATA.CHARGING_PLUG, MASTER_DATA.CHARGING_POWER],
        include: ['subMasters']
    };

    return (dispatch) => {
        console.log(obj);
        axios
            .post('admin/master/list-by-code', obj)
            .then((data) => {
                console.log(data);
                if (data.code === 'OK') {
                    dispatch({ type: CATCH_MASTER_DATA, payload: data.data });
                }
            })
            .catch((error) => {
                console.log("Error****:", error.message);
            });
    };
};

export const getUser = (userId) => {
    return (dispatch) => {
        dispatch({ type: FETCH_START });
        axios.get(`admin/user/${userId}`)
            .then(({ data }) => {
                if (data) {
                    console.log('yooooooooooo', data.preferredLang)
                    if (data.preferredLang) {
                        let locale = languageData.find(e => e.id === data.preferredLang);
                        dispatch({ type: SWITCH_LANGUAGE, payload: locale });
                        dispatch({ type: CHANGE_LANGUAGE, payload: data.preferredLang });
                    }
                    UtilLocalService.setLocalStorage('user', data);
                    dispatch({ type: USER_DATA, payload: data });
                    dispatch({ type: FETCH_SUCCESS });
                } else {
                    dispatch({ type: FETCH_ERROR, payload: data.error });
                }
            }).catch(function (error) {
                dispatch({ type: FETCH_ERROR, payload: error.message });
                console.log("Error****:", error.message);
            });
    };
};

export const userSignOut = () => {
    return (dispatch) => {
        dispatch({ type: FETCH_START });
        setTimeout(() => {
            localStorage.clear();
            dispatch({ type: FETCH_SUCCESS });
            dispatch({ type: SIGNOUT_USER_SUCCESS });
            dispatch({ type: IS_SOCKET_CONNECTED, payload: false });
            dispatch({ type: SET_SOCKET, payload: null });
        }, 2000);
    };
};

export const setDefaultMapCenter = (mapObject) => {
    return (dispatch) => {
        dispatch({ type: MAP_CENTER, payload: mapObject });
    };
};

export const setSocketConnection = (mapObject) => {
    return (dispatch) => {
        dispatch({ type: IS_SOCKET_CONNECTED, payload: mapObject });
    };
};

export const setSocket = (mapObject) => {
    return (dispatch) => {
        dispatch({ type: SET_SOCKET, payload: mapObject });
    };
};
export const updateUser = (mapObject) => {
    return (dispatch) => {
        dispatch({ type: USER_DATA, payload: mapObject });
    };
};