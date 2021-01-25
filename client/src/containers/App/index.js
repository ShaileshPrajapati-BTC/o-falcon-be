import {
    LAYOUT_TYPE_BOXED,
    LAYOUT_TYPE_FRAMED,
    LAYOUT_TYPE_FULL,
    NAV_STYLE_ABOVE_HEADER,
    NAV_STYLE_BELOW_HEADER,
    NAV_STYLE_DARK_HORIZONTAL,
    NAV_STYLE_DEFAULT_HORIZONTAL,
    NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
    THEME_TYPE_DARK
} from '../../constants/ThemeSetting';
import { BASE_URL } from '../../constants/Setup';
import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { getFranchisee } from "appRedux/actions/franchisee";
import { getDealer } from "appRedux/actions/dealer";
import { getUser, setInitUrl, userSignOut, setSocketConnection, setSocket } from 'appRedux/actions/Auth';
import {
    onLayoutTypeChange,
    onNavStyleChange,
    setThemeType
} from 'appRedux/actions/Setting';

import AppLocale from 'lngProvider';
import { DEFAULT_API_ERROR, SOCKET_CONNECTION, } from '../../constants/Common';
import ForgotPassword from '../../routes/UserAuth/ForgotPassword';
import { IntlProvider } from 'react-intl';
import { LocaleProvider } from 'antd';

import MainApp from './MainApp';
import ResetPassword from '../../routes/UserAuth/ResetPassword';
import SignIn from '../SignIn';
import SignUp from '../SignUp';
import URLSearchParams from 'url-search-params';
import UpdateDefaultPasswordByUser from '../../routes/UserAuth/UpdateDefaultPasswordByUser';

import axios from 'util/Api';
import { connect } from 'react-redux';
import TermsNConditions from '../../routes/TnC';
import PrivacyPolicyForDevice from '../../routes/PrivacyPolicyForDevice';
import Support from '../../routes/support';
import UtilService from '../../services/util';
import io from 'socket.io-client';
import MapCenterLocation from './MapCenterLocation';
import CacheBuster from './CacheBuster';

let socket;
const RestrictedRoute = ({ component: Component, token, ...rest }) => {
    return <Route
        {...rest}
        render={(props) => {
            return token ?
                <Component {...props} /> :
                <Redirect
                    to={{
                        pathname: '/',
                        state: { from: props.location }
                    }}
                />;
        }
        }
    />;
};
class App extends Component {
    constructor(props) {
        super(props);
        this.pageRefresh = true;
    }
    setLayoutType = (layoutType) => {
        if (layoutType === LAYOUT_TYPE_FULL) {
            document.body.classList.remove('boxed-layout');
            document.body.classList.remove('framed-layout');
            document.body.classList.add('full-layout');
        } else if (layoutType === LAYOUT_TYPE_BOXED) {
            document.body.classList.remove('full-layout');
            document.body.classList.remove('framed-layout');
            document.body.classList.add('boxed-layout');
        } else if (layoutType === LAYOUT_TYPE_FRAMED) {
            document.body.classList.remove('boxed-layout');
            document.body.classList.remove('full-layout');
            document.body.classList.add('framed-layout');
        }
    };

    setNavStyle = (navStyle) => {
        if (
            navStyle === NAV_STYLE_DEFAULT_HORIZONTAL ||
            navStyle === NAV_STYLE_DARK_HORIZONTAL ||
            navStyle === NAV_STYLE_INSIDE_HEADER_HORIZONTAL ||
            navStyle === NAV_STYLE_ABOVE_HEADER ||
            navStyle === NAV_STYLE_BELOW_HEADER
        ) {
            document.body.classList.add('full-scroll');
            document.body.classList.add('horizontal-layout');
        } else {
            document.body.classList.remove('full-scroll');
            document.body.classList.remove('horizontal-layout');
        }
    };
    errorHandler = (error) => {
        if (error.response.data.code === 'E_UNAUTHORIZED') {
            this.props.userSignOut();
            if (!SOCKET_CONNECTION) {
                return;
            }
            this.props.socket.disconnect();
        } else if (error.response.data && !error.response.data.message) {
            error.response.data.message = DEFAULT_API_ERROR;
        }

        return Promise.reject(error.response.data);
    }
    successHandler = (response) => {
        return Promise.resolve(response.data);
    }

    componentWillMount() {
        axios.interceptors.response.use(
            (response) => {
                return this.successHandler(response);
            },
            (error) => {
                return this.errorHandler(error);
            }
        );
        if (this.props.initURL === '') {
            this.props.setInitUrl(this.props.history.location.pathname);
        }
        const params = new URLSearchParams(this.props.location.search);
        if (params.has('theme')) {
            this.props.setThemeType(params.get('theme'));
        }
        if (params.has('nav-style')) {
            this.props.onNavStyleChange(params.get('nav-style'));
        }
        if (params.has('layout-type')) {
            this.props.onLayoutTypeChange(params.get('layout-type'));
        }
    }
    componentDidUpdate(prevProps) {
        if (
            this.props.token &&
            (this.props.token !== prevProps.token || this.props.token === prevProps.token) &&
            this.pageRefresh === true
        ) {
            if (prevProps.authUser && prevProps.authUser.id) {
                this.props.getUser(prevProps.authUser.id);
            }
            this.pageRefresh = false;
            this.props.getFranchisee();
            this.props.getDealer();
        }
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.token) {
            axios.defaults.headers.common['Authorization'] =
                `JWT ${nextProps.token}`;
        }
        if (nextProps.language) {
            axios.defaults.headers.common['language'] = nextProps.language;
        }
        if (nextProps.authUser && nextProps.authUser.loginToken && !this.props.isConnectSocket && !this.props.socket) {
            await this.connectSocket(nextProps.authUser);
        }
    }
    connectSocket = async (authUser) => {
        if (!SOCKET_CONNECTION) {
            return;
        }
        socket = await io(BASE_URL, {
            query: {
                authorization: authUser && authUser.loginToken.substring(4),
                deviceid: UtilService.getDeviceId(),
            }
        });
        await this.props.setSocketConnection(true);
        await this.props.setSocket(socket);
    }
    onBackButtonEvent = (e) => {
        e.preventDefault();
        this.props.history.push('/');
    }
    componentDidMount = async () => {
        window.onpopstate = this.onBackButtonEvent;
        window.addEventListener('beforeunload', this.onUnmount, false);
    }
    onUnmount = () => {
        if (!SOCKET_CONNECTION) {
            return;
        }
        socket && socket.disconnect();
        this.props.setSocket(null);
        this.props.setSocketConnection(false);
    }
    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onUnmount, false);
        this.onUnmount();
    }

    render() {
        const {
            match,
            location,
            themeType,
            layoutType,
            navStyle,
            locale,
            token,
            initURL
        } = this.props;
        if (themeType === THEME_TYPE_DARK) {
            document.body.classList.add('dark-theme');
        }

        if (location.pathname === '/') {
            if (token === null) {
                return <Redirect to={'/e-scooter/signin'} />;
            } else if (
                initURL === '' ||
                initURL === '/' ||
                initURL === '/e-scooter/signin'
            ) {
                return <Redirect to={'/e-scooter/dashboard'} />;
            }

            return <Redirect to={initURL} />;

        }
        this.setLayoutType(layoutType);

        this.setNavStyle(navStyle);

        const currentAppLocale = AppLocale[locale.locale];

        return (
            <>
                <CacheBuster>
                    {({ loading, isLatestVersion, refreshCacheAndReload }) => {
                        if (loading) return null;
                        if (!loading && !isLatestVersion) {
                            refreshCacheAndReload();
                        }

                        return (
                            <LocaleProvider locale={currentAppLocale.antd}>
                                <>
                                    <MapCenterLocation />
                                    <IntlProvider
                                        locale={currentAppLocale.locale}
                                        messages={currentAppLocale.messages}
                                    >
                                        <Switch>
                                            <Route
                                                exact
                                                path="/e-scooter/signin"
                                                component={SignIn}
                                            />
                                            <Route
                                                exact
                                                path="/e-scooter/forgot-password"
                                                component={ForgotPassword}
                                            />
                                            <Route
                                                exact
                                                path="/e-scooter/update-default-password"
                                                component={UpdateDefaultPasswordByUser}
                                            />
                                            <Route
                                                exact
                                                path="/e-scooter/reset-password"
                                                component={ResetPassword}
                                            />
                                            <Route
                                                exact
                                                path="/e-scooter/riders-agreement"
                                                component={TermsNConditions}
                                            />

                                            <Route
                                                exact
                                                path="/privacy-policy"
                                                component={PrivacyPolicyForDevice}
                                            />

                                            <Route
                                                exact
                                                path="/e-scooter/support"
                                                component={Support}
                                            />
                                            <Route exact path="/signup" component={SignUp} />
                                            <RestrictedRoute
                                                path={`${match.url}`}
                                                token={token}
                                                component={MainApp}
                                            />
                                        </Switch>
                                    </IntlProvider>
                                </>
                            </LocaleProvider>
                        );
                    }}
                </CacheBuster>
            </>
        );
    }
}

const mapStateToProps = ({ settings, auth }) => {
    const { width, locale, navStyle, themeType, layoutType, language } = settings;
    const { authUser, token, initURL, isConnectSocket, socket } = auth;

    return {
        locale,
        token,
        navStyle,
        themeType,
        layoutType,
        authUser,
        initURL,
        language,
        isConnectSocket,
        socket
    };
};
export default connect(
    mapStateToProps,
    { setInitUrl, getUser, setThemeType, onNavStyleChange, onLayoutTypeChange, userSignOut, getFranchisee, getDealer, setSocketConnection, setSocket }
)(App);
