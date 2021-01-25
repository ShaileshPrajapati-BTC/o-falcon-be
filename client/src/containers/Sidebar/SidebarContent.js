import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Menu } from 'antd';
import { Link } from 'react-router-dom';
import CommissionMenu from './CommissionMenu';
import CustomScrollbars from 'util/CustomScrollbars';
import SidebarLogo from './SidebarLogo';

import Auxiliary from 'util/Auxiliary';
import UserProfile from './UserProfile';
import {
    NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
    NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
    THEME_TYPE_LITE
} from '../../constants/ThemeSetting';

import {
    MENU,
    SUBSCRIPTION_VISIBLE,
    PAGE_PERMISSION,
    USER_TYPES,
    RENTAL_VISIBLE,
    TASK_MODULE_VISIBLE,
    STAFF_VISIBLE,
    COMMUNITY_MODE_VISIBLE,
    FEEDER_VISIBLE,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE,
    REFERRAL_CODE_VISIBLE
} from '../../constants/Common';

import { ReactComponent as Analtytics } from '../../assets/svg/analytics.svg';
import { ReactComponent as Contact } from '../../assets/svg/contact.svg';
import { ReactComponent as Dashboard } from '../../assets/svg/dashboard.svg';
import { ReactComponent as Dispute } from '../../assets/svg/dispute.svg';
import { ReactComponent as Heatmap } from '../../assets/svg/heatMap.svg';
import { ReactComponent as Notifications } from '../../assets/svg/notifications.svg';
import { ReactComponent as Payment } from '../../assets/svg/payment.svg';
import { ReactComponent as Vehicle } from '../../assets/svg/vehicle.svg';
import { ReactComponent as Partner } from '../../assets/svg/logo.svg';
import RentalMenu from './RentalMenu';
import TaskMenu from './TaskMenu';
import CommunityMenu from './CommunityMenu';

const _ = require('lodash');

class SidebarContent extends Component {

    components = {
        Vehicle: Vehicle,
        Analtytics: Analtytics,
        Dashboard: Dashboard,
        Dispute: Dispute,
        Notifications: Notifications,
        Payment: Payment,
        Heatmap: Heatmap,
        Contact: Contact,
        Partner: Partner,
    }

    getNoHeaderClass = (navStyle) => {
        if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR || navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) {
            return 'gx-no-header-notifications';
        }

        return '';
    };
    getNavStyleSubMenuClass = (navStyle) => {
        if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR) {
            return 'gx-no-header-submenu-popup';
        }

        return '';
    };

    getActiveMenuStyle = (path) => {
        const updatedPathArray = path.split('/');
        const updatedPath = '/' + updatedPathArray[1] + '/' + updatedPathArray[2] + '/';
        let currentPath = window.location.pathname;
        const updatedCurrentPathArray = currentPath.split('/');
        const updatedCurrentPath = '/' + updatedCurrentPathArray[1] + '/' + updatedCurrentPathArray[2] + '/';
        if (updatedCurrentPath.includes(updatedPath)) {
            return 'active-menu-escooter';
        }

        return '';

    }

    returnSvg = (svg) => {
        const Tag = this.components[svg];

        return <Tag />;
    }
    render() {
        const { pathname, navStyle, themeType, auth } = this.props;
        let sidebarMenu = MENU;
        if (!auth || !auth.authUser) {
            return true;
        }
        if (SUBSCRIPTION_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.SUBSCRIPTION);
        }
        if (RENTAL_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.RENTAL)
        }
        if (TASK_MODULE_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.TASKSETUP);
        }
        if (COMMUNITY_MODE_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.COMMUNITY_MODE);
        }
        if (auth.authUser.type === USER_TYPES.FRANCHISEE) {
            if (!STAFF_VISIBLE) {
                sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.USERS);
            } else {
                let index = _.findIndex(sidebarMenu, { id: PAGE_PERMISSION.USERS });
                sidebarMenu[index].name = "Staff"
            }
        }
        if (FEEDER_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.FEEDER);
        }
        if (REFERRAL_CODE_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.REFERRAL_CODE);

        }
        let franchiseeTabs = [
            PAGE_PERMISSION.SERVICE_REQUEST,
            PAGE_PERMISSION.COMMISSION,
            PAGE_PERMISSION.COMMISSION_PAYOUT,
            PAGE_PERMISSION.COMMISSION_REPORT,
            PAGE_PERMISSION.LOCATION,
            PAGE_PERMISSION.FRANCHISEE,
            PAGE_PERMISSION.RENTAL,
            PAGE_PERMISSION.RENTAL_PAYMENT,
            PAGE_PERMISSION.RENTAL_PAYMENT_CLIENT
        ]
        if (FRANCHISEE_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => !franchiseeTabs.includes(el.id));
        }
        if (CLIENT_VISIBLE === false) {
            sidebarMenu = sidebarMenu.filter(el => el.id !== PAGE_PERMISSION.DEALER);
        }
        let menuPermission = auth.authUser.accessPermission;
        const selectedKeys = pathname.substr(1);
        const defaultOpenKeys = selectedKeys.split('/')[1];
        let loginUserType = 1;
        if (auth && auth.authUser && auth.authUser.type) {
            loginUserType = auth.authUser.type;
        }

        return (
            <Auxiliary>
                <SidebarLogo />
                <div className="gx-sidebar-content">
                    <div className={`gx-sidebar-notifications ${this.getNoHeaderClass(navStyle)}`}>
                        <UserProfile pathname={pathname} />
                        {/* <AppsNavigation /> */}
                    </div>
                    <CustomScrollbars className="gx-layout-sider-scrollbar">
                        <Menu
                            defaultOpenKeys={[defaultOpenKeys]}
                            selectedKeys={[selectedKeys]}
                            theme={themeType === THEME_TYPE_LITE ? 'lite' : 'dark'}
                            mode="inline"
                        >
                            {
                                sidebarMenu.map((menu) => {
                                    let indexes = _.findIndex(menuPermission, { module: menu.id });
                                    let hasPermission = menuPermission[indexes] && menuPermission[indexes].permissions &&
                                        menuPermission[indexes].permissions.list;
                                    return hasPermission ?
                                        menu.id === PAGE_PERMISSION.TASKSETUP ?
                                            <TaskMenu pathname={pathname} menu={menu} key={menu.id} />
                                            :
                                            menu.id === PAGE_PERMISSION.RENTAL && FRANCHISEE_VISIBLE ?
                                                <RentalMenu pathname={pathname} menu={menu} key={menu.id} />
                                                :
                                                menu.id === PAGE_PERMISSION.COMMUNITY_MODE ?
                                                    <CommunityMenu pathname={pathname} menu={menu} key={menu.id} />
                                                    :
                                                    menu.id === PAGE_PERMISSION.COMMISSION && FRANCHISEE_VISIBLE ?
                                                        <CommissionMenu pathname={pathname} menu={menu} key={menu.id} />
                                                        :
                                                        <Menu.Item key={menu.id} className={this.getActiveMenuStyle(menu.path)}>
                                                            <Link to={menu.path ? menu.path : ''}>
                                                                {
                                                                    menu.svg ? <i className="anticon"> {this.returnSvg(menu.svg)}</i> : <Icon type={menu.icon} />
                                                                }
                                                                <span>{menu.name}</span>
                                                            </Link>
                                                        </Menu.Item>
                                        : '';
                                })
                            }
                        </Menu>
                    </CustomScrollbars>
                </div>
            </Auxiliary >
        );
    }
}

SidebarContent.propTypes = {};
const mapStateToProps = ({ auth, settings }) => {
    const { navStyle, themeType, locale, pathname } = settings;

    return { navStyle, themeType, locale, pathname, auth };
};

export default connect(mapStateToProps)(SidebarContent);
