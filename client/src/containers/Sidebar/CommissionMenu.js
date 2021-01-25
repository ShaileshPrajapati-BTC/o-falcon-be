import './index.css';
import { Popover, Menu, Icon } from 'antd';
import React, { Component } from 'react';
import { COMMISSION_SUBMENU } from '../../constants/Common';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
const _ = require('lodash');

class CommissionMenu extends Component {
    state = {
        popoverVisible: false
    }

    getActiveMenuStyle = (path) => {
        const updatedPathArray = path.split('/');
        const updatedPath = updatedPathArray[2];
        let currentPath = this.props.pathname;
        const updatedCurrentPathArray = currentPath.split('/');
        if (updatedCurrentPathArray.includes(updatedPath)) {
            return 'slider-menu-bar active';
        }
        return 'slider-menu-bar';
    }

    closePopover = () => {
        this.setState({ popoverVisible: false });
    }

    handleVisibleChange = popoverVisible => {
        this.setState({ popoverVisible });
    };

    render() {
        const { authUser, menu } = this.props;
        let menuPermission = authUser.accessPermission;
        const userMenuOptions =
            <ul className="gx-user-popover">
                <div className="tooltipPadding">
                    <>
                        {
                            COMMISSION_SUBMENU.map((setupmodule) => {
                                let indexes = _.findIndex(menuPermission, { module: setupmodule.id });
                                let hasPermission = menuPermission[indexes] && menuPermission[indexes].permissions &&
                                    menuPermission[indexes].permissions.list;
                                return hasPermission ?
                                    <li key={setupmodule.id} className={this.getActiveMenuStyle(setupmodule.path)}
                                        onClick={this.closePopover.bind(this)} >
                                        <Link to={setupmodule.path}>{setupmodule.name}</Link>
                                    </li> : ' ';
                            })

                        }
                    </>
                </div>
            </ul>;

        return (
            <Popover placement="rightTop" className="ant-menu-item" content={userMenuOptions}
                onVisibleChange={this.handleVisibleChange} trigger="click" visible={this.state.popoverVisible}>
                <Menu.Item key={menu.id} >
                    <a href="/#" onClick={(e) => {
                        e.preventDefault();
                    }}>
                        {
                            menu.svg ? <i className="anticon"> {this.returnSvg(menu.svg)}</i> : <Icon type={menu.icon} />
                        }
                        <span>{menu.name}</span>
                    </a>
                </Menu.Item>
            </Popover >
        );
    }
}

const mapStateToProps = ({ auth }) => {
    const { authUser } = auth;

    return { authUser };
};

export default connect(mapStateToProps)(CommissionMenu);
