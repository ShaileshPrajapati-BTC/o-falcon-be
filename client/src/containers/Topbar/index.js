import React, { Component } from "react";
import { Layout } from "antd";
import { Link } from "react-router-dom";
import axios from 'util/Api';

import CustomScrollbars from "util/CustomScrollbars";
import {
    switchLanguage,
    changeLanguage,
    toggleCollapsedSideNav
} from "../../appRedux/actions/Setting";
import UserInfo from "components/UserInfo";
import Auxiliary from "util/Auxiliary";

import {
    NAV_STYLE_DRAWER,
    NAV_STYLE_FIXED,
    NAV_STYLE_MINI_SIDEBAR,
    TAB_SIZE
} from "../../constants/ThemeSetting";
import { connect } from "react-redux";
import LanguagesList from "../../components/LanguagesList";

import languageData from './languageData';
const { Header } = Layout;

class Topbar extends Component {
    state = {
        searchText: ""
    };

    languageMenu = () => (
        <CustomScrollbars className="gx-popover-lang-scroll" />
    );

    updateSearchChatUser = evt => {
        this.setState({
            searchText: evt.target.value
        });
    };

    handleLanguageChange(language) {
        this.props.changeLanguage(language);
        let locale = languageData.find(e => e.id === language);
        if (locale) {
            this.props.switchLanguage(locale);
            this.props.changeLanguage(language);
        }
        this.updateUserDefaultLanguage(language);
    }

    updateUserDefaultLanguage = async (language) => {
        if (this.props.authUser && this.props.authUser.id) {
            let response = await axios.put(`admin/user/${this.props.authUser.id}`, {
                preferredLang: language
            });
            if (response && response.code === 'OK') {
            } else {
                console.log(`${response.message}`);
            }
        }
    }

    render() {
        const { width, navCollapsed, navStyle } = this.props;
        return (
            <Auxiliary>
                <Header>
                    {navStyle === NAV_STYLE_DRAWER ||
                        ((navStyle === NAV_STYLE_FIXED ||
                            navStyle === NAV_STYLE_MINI_SIDEBAR) &&
                            width < TAB_SIZE) ? (
                            <div className="gx-linebar gx-mr-3">
                                <i
                                    className="gx-icon-btn icon icon-menu"
                                    onClick={() => {
                                        this.props.toggleCollapsedSideNav(
                                            !navCollapsed
                                        );
                                    }}
                                />
                            </div>
                        ) : null}
                    {/* <Link to="/" className="gx-d-block gx-d-lg-none gx-pointer">
                        <img alt="" src={require("assets/images/w-logo.png")} />
                    </Link> */}

                    {/* <SearchBox styleName="gx-d-none gx-d-lg-block gx-lt-icon-search-bar-lg"
                        placeholder="Search in app..."
                        onChange={this.updateSearchChatUser.bind(this)}
                        value={this.state.searchText} /> */}
                    <ul className="gx-header-notifications gx-ml-auto">
                        {/* <li className="gx-notify gx-notify-search gx-d-inline-block">
                            <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={
                                <SearchBox styleName="gx-popover-search-bar"
                                    placeholder="Search in app..."
                                    onChange={this.updateSearchChatUser.bind(this)}
                                    value={this.state.searchText} />
                            } trigger="click">
                                <span className="gx-pointer gx-d-block"><i className="icon icon-search-new" /></span>
                            </Popover>
                        </li>

                        <Auxiliary>
                            <li className="gx-notify">
                                <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={<AppNotification />}
                                    trigger="click">
                                    <span className="gx-pointer gx-d-block"><i className="icon icon-notification" /></span>
                                </Popover>
                            </li>

                            <li className="gx-msg">
                                <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight"
                                    content={<MailNotification />} trigger="click">
                                    <span className="gx-pointer gx-status-pos gx-d-block">
                                        <i className="icon icon-chat-new" />
                                        <span className="gx-status gx-status-rtl gx-small gx-orange" />
                                    </span>
                                </Popover>
                            </li>
                        </Auxiliary> */}

                        <li className="gx-user-nav">
                            <LanguagesList selected={this.props.language}
                                onSelect={this.handleLanguageChange.bind(this)}
                                authUser={this.props.authUser}
                            />
                        </li>
                            {/* <li className="gx-user-nav">
                                <UserInfo />
                            </li> */}
                    </ul>
                </Header>
            </Auxiliary>
        );
    }
}

const mapStateToProps = ({ settings, auth }) => {
    const { locale, navStyle, navCollapsed, width, language } = settings;
    const { authUser } = auth;
    return { locale, navStyle, navCollapsed, width, language, authUser };
};

export default connect(
    mapStateToProps,
    { toggleCollapsedSideNav, switchLanguage, changeLanguage }
)(Topbar);
