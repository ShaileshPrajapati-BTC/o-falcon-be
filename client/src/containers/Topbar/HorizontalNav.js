import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import {
    NAV_STYLE_ABOVE_HEADER,
    NAV_STYLE_BELOW_HEADER,
    NAV_STYLE_DEFAULT_HORIZONTAL,
    NAV_STYLE_INSIDE_HEADER_HORIZONTAL
} from "../../constants/ThemeSetting";
import {
    MENU, PAGES_PERMISSION
} from "../../constants/Common";

const SubMenu = Menu.SubMenu;

class HorizontalNav extends Component {

    getNavStyleSubMenuClass = (navStyle) => {
        switch (navStyle) {
            case NAV_STYLE_DEFAULT_HORIZONTAL:
                return "gx-menu-horizontal gx-submenu-popup-curve";
            case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
                return "gx-menu-horizontal gx-submenu-popup-curve gx-inside-submenu-popup-curve";
            case NAV_STYLE_BELOW_HEADER:
                return "gx-menu-horizontal gx-submenu-popup-curve gx-below-submenu-popup-curve";
            case NAV_STYLE_ABOVE_HEADER:
                return "gx-menu-horizontal gx-submenu-popup-curve gx-above-submenu-popup-curve";
            default:
                return "gx-menu-horizontal";

        }
    };

    render() {
        const { pathname, navStyle, auth } = this.props;
        const selectedKeys = pathname.substr(1);
        const defaultOpenKeys = selectedKeys.split('/')[1];
        let loginUserType = 1;
        if (auth && auth.authUser && auth.authUser.type) {
             loginUserType = auth.authUser.type;
        }
        return (

            <Menu
                defaultOpenKeys={[defaultOpenKeys]}
                selectedKeys={[selectedKeys]}
                mode="horizontal">
                {
                    MENU.map((menu) => {
                        return menu.children && menu.children.length ?
                            PAGES_PERMISSION[loginUserType].indexOf(menu.id) > -1 && <SubMenu className={this.getNavStyleSubMenuClass(navStyle)} key={menu.name}
                                title={<span> 
                                    {menu.name}</span>}>
                                {
                                    menu.children.map((m) => {
                                        return PAGES_PERMISSION[loginUserType].indexOf(m.id) > -1 && <Menu.Item key={m.path.replace("/","")}>
                                            <Link to={m.path}>
                                                {m.name}</Link>
                                        </Menu.Item>
                                    })
                                }
                            </SubMenu> :  PAGES_PERMISSION[loginUserType].indexOf(menu.id) > -1 &&  <Menu.Item key={menu.path.replace("/","")}>
                                <Link to={menu.path}>
                                    {menu.name}</Link>
                            </Menu.Item>
                    })
                }
            </Menu>
        );
    }
}

HorizontalNav.propTypes = {};
const mapStateToProps = ({ auth, settings }) => {
    const { themeType, navStyle, pathname, locale } = settings;
    return { themeType, navStyle, pathname, locale, auth }
};
export default connect(mapStateToProps)(HorizontalNav);