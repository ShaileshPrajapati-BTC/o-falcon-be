import {
    NAV_STYLE_DRAWER,
    NAV_STYLE_FIXED,
    NAV_STYLE_MINI_SIDEBAR,
    TAB_SIZE
} from "../../constants/ThemeSetting";
import React, { Component } from "react";
import {
    onNavStyleChange,
    toggleCollapsedSideNav
} from "appRedux/actions/Setting";

import { ReactComponent as Logo } from "../../assets/images/logo.svg";
import { ReactComponent as ClientLogo } from "../../assets/images/client-logo.svg";
import { ReactComponent as PartnerLogo } from "../../assets/images/partner-logo.svg";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { USER_TYPES } from "../../constants/Common";

class SidebarLogo extends Component {
    render() {
        const { width } = this.props;
        let { navStyle, authUser } = this.props;
        if (width < TAB_SIZE && navStyle === NAV_STYLE_FIXED) {
            navStyle = NAV_STYLE_DRAWER;
        }

        return (
            <div className="gx-layout-sider-header">
                {navStyle === NAV_STYLE_FIXED ||
                    navStyle === NAV_STYLE_MINI_SIDEBAR ? (
                        <div className="gx-linebar"></div>
                    ) : null}
                <Link to="/" className="gx-site-logo">
                    {authUser.type === USER_TYPES.FRANCHISEE
                        ? <PartnerLogo />
                        : authUser.type === USER_TYPES.DEALER
                            ? <ClientLogo />
                            : <Logo />
                    }
                </Link>
            </div>
        );
    }
}

const mapStateToProps = ({ settings, auth }) => {
    const { authUser } = auth;
    const { navStyle, themeType, width, navCollapsed } = settings;

    return { navStyle, themeType, width, navCollapsed, authUser };
};

export default connect(mapStateToProps, {
    onNavStyleChange,
    toggleCollapsedSideNav
})(SidebarLogo);
