/* eslint-disable max-len */
import { Affix, Button, Checkbox, Col, Input, Row, message } from 'antd';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    MENU_LIST_MODULES, SUBSCRIPTION_VISIBLE, PAGE_PERMISSION, RENTAL_VISIBLE, NEST_VISIBLE, WALLET_CONFIG_VISIBLE, TASK_MODULE_VISIBLE, COMMUNITY_MODE_VISIBLE, FEEDER_VISIBLE, BOOKING_PASS_VISIBLE, REFERRAL_CODE_VISIBLE
} from '../../constants/Common';
import axios from 'util/Api';

const _ = require('lodash');
let menu = MENU_LIST_MODULES;
if (SUBSCRIPTION_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.SUBSCRIPTION);
}
if (RENTAL_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.RENTAL && el.module !== PAGE_PERMISSION.RENTAL_PAYMENT);
}
if (NEST_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.NEST);
}
if (TASK_MODULE_VISIBLE === false) {
    menu = menu.filter(el =>
        el.module !== PAGE_PERMISSION.TASKSETUP &&
        el.module !== PAGE_PERMISSION.CREATE_TASK
    );
}
if (COMMUNITY_MODE_VISIBLE === false) {
    menu = menu.filter(el =>
        el.module !== PAGE_PERMISSION.COMMUNITY_MODE &&
        el.module !== PAGE_PERMISSION.VEHICLE_REPORT
    );
}
if (WALLET_CONFIG_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.WALLET_CONFIG);
}
if (FEEDER_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.FEEDER);
}
if (BOOKING_PASS_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.BOOKING_PASS);
}
if (REFERRAL_CODE_VISIBLE === false) {
    menu = menu.filter(el => el.module !== PAGE_PERMISSION.REFERRAL_CODE);
}
class RolesUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            data: [],
            isActive: false,
            default: false,
            role: '',
            disableAll: true,
            view: false,
            insert: false,
            update: false,
            delete: false,
            all: false,
            user: {},
            temp: [],
            isAppliedToAll: false
        };
        this.menuListModules = JSON.parse(JSON.stringify(MENU_LIST_MODULES));
        if (NEST_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.NEST);
        }
        if (TASK_MODULE_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el =>
                el.module !== PAGE_PERMISSION.TASKSETUP &&
                el.module !== PAGE_PERMISSION.CREATE_TASK
            );
        }
        if (COMMUNITY_MODE_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el =>
                el.module !== PAGE_PERMISSION.COMMUNITY_MODE &&
                el.module !== PAGE_PERMISSION.VEHICLE_REPORT
            );
        }
        if (SUBSCRIPTION_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.SUBSCRIPTION);
        }
        if (WALLET_CONFIG_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.WALLET_CONFIG);
        }
        if (RENTAL_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.RENTAL && el.module !== PAGE_PERMISSION.RENTAL_PAYMENT);
        }
        if (FEEDER_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.FEEDER);
        }
        if (BOOKING_PASS_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.BOOKING_PASS);
        }
        if (REFERRAL_CODE_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.REFERRAL_CODE);
        }
    }
    componentDidMount() {
        let id;
        if (this.props.location.uid) {
            id = this.props.location.uid;
        } else if (this.props.location.filter) {
            id = this.props.location.filter;
        }
        this.fetch(id);
    }
    fetch = async (id) => {
        if (id) {
            let count = true;
            let response;
            try {
                //To edit custom permission for any user.
                if (this.props.location.uid) {
                    response = await axios.get(`admin/user/${id}`);
                    if (response.code === 'OK') {
                        if (response.data.accessPermission !== null) {
                            let permissionArray = response.data && response.data.accessPermission;
                            let permissionData = [];
                            //To make data coming from database unique and similar to constant
                            _.each(this.menuListModules, (value, index) => {
                                _.each(permissionArray, (val, i) => {
                                    let isDuplicate = permissionData.some((e) => {
                                        return e.module === val.module;
                                    });
                                    if (value.module === val.module && !isDuplicate) {
                                        permissionData.push(val);
                                    }
                                });
                            });
                            _.each(this.menuListModules, (value, index) => {
                                if (permissionData) {
                                    //This will be true when any role has been added to constant
                                    if (!permissionData[index]) {
                                        let tempData = value;
                                        tempData.permissions.list = false;
                                        tempData.permissions.view = false;
                                        tempData.permissions.insert = false;
                                        tempData.permissions.update = false;
                                        tempData.permissions.delete = false;
                                        permissionData.push(tempData);
                                    }
                                    //This will be true when any changes made in constant in between
                                    if (value.module !== permissionData[index].module) {
                                        let tempData = value;
                                        tempData.permissions.list = false;
                                        tempData.permissions.view = false;
                                        tempData.permissions.insert = false;
                                        tempData.permissions.update = false;
                                        tempData.permissions.delete = false;
                                        permissionData.splice(index, 0, tempData);
                                    }
                                }
                            });
                            this.setState({
                                user: response.data,
                                data: permissionData,
                                role: response.data.roles,
                                isActive: response.data.isActive,
                                id: id
                            });
                        } else {
                            let setData = JSON.parse(JSON.stringify(this.menuListModules));
                            _.each(setData, (data) => {
                                data.permissions.list = false;
                                data.permissions.view = false;
                                data.permissions.insert = false;
                                data.permissions.update = false;
                                data.permissions.delete = false;
                            });
                            this.setState({ data: setData, user: response.data, id: id });
                        }
                    } else {
                        message.error(response.message);
                    }
                } else {
                    //To edit exsiting role
                    response = await axios.get(`/admin/roles/${id}`);
                    if (response.code === 'OK') {
                        let permissionArray = response.data && response.data.permissions;
                        let permissionData = [];
                        //To make data coming from database unique and similar to constant
                        _.each(this.menuListModules, (value, index) => {
                            _.each(permissionArray, (val, i) => {
                                let isDuplicate = permissionData.some((e) => {
                                    return e.module === val.module;
                                });
                                if (value.module === val.module && !isDuplicate) {
                                    permissionData.push(val);
                                }
                            });
                        });
                        _.each(this.menuListModules, (value, index) => {
                            if (permissionData) {
                                //This will be true when any role has been added to constant
                                if (!permissionData[index]) {
                                    let tempData = value;
                                    tempData.permissions.list = false;
                                    tempData.permissions.view = false;
                                    tempData.permissions.insert = false;
                                    tempData.permissions.update = false;
                                    tempData.permissions.delete = false;
                                    permissionData.push(tempData);
                                }
                                //This will be true when any changes made in constant in between
                                if (value.module !== permissionData[index].module) {
                                    let tempData = value;
                                    tempData.permissions.list = false;
                                    tempData.permissions.view = false;
                                    tempData.permissions.insert = false;
                                    tempData.permissions.update = false;
                                    tempData.permissions.delete = false;
                                    permissionData.splice(index, 0, tempData);
                                }
                            }
                        });

                        this.setState({
                            data: permissionData,
                            role: response.data.title,
                            isActive: response.data.isActive,
                            id: id
                        });
                    } else {
                        message.error(response.message);
                    }
                }
                let cloneData = _.cloneDeep(this.state.data);
                _.each(cloneData, (data) => {
                    if (!data.permissions.list) {
                        count = false;
                    }
                });
                this.setState({ data: cloneData });
                if (count) {
                    this.setState({ all: true, disableAll: false });
                    this.checkAll();
                }

            } catch (error) {
                console.log('Error****:', error.message);
                message.error(response.message);
            }
        } else {
            let setData = JSON.parse(JSON.stringify(this.menuListModules));
            _.each(setData, (data) => {
                data.permissions.list = false;
                data.permissions.view = false;
                data.permissions.insert = false;
                data.permissions.update = false;
                data.permissions.delete = false;
            });
            this.setState({ data: setData });
        }
    }
    checkAll = () => {
        let v = true;
        let i = true;
        let u = true;
        let d = true;

        _.each(this.menuListModules, (value, index) => {
            // if (index < this.state.data[index]) {
            if (value.permissions.view !== this.state.data[index].permissions.view) {
                v = false;
            }
            if (value.permissions.insert !== this.state.data[index].permissions.insert) {
                i = false;
            }
            if (value.permissions.update !== this.state.data[index].permissions.update) {
                u = false;
            }
            if (value.permissions.delete !== this.state.data[index].permissions.delete) {
                d = false;
            }
            // }
        });
        this.setState({
            view: v,
            insert: i,
            update: u,
            delete: d
        });

    }
    handleSubmit = async () => {
        if (this.props.location.uid) {
            let obj = this.state.user;
            obj.accessPermission = this.state.data;
            let id = this.state.id;
            try {
                let response = await axios.put(`admin/user/${id}`, obj);
                if (response.code === 'OK') {
                    message.success(response.message);
                    this.props.history.push({
                        pathname: `/e-scooter/users`,
                        filter: this.props.location.filter
                    });
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(error);
            }
        } else {
            let obj = {};
            obj.permissions = this.state.data;
            obj.title = this.state.role;
            obj.isActive = this.state.isActive;
            obj.isAppliedToAll = this.state.isAppliedToAll;
            if (this.state.id) {
                obj.id = this.state.id;
            }

            try {
                let response = await axios.post(`/admin/roles/upsert`, obj);
                if (response.code === 'OK') {
                    message.success(response.message);
                    this.props.history.push(`/e-scooter/roles`);
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                console.log('Error****:', error.message);
                message.error(error);
            }
        }
    }
    onChange = (id, e) => {
        let index = _.findIndex(this.state.data, { module: id });
        if (index >= 0) {
            let tempData = _.clone(this.state.data);
            if (!e.target.checked) {
                tempData[index].permissions.view = false;
                tempData[index].permissions.insert = false;
                tempData[index].permissions.update = false;
                tempData[index].permissions.delete = false;
            }
            tempData[index].permissions.list = e.target.checked;
            let count = true;
            _.each(tempData, (data) => {
                if (!data.permissions.list) {
                    count = false;
                }
            });
            if (count) {
                this.setState({ all: true, disableAll: false });
            } else {
                this.setState({ all: false, disableAll: true });
            }
            this.setState({ data: tempData });
        }
    }
    onSelect = (key, id, e) => {
        let index = _.findIndex(this.state.data, { module: id });
        if (index >= 0) {
            let tempData = _.clone(this.state.data);
            tempData[index].permissions[key] = e.target.checked;
            this.setState({ data: tempData });
            this.checkAll();
        }
    }
    selectAll = (e) => {
        let setData = _.cloneDeep(this.state.data);
        if (!e.target.checked) {
            this.setState({
                disableAll: true,
                view: false,
                insert: false,
                update: false,
                delete: false
            });
            _.each(setData, (data) => {
                data.permissions.list = false;
                data.permissions.view = false;
                data.permissions.insert = false;
                data.permissions.update = false;
                data.permissions.delete = false;
            });
        } else {
            this.setState({ disableAll: false });
            _.each(setData, (data) => {
                data.permissions.list = true;
            });
        }
        this.setState({ all: e.target.checked, data: setData });
    }
    allChange = (key, e) => {
        this.setState((state) => {
            state[key] = e.target.checked;
        })
        let setData = _.cloneDeep(this.state.data);
        _.each(setData, (data, index) => {
            if (!this.state.disableAll && e.target.checked) {
                data.permissions[key] = this.menuListModules[index].permissions[key];
            } else {
                data.permissions[key] = e.target.checked;
            }
        });
        this.setState({ data: setData });
    }
    onRoleChange = (e) => {
        this.setState({ role: e.target.value });
    }
    onActiveChange = (e) => {
        this.setState({ isActive: e.target.checked });
    }
    onDefaultChange = (e) => {
        this.setState({ default: e.target.checked });
    }
    onIsAppliedToAllChange = (e) => {
        this.setState({ isAppliedToAll: e.target.checked });
    }
    // eslint-disable-next-line max-lines-per-function
    render() {
        const { role, data } = this.state;

        return (
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Add roles</h1>
                            <Row>
                                <div className="gx-mr-1">

                                </div>
                                <div className="gx-mr-3">
                                    <Link
                                        to={{
                                            pathname: this.props.location.uid ? `/e-scooter/users` : `/e-scooter/roles`,
                                            filter: this.props.location.filter ? this.props.location.filter : ''
                                        }}>
                                        <Button type="primary" className="m-b-0">
                                            List
                                        </Button>
                                    </Link>
                                    <Button type="primary" onClick={this.handleSubmit.bind(this)} className="m-b-0">
                                        Submit
                                    </Button>
                                </div>
                            </Row>
                        </Row>
                    </div>
                </Affix >
                <div style={{ padding: '0px 15px' }}>
                    Role<br />
                    <Row>
                        <Col span={10}>
                            <div className="ant-form-item-control">
                                <span className="ant-form-item-children">
                                    <Input
                                        value={role} disabled={this.state.id}
                                        onChange={this.onRoleChange.bind(this)} />
                                </span>
                            </div>
                        </Col>
                        <Col span={4}>
                            <Checkbox
                                disabled={this.state.id}
                                style={{ width: '22px', height: '22px' }}
                                value={this.state.isActive}
                                checked={this.state.isActive}
                                onChange={this.onActiveChange.bind(this)} />  Active
                        </Col>
                        <Col span={4}>
                            <Checkbox
                                value={this.state.default}
                                checked={this.state.default}
                                onChange={this.onDefaultChange.bind(this)} />  Default
                        </Col>
                        <Col span={4}>
                            <Checkbox
                                value={this.state.isAppliedToAll}
                                checked={this.state.isAppliedToAll}
                                onChange={this.onIsAppliedToAllChange.bind(this)} />  Applied To All
                        </Col>
                    </Row>
                </div>

                <div className="RidersList RiderTableList roles">
                    <div className="ant-table-wrapper gx-table-responsive">
                        <div className="ant-table ant-table-default ant-table-scroll-position-left">
                            <div className="ant-table-content">
                                <div className="ant-table-body">
                                    <table>
                                        <thead className="ant-table-thead">
                                            <tr>
                                                <th className="ant-table-row-cell-break-word">
                                                    <Checkbox
                                                        checked={this.state.all}
                                                        onChange={this.selectAll.bind(this)}
                                                        style={{ marginRight: '10px' }}
                                                    />  MODULE
                                                </th>
                                                <th>
                                                    <Checkbox
                                                        checked={this.state.all && this.state.view}
                                                        disabled={this.state.disableAll}
                                                        onChange={this.allChange.bind(this, 'view')}
                                                    />  VIEW
                                                </th>
                                                <th>
                                                    <Checkbox
                                                        checked={this.state.all && this.state.insert}
                                                        disabled={this.state.disableAll}
                                                        onChange={this.allChange.bind(this, 'insert')}
                                                    />  INSERT
                                                </th>
                                                <th>
                                                    <Checkbox
                                                        checked={this.state.all && this.state.update}
                                                        disabled={this.state.disableAll}
                                                        onChange={this.allChange.bind(this, 'update')}
                                                    />  UPDATE
                                                </th>
                                                <th>
                                                    <Checkbox
                                                        checked={this.state.all && this.state.delete}
                                                        disabled={this.state.disableAll}
                                                        onChange={this.allChange.bind(this, 'delete')}
                                                    />  DELETE
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="ant-table-tbody">
                                            {menu.map((item, index) => {
                                                return <tr key={index}>
                                                    <td>
                                                        <Checkbox
                                                            checked={data[index] && data[index].permissions.list ?
                                                                data[index].permissions.list :
                                                                false}
                                                            onChange={this.onChange.bind(this, item.module)}
                                                            style={{ marginRight: '10px' }} />
                                                        {item.name}
                                                    </td>
                                                    {/* view, insert, update, delete- these four are almost similar */}
                                                    <td>
                                                        {/* To show empty checkbox or '-' according our constant-MENU_LIST_MODULES */}
                                                        {item.permissions.view ?
                                                            <Checkbox
                                                                // Here we have used state-data to show if the value coming from database is true which is check/uncheck
                                                                checked={data[index] && data[index].permissions.view ?
                                                                    data[index].permissions.view :
                                                                    false}
                                                                disabled={data[index] && !data[index].permissions.list ?
                                                                    !data[index].permissions.list :
                                                                    false}
                                                                onChange={this.onSelect.bind(this, 'view', item.module)}
                                                            /> :
                                                            '-'}</td>
                                                    <td>
                                                        {item.permissions.insert ?
                                                            <Checkbox
                                                                checked={data[index] && data[index].permissions.insert ?
                                                                    data[index].permissions.insert :
                                                                    false}
                                                                disabled={data[index] && !data[index].permissions.list ?
                                                                    !data[index].permissions.list :
                                                                    false}
                                                                onChange={this.onSelect.bind(this, 'insert', item.module)}
                                                            /> :
                                                            '-'}</td>
                                                    <td>
                                                        {item.permissions.update ?
                                                            <Checkbox
                                                                checked={data[index] && data[index].permissions.update ?
                                                                    data[index].permissions.update :
                                                                    false}
                                                                disabled={data[index] && !data[index].permissions.list ?
                                                                    !data[index].permissions.list :
                                                                    false}
                                                                onChange={this.onSelect.bind(this, 'update', item.module)}
                                                            /> :
                                                            '-'}
                                                    </td>
                                                    <td>
                                                        {item.permissions.delete ?
                                                            <Checkbox
                                                                checked={data[index] && data[index].permissions.delete ?
                                                                    data[index].permissions.delete :
                                                                    false}
                                                                // eslint-disable-next-line max-len
                                                                disabled={data[index] && !data[index].permissions.list ?
                                                                    !data[index].permissions.list :
                                                                    false}
                                                                // eslint-disable-next-line max-len
                                                                onChange={this.onSelect.bind(this, 'delete', item.module)}
                                                            /> :
                                                            '-'}
                                                    </td>
                                                </tr>;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

        );
    }
}
export default RolesUpsert;
