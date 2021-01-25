/* eslint-disable max-nested-callbacks */
import { Button, Icon, Row, Affix } from 'antd';
import { MENU_LIST_MODULES, PAGE_PERMISSION, SUBSCRIPTION_VISIBLE, RENTAL_VISIBLE, NEST_VISIBLE, TASK_MODULE_VISIBLE, COMMUNITY_MODE_VISIBLE, WALLET_CONFIG_VISIBLE, FEEDER_VISIBLE, BOOKING_PASS_VISIBLE, REFERRAL_CODE_VISIBLE } from '../../constants/Common';
import React, { Component } from 'react';
import ActionButtons from '../../components/ActionButtons';
import { Link } from 'react-router-dom';
import axios from 'util/Api';

const _ = require('lodash');

class Roles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            count: 0,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    isDeleted: false
                }
            }
        };
        this.menuListModules = JSON.parse(JSON.stringify(MENU_LIST_MODULES));
        if (SUBSCRIPTION_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.SUBSCRIPTION);
        }
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
        if (WALLET_CONFIG_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.WALLET_CONFIG);
        }
        if (RENTAL_VISIBLE === false) {
            this.menuListModules = this.menuListModules.filter(el => el.module !== PAGE_PERMISSION.RENTAL &&
                el.module !== PAGE_PERMISSION.RENTAL_PAYMENT);
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
        this.fetch();
    }
    fetch = async () => {
        try {
            let response = await axios.post('admin/roles/paginate', this.state.filter);
            if (response.code === 'OK') {
                let listArray = response.data && response.data.list;
                _.each(listArray, (record) => {
                    let permissionArray = record.permissions;
                    let permissionData = [];
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
                    _.each(JSON.parse(JSON.stringify(this.menuListModules)), (value, index) => {
                        if (permissionData) {
                            if (!permissionData[index]) {
                                value.permissions.list = false;
                                value.permissions.view = false;
                                value.permissions.insert = false;
                                value.permissions.update = false;
                                value.permissions.delete = false;
                                permissionData.push(value);
                            }
                            if (value.module !== permissionData[index].module) {
                                value.permissions.list = false;
                                value.permissions.view = false;
                                value.permissions.insert = false;
                                value.permissions.update = false;
                                value.permissions.delete = false;
                                permissionData.splice(index, 0, value);
                            }
                        }
                    });
                    record.permissions = permissionData;

                });
                this.setState({
                    total: response.data.count,
                    data: response.data.list,
                    loading: false
                });
            } else {
                this.setState({
                    total: 0,
                    data: [],
                    loading: false
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    render() {
        const { data, loading } = this.state;
        let menu = this.menuListModules;
        return (
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Roles</h1>
                            <Row>
                                <div className="gx-mr-3">
                                    <Link to={`/e-scooter/roles/upsert`}>
                                        <Button type="primary" className="m-b-0">
                                            Add
                                        </Button>
                                    </Link>
                                </div>
                            </Row>
                        </Row>
                    </div>
                </Affix>
                <div className="RidersList RiderTableList roles">
                    <div className="ant-table-wrapper gx-table-responsive">
                        <div className="ant-table ant-table-default ant-table-scroll-position-left">
                            <div className="ant-table-content">
                                <div className="ant-table-body">
                                    <table loading={loading}>
                                        <thead className="ant-table-thead">
                                            <tr>
                                                <th className="ant-table-row-cell-break-word">
                                                    Module
                                                </th>
                                                {data.map((record, index) => {

                                                    return <th key={`record${index}`} className="zoneActionButton" >
                                                        <span style={{ float: 'left' }}>{record.title}
                                                            <ActionButtons
                                                                pageId={9}
                                                                edit={`/e-scooter/roles/upsert`}
                                                                filter={record.id}
                                                                deleteObj={{
                                                                    documentId: record.id,
                                                                    model: 'roles',
                                                                    isSoftDelete: true
                                                                }}
                                                                deleteFn={(res) => {
                                                                    if (res === 'success') {
                                                                        this.fetch();
                                                                    }
                                                                }}
                                                            />
                                                        </span>
                                                    </th>;
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody className="ant-table-tbody">
                                            {menu.map((item, index) => {
                                                return <>
                                                    <tr>
                                                        <td><b>
                                                            {item.name}
                                                        </b></td>
                                                    </tr>
                                                    {_.map(Object.keys(item.permissions), (value) => {
                                                        return item.permissions[value] ? <tr>
                                                            <td>
                                                                {item.permissions[value] ? value : ''}
                                                            </td>
                                                            {this.state.data.map((record) => {
                                                                let val = record.permissions[index] ? record.permissions[index].permissions[value] : false;

                                                                return <td key="permissions">
                                                                    {item.permissions[value] ?
                                                                        <Icon type={val ?
                                                                            'check-circle' :
                                                                            'close-circle'}
                                                                            style={{ color: val ? '#008000' : '#CC0000' }}
                                                                            theme="outlined"
                                                                        /> :
                                                                        ''}
                                                                </td>;
                                                            })}
                                                        </tr> : '';
                                                    })}
                                                </>;
                                            })}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Roles;

