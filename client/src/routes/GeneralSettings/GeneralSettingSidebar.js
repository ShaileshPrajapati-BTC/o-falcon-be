
import React from 'react';
import { Menu, Icon } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { PAGE_PERMISSION, GENERAL_SETTING_MENU, WALLET_CONFIG_VISIBLE, FRANCHISEE_VISIBLE } from '../../constants/Common';
const _ = require('lodash');
const { SubMenu } = Menu;


export class GeneralSettingSidebar extends React.Component {

    constructor(props) {
        super(props);

        let currentPageKey = [];
        let currentselectedKeys = [];
        let currentPath = window.location.pathname;
        const updatedCurrentPathArray = currentPath.split('/');
        const updatedCurrentPath = '/' + updatedCurrentPathArray[1] + '/' + updatedCurrentPathArray[2] + '/' + updatedCurrentPathArray[3] + '/';
        GENERAL_SETTING_MENU.forEach((menu) => {
            menu.settingsSubMenu.forEach((submenu) => {
                const updatedPathArray = submenu.path.split('/');
                const updatedPath = '/' + updatedPathArray[1] + '/' + updatedPathArray[2] + '/' + updatedPathArray[3] + '/';
                if (updatedCurrentPath.includes(updatedPath)) {
                    currentPageKey.push(menu.key);
                    currentselectedKeys.push(submenu.key);
                }
            })
        })
        this.state = {
            openKeys: currentPageKey.length === 0 ? [] : currentPageKey,
            selectedKeys: currentselectedKeys.length === 0 ? [] : currentselectedKeys,
            selectedName: '',
            isVisible: false,
            loadedComponent: ''
        };
        this.rootSubmenuKeys = ['menu1', 'menu2', 'menu3'];
    }
    onOpenChange = openKeys => {
        const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
        if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            this.setState({ openKeys });
        } else {
            this.setState({
                openKeys: latestOpenKey ? [latestOpenKey] : [],
            });
        }
    };
    getActiveMenuStyle = (path) => {
        const updatedPathArray = path.split('/');
        const updatedPath = '/' + updatedPathArray[1] + '/' + updatedPathArray[2] + '/' + updatedPathArray[3] + '/';
        let currentPath = window.location.pathname;
        const updatedCurrentPathArray = currentPath.split('/');
        const updatedCurrentPath = '/' + updatedCurrentPathArray[1] + '/' + updatedCurrentPathArray[2] + '/' + updatedCurrentPathArray[3] + '/';
        if (updatedCurrentPath.includes(updatedPath)) {
            return 'gx-bg-primary general-setting-menu';
        }
        return '';
    }
    render() {
        const { authUser } = this.props.auth;
        let menuPermission = authUser.accessPermission;
        let settingsMenuList = GENERAL_SETTING_MENU;
        if (!WALLET_CONFIG_VISIBLE) {
            settingsMenuList = settingsMenuList.map(el => {
                const subMenuArray = el.settingsSubMenu.filter(value => value.id !== PAGE_PERMISSION.WALLET_CONFIG)
                return { id: el.id, key: el.key, title: el.title, settingsSubMenu: subMenuArray }
            })
        }
        if (!FRANCHISEE_VISIBLE) {
            settingsMenuList = settingsMenuList.map(el => {
                const subMenuArray = el.settingsSubMenu.filter(value => value.id !== PAGE_PERMISSION.LOCATION)
                return { id: el.id, key: el.key, title: el.title, settingsSubMenu: subMenuArray }
            })
        }

        let mainMenu = []
        for (let el of settingsMenuList) {
            const subMenu = el.settingsSubMenu.filter((value, i) => {
                let indexes = _.findIndex(menuPermission, { module: value.id });
                let hasPermission = menuPermission[indexes] && menuPermission[indexes].permissions
                    && menuPermission[indexes].permissions.list;
                return hasPermission && value
            })
            if (subMenu.length !== 0) {
                mainMenu.push({ id: el.id, key: el.key, title: el.title, settingsSubMenu: subMenu })
            }
        }
        settingsMenuList = mainMenu
        return (
            <React.Fragment>
                <Menu className="gen_setting_menu"
                    mode="inline"
                    openKeys={this.state.openKeys}
                    onOpenChange={this.onOpenChange}
                    style={{ width: '100%', marginTop: 95, marginLeft: 10 }}
                    inlineCollapsed={this.state.isCollapsed}
                    selectedKeys={this.state.selectedKeys}
                >
                    {
                        settingsMenuList.map((el, i) => {
                            return (
                                <SubMenu key={el.key}
                                    className="general-setting"
                                    title={<span><Icon type="setting" style={{ marginRight: 10 }} /><span>{el.title}</span></span>}>
                                    {el.settingsSubMenu.map((value, index) => {
                                        return (
                                            <Menu.Item key={value.id} className={`gx-pointer gx-text-capitalize ${this.getActiveMenuStyle(value.path)}`}>
                                                <Link to={value.path ? value.path : ''}>
                                                    <span>{value.title}</span>
                                                </Link>
                                            </Menu.Item>
                                        )
                                    })}
                                </SubMenu>)
                        })
                    }
                </Menu>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (props) => props
export default connect(mapStateToProps)(GeneralSettingSidebar);

