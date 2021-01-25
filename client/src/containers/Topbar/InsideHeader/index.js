import React, { Component } from "react";
import { Layout } from "antd";
import { connect } from "react-redux";
import CustomScrollbars from "util/CustomScrollbars";

import languageData from "../languageData";
import UserInfo from "components/UserInfo";
import HorizontalNav from "../HorizontalNav";
import { Link } from "react-router-dom";
import {
    switchLanguage,
    toggleCollapsedSideNav
} from "../../../appRedux/actions/Setting";
import IntlMessages from "../../../util/IntlMessages";

const { Header } = Layout;



class InsideHeader extends Component {
    state = {
        searchText: ""
    };

    languageMenu = () => (
        <CustomScrollbars className="gx-popover-lang-scroll">
            <ul className="gx-sub-popover">
                {languageData.map(language => (
                    <li
                        className="gx-media gx-pointer"
                        key={JSON.stringify(language)}
                        onClick={() => this.props.switchLanguage(language)}
                    >
                        <i
                            className={`flag flag-24 gx-mr-2 flag-${
                                language.icon
                            }`}
                        />
                        <span className="gx-language-text">
                            {language.name}
                        </span>
                    </li>
                ))}
            </ul>
        </CustomScrollbars>
    );

    updateSearchChatUser = evt => {
        this.setState({
            searchText: evt.target.value
        });
    };

    render() {
        const { navCollapsed } = this.props;

        return (
            <div className="gx-header-horizontal gx-header-horizontal-dark gx-inside-header-horizontal">
                <div className="gx-header-horizontal-top">
                    <div className="gx-container">
                        <div className="gx-header-horizontal-top-flex">
                            <div className="gx-header-horizontal-top-left">
                                <i className="icon icon-alert gx-mr-3" />
                                <p className="gx-mb-0 gx-text-truncate">
                                    <IntlMessages id="app.announced" />
                                </p>
                            </div>
                            <ul className="gx-login-list">
                                <li>Login</li>
                                <li>Signup</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Header className="gx-header-horizontal-main">
                    <div className="gx-container">
                        <div className="gx-header-horizontal-main-flex">
                            <div className="gx-d-block gx-d-lg-none gx-linebar gx-mr-xs-3 6e">
                                <i
                                    className="gx-icon-btn icon icon-menu"
                                    onClick={() => {
                                        this.props.toggleCollapsedSideNav(
                                            !navCollapsed
                                        );
                                    }}
                                />
                            </div>
                            <Link
                                to="/"
                                className="gx-d-block gx-d-lg-none gx-pointer gx-mr-xs-3 gx-pt-xs-1 gx-w-logo"
                            >
                                <img
                                    alt=""
                                    src={require("assets/images/logo-black.png")}
                                />
                            </Link>
                            <Link
                                to="/"
                                className="gx-d-none gx-d-lg-block gx-pointer gx-mr-xs-5 gx-logo"
                            >
                                <img
                                    alt=""
                                    src={require("assets/images/logo-black.png")}
                                />
                            </Link>

                            <div className="gx-header-horizontal-nav gx-header-horizontal-nav-curve gx-d-none gx-d-lg-block">
                                <HorizontalNav />
                            </div>
                            <ul className="gx-header-notifications gx-ml-auto">
                                <li className="gx-user-nav">
                                    <UserInfo />
                                </li>
                            </ul>
                        </div>
                    </div>
                </Header>
            </div>
        );
    }
}

const mapStateToProps = ({ settings }) => {
    const { locale, navCollapsed } = settings;
    return { locale, navCollapsed };
};
export default connect(
    mapStateToProps,
    { toggleCollapsedSideNav, switchLanguage }
)(InsideHeader);
