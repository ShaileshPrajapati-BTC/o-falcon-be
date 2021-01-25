import {
    Modal, Row, message, Tag, List
} from 'antd';
import React from 'react';
import { DEFAULT_VEHICLE, USER_TYPES, FILTER_BY_BATTERY, FILTER_BY_VEHICLE_TYPE, FILTER_BY_CONNECTION_TYPE, FILTER_BY_ACTIVE, DEFAULT_API_ERROR, NEST_ROUTE } from '../../constants/Common';
import axios from 'util/Api';
import UtilService from '../../services/util';
import Search from '../../components/ESSearch';
import { ReactComponent as Battery } from '../../assets/svg/battery.svg';
import { ReactComponent as SelectCheck } from "../../assets/svg/selectCheck.svg";
import FilterDropdown from '../../components/FilterDropdown';
import ESPagination from '../../components/ESPagination';
import CustomScrollbars from '../../util/CustomScrollbars';
const _ = require("lodash");

class addVehicle extends React.Component {   //componentName
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            selectedRecord: [],
            total: 0,
            disabled: false,
            loading: false,
            paginate: false,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    imei: { '!=': '' },
                    nestId: null,
                    isAvailable: true,
                    isRideCompleted: true
                }
            },
        }
        if (DEFAULT_VEHICLE) {
            this.state.filter.filter.type = [DEFAULT_VEHICLE];
        }
        this.isActive = 1;
        this.batteryLevel = 1;
        this.type = DEFAULT_VEHICLE;
        this.connectionStatus = 1;
    }
    componentDidMount() {
        const { authUser } = this.props;
        if (authUser.type !== USER_TYPES.SUPER_ADMIN) {
            this.setState((state) => {
                state.filter.filter.userId = authUser.id;
            });
        }
        this.fetch();
    }
    fetch = async (page) => {
        this.setState({ loading: true });
        if (page) {
            this.setState((state) => {
                state.filter.page = page;
                return state;
            });
        }
        try {
            let response = await axios.post(
                'admin/vehicle/paginate',
                this.state.filter
            );
            if (response && response.code === 'OK') {
                this.setState({
                    total: response.data.count,
                    loading: false,
                    data: response.data.list,
                    paginate: true
                });
            } else {
                this.setState({
                    total: 0,
                    loading: false,
                    data: [],
                    paginate: true
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };
    onSearch = (newState) => {
        this.setState({
            filter: newState,
            paginate: false
        }, () => { this.fetch(); }
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
                state.paginate = false;
            },
            () => { return self.fetch() }
        );
    };
    handleSubmit = async () => {
        if (this.state.selectedRecord.length === 0) {
            message.error(`Please select ${NEST_ROUTE}!`);
            return;
        }
        if (this.props.availableSlot < this.state.selectedRecord.length) {
            message.error(`You cann't add vehicle over ${NEST_ROUTE} capacity!`);
            return;
        }
        let url = `/admin/nest/assign-vehicle`;
        let method = `post`;
        let obj = { nestId: this.props.nestId, vehicleId: this.state.selectedRecord }

        try {
            let response = await axios[method](url, obj);
            if (response.code === 'OK') {
                message.success(`${response.message}`);
                this.setState({ selectedRecord: [] })
                this.props.onSubmit();
            } else {
                message.error(`${response.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    selectRecord = id => {
        if (id) {
            let data = [...this.state.data]
            let index = _.findIndex(data, { id: id });
            if (index >= 0) {
                data[index].selected = !data[index].selected;

                if (data[index].selected) {
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
    render() {
        const { onCancel } = this.props;
        const { data, loading } = this.state;
        let FilterArray = [
            {
                title: 'Battery',
                list: FILTER_BY_BATTERY,
                defaultSelected: this.batteryLevel,
                key: 'batteryLevel',
                visible: true
            }, {
                title: 'Type',
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.type,
                key: 'type',
                visible: true
            }, {
                title: 'Connection Type',
                list: FILTER_BY_CONNECTION_TYPE,
                defaultSelected: this.connectionStatus,
                key: 'connectionStatus',
                visible: true
            }, {
                title: 'Status',
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: 'isActive',
                visible: true
            }
        ];
        return (
            <Modal
                visible={true}
                title='Add Vehicle'      //Modal title
                okText='Add'      //add button text
                onCancel={onCancel}
                onOk={this.handleSubmit.bind(this)}
                width={900}
            >
                <Row type="flex" align="middle" justify="space-between">
                    Selected Vehicles : &nbsp;{this.state.selectedRecord.length}
                    <span>
                        Available Slots of Vehicle : &nbsp;{this.props.availableSlot}
                    </span>
                    <div className="SearchBarwithBtn" >
                        <Search
                            handelSearch={this.onSearch}
                            filter={this.state.filter}
                            keys={['name', 'qrNumber', 'imei', 'registerId']}
                            placeholder="Search by Name/QrCode/IMEI/VehicleId"
                        />
                    </div>
                </Row>
                <Row type="flex" align="middle" justify="space-between" style={{ paddingTop: 10 }} >
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
                    {this.state.paginate ?
                        <ESPagination
                            limit={this.state.filter.limit}
                            total={this.state.total}
                            fetch={this.fetch.bind(this)}
                            page={this.state.filter.page}
                        />
                        : null}
                </Row>
                <div className="RidersList" style={{ padding: '20px 0px', height: '350px', overflow: 'hidden' }}>
                    <CustomScrollbars className="gx-module-content-scroll" >
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
                                                                    Scooter Id
                                                </div>
                                                            </div>}</span>
                                                </div>
                                            </div>
                                            <div className="ant-list-item-meta-content">
                                                <div className="ant-list-item-meta">
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        <b>{item.name} </b>{' '}
                                                        <Battery />Power &nbsp;
                                        <b>{`${item.batteryLevel}%`}</b>
                                                    </div>
                                                    <div className="ant-list-item-meta-description">
                                                        <div className="connectionStatus">
                                                            <div className="lbl">
                                                                {item.connectionStatus ?
                                                                    <Tag color="green">Connected</Tag>
                                                                    : <Tag color="red">Not Connected</Tag>
                                                                }
                                                                {item.isActive ?
                                                                    <Tag color="green">Active</Tag>
                                                                    : <Tag color="red">Deactive</Tag>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="ant-list-item-meta-content">
                                                    <div className="gx-flex-row d-block-xs">
                                                        <div className="signupDate" style={{ marginTop: '0px' }}>
                                                            Last Connected:{' '}
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
                                                            IMEI:{' '}
                                                            <b>{item.imei} </b>
                                                        </div>
                                                        <div className="signupDate">
                                                            Number Plate:{' '}
                                                            <b>{item.numberPlate} </b>
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </CustomScrollbars>
                </div>
            </Modal>
        );
    }
}


export default addVehicle;