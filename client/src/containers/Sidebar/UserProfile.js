import './index.css';
import { Avatar, Popover, message } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { USER_DATA } from '../../constants/ActionTypes';
import UtilLocalService from '../../services/localServiceUtil';
import { userSignOut, setSocketConnection, setSocket, updateUser } from 'appRedux/actions/Auth';
import { PAGE_PERMISSION, SOCKET_CONNECTION } from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');
class UserProfile extends Component {
    state = {
        popoverVisible: false,
        isListenEvent: false,
        notificationCount: 0,
    }

    getActiveMenuStyle = (path) => {
        const updatedPathArray = path.split('/');
        const updatedPath = updatedPathArray.length === 4 ? '/' + updatedPathArray[2] + '/' + updatedPathArray[3] : '/' + updatedPathArray[2];
        let currentPath = this.props.pathname;
        const updatedCurrentPathArray = currentPath.split('/');
        const extraPath = updatedCurrentPathArray[3] ? `/${updatedCurrentPathArray[3]}` : '';
        const updatedCurrentPath = '/' + updatedCurrentPathArray[1] + '/' + updatedCurrentPathArray[2] + extraPath;
        if (updatedCurrentPath.includes(updatedPath)) {
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

    componentDidUpdate(prevProps) {
        if (!SOCKET_CONNECTION) {
            return;
        }
        if ((this.props.socket || this.props.socket !== prevProps.socket) && !this.state.isListenEvent) {
            this.props.socket.on('notificationUpdate', ({ data }) => {
                console.log("new notification", data)
                data && message.success(data.title);
                data && this.setState(prevState => {
                    return { notificationCount: prevState.notificationCount + 1 }
                })
            });
            this.props.socket.on('adminNotificationCount', ({ data }) => {
                console.log("notification count", data)
                data && this.setState({ notificationCount: data.count })
            });
            this.props.socket.emit('getAdminNotificationCount');
            this.props.socket.on('permissionChanged', ({ data }) => {
                console.log("permissionChanged", data);
                const { authUser } = this.props;
                authUser.accessPermission = [];
                authUser.accessPermission = data;
                UtilLocalService.setLocalStorage('user', authUser);
                this.props.updateUser(authUser)
            });
            this.setState({ isListenEvent: true })
        }
    }
    logout = async () => {
        if (SOCKET_CONNECTION) {
            await this.props.socket.disconnect();
        }
        this.props.userSignOut();
    }
    render() {
        const { authUser } = this.props;
        let menuPermission = authUser.accessPermission;
        let indexes = _.findIndex(menuPermission, { module: Number(PAGE_PERMISSION.NOTIFICATIONS) });
        let hasNotificationPermission =
            menuPermission[indexes] &&
            menuPermission[indexes].permissions &&
            menuPermission[indexes].permissions.list;
        const userMenuOptions =
            <ul className="gx-user-popover">
                <div className="tooltipPadding">
                    <li className={this.getActiveMenuStyle('/e-scooter/profile')}
                        onClick={this.closePopover.bind(this)}>
                        <Link to={`/e-scooter/profile`}><IntlMessages id="app.sidebar.myAccount" /></Link>
                    </li>
                    {hasNotificationPermission &&
                        <li onClick={this.closePopover.bind(this)} className="has_notification">
                            <Link to={`/e-scooter/notification`}><IntlMessages id="app.notification.notification" /><span className="tot">{this.state.notificationCount}</span></Link>
                        </li>
                    }
                    <li onClick={this.logout.bind(this)}><IntlMessages id="app.logout" />
                    </li>
                </div>
            </ul>;

        return (

            <div className="gx-flex-row gx-align-items-center gx-mb-4 gx-avatar-row">
                <Popover placement="rightTop" className="customPopover has_new" content={userMenuOptions}
                    onVisibleChange={this.handleVisibleChange} trigger="click" visible={this.state.popoverVisible}>
                    <Avatar src={authUser && authUser.image ? authUser.image : ''} icon="user" className="gx-size-40 gx-pointer gx-mr-3 " alt="" />
                    {hasNotificationPermission && this.state.notificationCount && this.state.notificationCount > 0 ?
                        <span className="has_new_dot"></span>
                        : null
                    }
                    <span className="gx-avatar-name"><IntlMessages id="app.hi" />, {authUser ? authUser.firstName : 'Loading'}</span>
                </Popover>
            </div>

        );

    }
}

const mapStateToProps = ({ auth }) => {
    const { authUser, socket } = auth;

    return { authUser, socket };
};

export default connect(mapStateToProps, { userSignOut, updateUser, setSocketConnection, setSocket })(UserProfile);
