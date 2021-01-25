import {
    Modal, Row, message, Tag, List, DatePicker
} from 'antd';
import React from 'react';
import { DEFAULT_VEHICLE, RENTAL_VISIBLE, FILTER_BY_BATTERY, FILTER_BY_VEHICLE_TYPE, FILTER_BY_CONNECTION_TYPE, FILTER_BY_ACTIVE, DEFAULT_API_ERROR } from '../../constants/Common';
import axios from 'util/Api';
import UtilService from '../../services/util';
import Search from '../../components/ESSearch';
import { ReactComponent as Battery } from '../../assets/svg/battery.svg';
import { ReactComponent as SelectCheck } from "./selectCheck.svg";
import moment from "moment";

import FilterDropdown from '../../components/FilterDropdown';
import IntlMessages from '../../util/IntlMessages';
const _ = require("lodash");

class AssignVehicle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedRecord: [],
            total: 0,
            disabled: false,
            loading: false,
            rentdate: moment(),
            filter: {
                filter: {
                    isAvailable: true,
                    // franchiseeId:this.props.authUser.id,
                    dealerId: null,
                    isActive: true
                }
            },
        }
        //   if (DEFAULT_VEHICLE) {
        //       this.state.filter.filter.type = [DEFAULT_VEHICLE];
        //   }
        this.batteryLevel = 1;
        this.type = DEFAULT_VEHICLE;
        this.connectionStatus = 1;
    }
    componentDidMount() {
        // const { authUser } = this.props;
        // this.props.getFranchisee();
        //   if (authUser.type !== USER_TYPES.SUPER_ADMIN && authUser.type !== USER_TYPES.FRANCHISEE) {
        //       this.setState((state) => {
        //           state.filter.filter.userId = authUser.id;
        //       });
        //   }
        // let filter = localStorage.getItem("pageFilter");
        // let filter = this.props.location.filter;
        // if (filter) {
        //     this.setState({ filter: filter, paginate: false }, () => {
        //         self.fetch();
        //     });
        // } else {
        this.fetch();
        // }
    }
    fetch = async (page) => {
        this.setState({ loading: true });
        if (page) {
            this.setState((state) => {
                state.filter.page = page;
                return state;
            });
        }
        // localStorage.removeItem("pageFilter");
        try {
            let response = await axios.post(
                '/admin/vehicle/get-unassigned-vehicles',
                this.state.filter
            );
            if (response && response.code === 'OK') {
                this.setState({
                    total: response.data.count,
                    loading: false,
                    data: response.data.list,
                });
            } else {
                this.setState({
                    total: 0,
                    loading: false,
                    data: [],
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };
    onSearch = (newState) => {
        this.setState(
            {
                filter: newState,
            },
            () => {
                this.fetch();
            }
        );
    };
    handleSelection = (selectedVal, isAscending, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            isAscending: isAscending,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState((state) => {
            if (data !== 'error') {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });

        self.setState(
            (state) => {
                state.filter.page = 1;
            },
            () => { return self.fetch() }
        );
    };
    handleSubmit = async () => {
        let url = `/admin/dealer/assign-vehicle`;
        let method = `post`;
        let obj = {
            // franchiseeId: this.props.authUser.id,
            dealerId: this.props.dealerId,
            vehicleIds: this.state.selectedRecord,
        }
        if (RENTAL_VISIBLE) {
            obj.rentStartDate = this.state.rentdate;
        }
        try {
            let response = await axios[method](url, obj);
            if (response.code === 'OK') {
                message.success(`${response.message}`);
                this.setState({ selectedRecord: [] })
                this.props.handleSubmit();
            } else {
                message.error(`${response.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    selectRecord = id => {
        // set state selected
        if (id) {

            let index = _.findIndex(this.state.data, { id: id });
            if (index >= 0) {
                this.state.data[index].selected = !this.state.data[index]
                    .selected;

                if (this.state.data[index].selected) {
                    this.state.selectedRecord.push(id);
                } else {
                    let existId = _.indexOf(this.state.selectedRecord, id);
                    this.state.selectedRecord.splice(existId, 1);
                }
            }

            this.setState({
                disabled: this.state.selectedRecord.length > 0
            });
        }
    };
    rentDateChange = (date) => {
        this.setState({ rentdate: date.toISOString() })
    }
    render() {
        const { onCancel } = this.props;
        const { data, loading } = this.state;
        let FilterArray = [
            {
                title: <IntlMessages id="app.battery" defaultMessage="Battery" />,
                list: FILTER_BY_BATTERY,
                defaultSelected: this.batteryLevel,
                key: 'batteryLevel',
                visible: true
            }, {
                title: <IntlMessages id="app.type" defaultMessage="Type" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.type,
                key: 'type',
                visible: true
            }, {
                title: <IntlMessages id="app.vehicle.connectionType" defaultMessage="Connection Type" />,
                list: FILTER_BY_CONNECTION_TYPE,
                defaultSelected: this.connectionStatus,
                key: 'connectionStatus',
                visible: true
            }
        ];
        return (
            <Modal
                visible={true}
                title={<IntlMessages id="app.partner.assignVehicle" defaultMessage="Assign Vehicle" />}
                okText={<IntlMessages id="app.partner.assign" defaultMessage="Assign" />}
                cancelText={<IntlMessages id="app.cancel" defaultMessage="Cancel" />}
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                okButtonProps={{ disabled: !this.state.disabled }}
                width={1100}
            >
                <Row style={{ float: 'right', marginRight: '1px' }}>
                    <div className="SearchBarwithBtn" >
                        {RENTAL_VISIBLE && <div style={{ paddingRight: 20 }}><IntlMessages id="app.vehicle.rentStartDate" defaultMessage="Rent Start Date" /> &nbsp;&nbsp;
                      <DatePicker
                                allowClear={false}
                                placeholder={'Select Date'}
                                showToday={false}
                                onChange={this.rentDateChange}
                                defaultValue={this.state.rentdate}
                            />
                        </div>}
                        <Search
                            handelSearch={this.onSearch}
                            filter={this.state.filter}
                            keys={['name', 'qrNumber', 'imei', 'registerId']}
                            placeholder="Search by Name/QrCode/IMEI/VehicleId"
                        />
                    </div>
                </Row>
                <Row
                    type="flex"
                    align="middle"
                    justify="space-between"
                    style={{ marginTop: 53 }}
                >
                    <div className="DropdownWidth vehicleDropdownWidth">
                        {FilterArray.map((filter) => {
                            return (filter.visible && <FilterDropdown
                                title1={filter.title}
                                list={filter.list}
                                sorter={filter && filter.sorter}
                                isDesc={filter && filter.isDesc}
                                defaultSelected={
                                    filter.defaultSelected
                                }
                                handleSelection={(
                                    val,
                                    isAscending
                                ) => {
                                    this.handleSelection(
                                        val,
                                        isAscending,
                                        filter.key,
                                        filter.list
                                    );
                                }}
                            />
                            );
                        })}
                    </div>
                </Row>
                <div className="RidersList" style={{ padding: '20px 0px', height: '350px', overflow: 'auto' }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={data}
                        loading={loading}
                        renderItem={(item) => {
                            return (

                                <List.Item className={item.selected ? "list-item-selected" : ""}>
                                    <div className="ant-list-item-meta">
                                        <div className="ant-list-item-meta-avatar gx-pointer">
                                            <div className="totalRideCounter" onClick={() => this.selectRecord(item.id)}>
                                                <span className="ant-avatar ant-avatar-circle ant-avatar-image gx-pointer">
                                                    {item.selected ?
                                                        <SelectCheck /> :
                                                        <div className="scooterIdRound" style={{ paddingTop: '16px', lineHeight: 1.3 }}>
                                                            <h3>{item.registerId}</h3>
                                                            <div className="lbl">
                                                                <IntlMessages id="app.scooterId" defaultMessage="Scooter Id" />
                                                            </div>
                                                        </div>}</span>
                                            </div>
                                        </div>
                                        <div className="ant-list-item-meta-content">
                                            <div className="ant-list-item-meta">
                                                <div className="ant-list-item-meta-description m-r-20">
                                                    <b>{item.name} </b>{' '}
                                                    <Battery /><IntlMessages id="app.power" defaultMessage="Power" /> &nbsp;
                                      <b>{`${item.batteryLevel}%`}</b>
                                                </div>
                                                <div className="ant-list-item-meta-description">
                                                    <div className="connectionStatus">
                                                        <div className="lbl">
                                                            {item.connectionStatus ?
                                                                <Tag color="green"><IntlMessages id="app.connected" defaultMessage="Connected" /></Tag>
                                                                : <Tag color="red"><IntlMessages id="app.notConnected" defaultMessage="Not Connected" /></Tag>
                                                            }
                                                            {item.isActive ?
                                                                <Tag color="green"><IntlMessages id="app.active" defaultMessage="Active" /></Tag>
                                                                : <Tag color="red"><IntlMessages id="app.deactive" defaultMessage="Deactive" /></Tag>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ant-list-item-meta-content">
                                                <div className="gx-flex-row d-block-xs">
                                                    <div className="signupDate" style={{ marginTop: '0px' }}>
                                                        <IntlMessages id="app.lastConnected" defaultMessage="Last Connected" />:{' '}
                                                        <b>{UtilService.displayDate(item.lastConnectedDateTime)} </b>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="cardRightThumb">
                                            <div className="cardRightContainer flex-align-center">
                                                {/* {item.hasOwnProperty(
                                                  'lockStatus'
                                              ) &&
                                                  <div className="ant-list-item-meta-description">
                                                      <div className="connectionStatus lbl">
                                                          {item.lockStatus ?
                                                              < div className="lock_icon_block lock_block">
                                                                  <Lock />
                                                              </div> :
                                                              <div className="lock_icon_block unlock_block">
                                                                  <UnLock />
                                                              </div>}
                                                      </div>
                                                  </div>
                                              } */}
                                                <div className="action-btnsWithSignupDate">
                                                    <div className="signupDate">
                                                        <IntlMessages id="app.vehicle.imei" defaultMessage="IMEI" />:{' '}
                                                        <b>{item.imei} </b>
                                                    </div>
                                                    <div className="signupDate">
                                                        <IntlMessages id="app.vehicle.qrNumber" defaultMessage="QR Number" />:{' '}
                                                        <b>{item.qrNumber} </b>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                </div>
            </Modal >
        );
    }
}


export default AssignVehicle;
