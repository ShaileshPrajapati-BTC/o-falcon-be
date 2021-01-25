/* eslint-disable max-lines-per-function */
import { Affix, Button, Icon, Row } from 'antd';
import {
    DEFAULT_VEHICLE,
    FILTER_BY_ACTIVE,
    FILTER_BY_BATTERY,
    FILTER_BY_CONNECTION_TYPE,
    FILTER_BY_LOCK_STATUS,
    FILTER_BY_VEHICLE_TYPE,
    PAGE_PERMISSION,
    SORT_BY_ARRAY,
    RIDE_STATUS,
    VEHICLE_STATUS,
    VEHICLE_STATUS_ARRAY,
    FRANCHISEE_LABEL,
    FILTER_VISIBLE,
    DEALER_LABEL,
    NEST_LABEL,
    ADD_VEHICLE_INTO_NEST,
    USER_TYPES,
    FRANCHISEE_VISIBLE,
    CLIENT_VISIBLE,
    NEST_TYPE
} from '../../constants/Common';
import React, { Component } from 'react';
// import { getFranchisee } from "../../appRedux/actions/franchisee";

import ESPagination from '../../components/ESPagination';
import AddButton from '../../components/ESAddButton';
import VehicleList from '../../components/ESVehicleList';
import FilterDropdown from '../../components/FilterDropdown';

import UtilService from '../../services/util';
import Search from '../../components/ESSearch';
import axios from 'util/Api';
import { connect } from 'react-redux';
import ImportExport from './Import';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class Vehicles extends Component {
    constructor(props) {
        super(props);
        let filter = {
            imei: { '!=': '' }
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            data: [],
            total: 0,
            loading: false,
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            filter: {
                page: 1,
                limit: 20,
                filter: filter
            },
            paginate: false,
            franchiseeList: [],
            showModal: false,
            nestList: []
            // battery: 46,
        };

        if (DEFAULT_VEHICLE) {
            this.state.filter.filter.type = [DEFAULT_VEHICLE];
        }
        let routeProps = this.props.location.filter;
        this.isActive = routeProps && routeProps.filter && routeProps.filter.isActive ?
            _.find(
                FILTER_BY_ACTIVE,
                (f) => { return f.type === routeProps.filter.isActive }
            ).value :
            1;
        this.batteryLevel = routeProps && routeProps.filter && routeProps.filter.batteryLevel ?
            _.find(
                FILTER_BY_BATTERY,
                (f) => { return f.type === routeProps.filter.batteryLevel }
            ).value :
            1;
        this.type = routeProps && routeProps.filter && routeProps.filter.type ?
            _.find(
                FILTER_BY_VEHICLE_TYPE,
                f => _.isEqual(f.type, routeProps.filter.type)
            ).value
            : DEFAULT_VEHICLE;
        this.connectionStatus = routeProps && routeProps.filter && routeProps.filter.connectionStatus ?
            _.find(
                FILTER_BY_CONNECTION_TYPE,
                (f) => { return f.type === routeProps.filter.connectionStatus }
            ).value :
            1;
        this.lockStatus = routeProps && routeProps.filter && routeProps.filter.lockStatus ?
            _.find(
                FILTER_BY_LOCK_STATUS,
                (f) => { return f.type === routeProps.filter.lockStatus }
            ).value :
            1;
        this.sort = routeProps && routeProps.sort ?
            _.find(SORT_BY_ARRAY, (f) => { return f.type === routeProps.sort.split(" ")[0] }).value :
            1;
        this.isDesc = routeProps && routeProps.sort ? (routeProps.sort.split(" ")[1] === 'ASC' ? false : true) : true;
        this.franchiseeId = routeProps && routeProps.filter.franchiseeId
            ? _.find(
                this.props.franchisee.franchisee,
                (f) => { return f.type === routeProps.filter.franchiseeId }
            ).value
            : 0;
        this.dealerId = routeProps && routeProps.filter.dealerId
            ? _.find(this.props.dealer.dealersList, (f) => { return f.type === routeProps.filter.dealerId }).value
            : 0;
        this.nestId = 0;
    }

    componentDidMount = async () => {
        const { authUser } = this.props.auth;
        // this.props.getFranchisee(); // called from App/index.js

        // if (authUser.type !== USER_TYPES.SUPER_ADMIN && authUser.type !== USER_TYPES.FRANCHISEE) {
        //     this.setState((state) => {
        //         state.filter.filter.userId = authUser.id;
        //     });
        // }

        let self = this;
        let filter = this.props.location.filter;
        if (filter) {
            if (ADD_VEHICLE_INTO_NEST) {
                this.nestId = filter && filter.filter && filter.filter.nestId
                    ? _.find(this.state.nestList, (f) => { return f.type === filter.filter.nestId }).value
                    : 0;
            }
            this.setState({ filter: filter, paginate: false }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
        if (ADD_VEHICLE_INTO_NEST) {
            this.getNestList();
        }
    }

    /* listing start */
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
    getNestList = async () => {
        this.setState({ loading: true });
        let filter = {
            project: ['name'],
            filter: {
                type: [
                    NEST_TYPE.NEST_RIDER,
                    NEST_TYPE.NEST_REPAIR,
                    NEST_TYPE.NEST_DOCKING_STATION
                ]
            }
        };
        try {
            let response = await axios.post('admin/nest/paginate', filter);
            if (response && response.code === 'OK') {
                let nestFilter = [{ label: 'All', value: 0 }];
                _.each(response.data.list, (value, index) => {
                    nestFilter.push({ label: value.name, value: index + 1, type: value.id });
                });
                this.setState({ nestList: nestFilter, loading: false });
            } else {
                this.setState({ nestList: [], loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    onSearch = (newState) => {
        this.setState(
            {
                filter: newState,
                paginate: false
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
                if (key === 'sort') {
                    state.filter[key] = data;
                } else {
                    state.filter.filter[key] = data.type;
                }
            } else if (key === "sort") {
                delete state.filter[key];
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

    getStatusColor = (detail) => {
        // find status wise color for tag
        let color = '';
        if (detail) {
            if (detail.status === RIDE_STATUS.ON_GOING) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, {
                    value: VEHICLE_STATUS.RUNNING
                });
                if (
                    displayRecord &&
                    displayRecord.displayColor &&
                    !detail.currentRiderDetail.isPaused
                ) {
                    color = displayRecord.displayColor;
                }
            }
            if (
                detail.status === RIDE_STATUS.COMPLETED ||
                detail.status === RIDE_STATUS.CANCELLED
            ) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, {
                    value: VEHICLE_STATUS.STANDING
                });
                if (displayRecord && displayRecord.displayColor) {
                    color = displayRecord.displayColor;
                }
            }
        }

        return color;
    };
    getStatusLabel = (detail) => {
        let label = '';
        if (detail) {
            if (detail.status === RIDE_STATUS.ON_GOING) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, {
                    value: VEHICLE_STATUS.RUNNING
                });
                if (
                    displayRecord &&
                    displayRecord.label &&
                    !detail.currentRiderDetail.isPaused
                ) {
                    label = displayRecord.label;
                }
            }
            if (
                detail.status === RIDE_STATUS.COMPLETED ||
                detail.status === RIDE_STATUS.CANCELLED
            ) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, {
                    value: VEHICLE_STATUS.STANDING
                });
                if (displayRecord && displayRecord.label) {
                    label = displayRecord.label;
                }
            }
        }

        return label;
    };

    getLatestStatus = async (statusType) => {
        this.setState({ loading: true });
        try {
            let response = await axios.get(`admin/vehicle/get-${statusType}-status`);
            if (response && response.code === 'OK') {
                this.fetch();
            }
            this.setState({ loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };
    vehicleDetails = (id, permission) => {
        if (permission) {
            this.props.history.push({
                pathname: `/e-scooter/vehicle-details/${id}`,
                filter: this.state.filter
            });
        }
    };
    onSelect = (id) => {
        this.setState((state) => {
            if (id) {
                state.filter.filter.franchiseeId = id;
            } else {
                delete state.filter.filter.franchiseeId;
            }
        }, () => {
            this.fetch();
        })
    }


    openModal = () => {
        this.setState(state => {
            state.showModal = !state.showModal
            return state
        })
    }
    render() {

        const { data, loading, loginUser } = this.state;
        let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;
        // view vehicle detail permission
        const authpermission = this.props.auth.authUser.accessPermission;
        const vehiclePageId = PAGE_PERMISSION.VEHICLES;
        const getIndex = (el) => { return el.module === vehiclePageId };
        const index = authpermission.findIndex(getIndex);
        const vehicleViewPermission =
            index && authpermission[index] && authpermission[index].permissions ?
                authpermission[index].permissions.view :
                false;
        // let length = this.props.franchisee.length;
        let FilterArray = [
            {
                title: <IntlMessages id="app.battery" />,
                list: FILTER_BY_BATTERY,
                defaultSelected: this.batteryLevel,
                key: 'batteryLevel',
                visible: true
            },
            {
                title: <IntlMessages id="app.sortBy" />,
                list: SORT_BY_ARRAY,
                defaultSelected: this.sort,
                sorter: true,
                isDesc: this.isDesc,
                key: 'sort',
                visible: true
            },
            {
                title: <IntlMessages id="app.type" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.type,
                key: 'type',
                visible: FILTER_VISIBLE
            },
            {
                title: <IntlMessages id="app.vehicle.connectionType" />,
                list: FILTER_BY_CONNECTION_TYPE,
                defaultSelected: this.connectionStatus,
                key: 'connectionStatus',
                visible: true
            },
            {
                title: <IntlMessages id="app.status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: 'isActive',
                visible: true
            },
            {
                title: <IntlMessages id="app.vehicle.lockStatus" />,
                list: FILTER_BY_LOCK_STATUS,
                defaultSelected: this.lockStatus,
                key: 'lockStatus',
                visible: true
            },
            {
                title: FRANCHISEE_LABEL,
                list: this.props.franchisee.franchisee,
                defaultSelected: this.franchiseeId,
                key: 'franchiseeId',
                visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && !isDealer && FRANCHISEE_VISIBLE
            },
            {
                title: DEALER_LABEL,
                list: this.props.dealer.dealersList,
                defaultSelected: this.dealerId,
                key: 'dealerId',
                visible: this.props.dealer.dealersList.length > 2 && isFranchisee && CLIENT_VISIBLE
            },
            {
                title: NEST_LABEL,
                list: this.state.nestList,
                defaultSelected: this.nestId,
                key: 'nestId',
                visible: this.state.nestList.length > 1 && ADD_VEHICLE_INTO_NEST
            }
        ];

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.vehicles" /></h1>
                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={['name', 'qrNumber', 'iccid']}
                                    placeholder="Search by Name / QrCode / ICCID"
                                />
                                <div className="topbarCommonBtn">
                                    <Button type="primary" title="Get Latest Location"
                                        onClick={this.getLatestStatus.bind(this, 'location')}>
                                        <Icon type="environment" />
                                    </Button>
                                </div>
                                <div className="topbarCommonBtn">
                                    <Button type="primary" title="Get Latest Connection Status"
                                        onClick={this.getLatestStatus.bind(this, 'connection')}>
                                        <Icon type="reload" />
                                    </Button>
                                </div>
                                <AddButton
                                    // link="/e-scooter/vehicle/upsert"
                                    text={<IntlMessages id="app.vehicle.importVehicle" />}
                                    pageId={PAGE_PERMISSION.VEHICLES}
                                    // filter={this.state.filter}
                                    onClick={this.openModal}
                                />
                                <AddButton
                                    link="/e-scooter/vehicle/upsert"
                                    text={<IntlMessages id="app.vehicle.addVehicle" />}
                                    pageId={PAGE_PERMISSION.VEHICLES}
                                    filter={this.state.filter}
                                />
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
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
                                        key={filter.key}
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
                        <Row type="flex" align="middle" justify="space-between">
                            <div className="DropdownWidth">
                            </div>
                            {this.state.paginate ?
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                    page={this.state.filter.page}
                                /> :
                                null}
                        </Row>
                    </div>
                </Affix>
                <div className="RidersList">
                    <VehicleList
                        data={data}
                        loading={loading}
                        vehicleViewPermission={vehicleViewPermission}
                        fetch={this.fetch}
                        vehicleDetails={this.vehicleDetails}
                        filter={this.state.filter}
                        total={this.state.total}
                    />
                </div>

                {this.state.showModal && <ImportExport showModal={this.openModal} />}
            </div>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(Vehicles);
