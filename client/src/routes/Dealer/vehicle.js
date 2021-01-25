import React, { Component } from 'react';
import { ReactComponent as AddButton } from '../../assets/svg/addButton.svg';
import AssignVehicle from './assignVehicle';
import { Button, Row, Modal } from 'antd';
import { DEFAULT_VEHICLE, FILTER_BY_BATTERY, SORT_BY_ARRAY, FILTER_BY_VEHICLE_TYPE, FILTER_BY_CONNECTION_TYPE, FILTER_BY_ACTIVE, FILTER_BY_LOCK_STATUS, PAGE_PERMISSION } from '../../constants/Common';
import axios from 'util/Api';
import { getFranchisee } from "../../appRedux/actions/franchisee";
import VehicleList from '../../components/ESVehicleList';
import UtilService from '../../services/util';
import Search from '../../components/ESSearch';
import { connect } from 'react-redux';
import FilterDropdown from '../../components/FilterDropdown';
import ESPagination from '../../components/ESPagination';
import IntlMessages from '../../util/IntlMessages';


class Vehicle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            data: [],
            total: 0,
            loading: false,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    imei: { '!=': '' },
                    dealerId: this.props.dealerId
                }
            },
            paginate: false,
        }
        if (DEFAULT_VEHICLE) {
            this.state.filter.filter.type = [DEFAULT_VEHICLE];
        }
        this.isActive = 1;
        this.batteryLevel = 1;
        this.type = DEFAULT_VEHICLE;
        this.connectionStatus = 1;
        this.lockStatus = 1;
        this.sort = 1;
        this.isDesc = true;
    }
    componentDidMount() {
        // const { authUser } = this.props.auth;
        // this.props.getFranchisee();
        // if (authUser.type !== USER_TYPES.SUPER_ADMIN && authUser.type !== USER_TYPES.FRANCHISEE) {
        //     this.setState((state) => {
        //         state.filter.filter.userId = authUser.id;
        //     });
        // }
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
    vehicleDetails = (id, permission) => {
        if (permission) {
            this.props.history.push({
                pathname: `/e-scooter/vehicle-details/${id}`,
                filter: this.state.filter
            });
        }
    };
    handelclick = () => {
        this.setState({
            modalVisible: true,
        });
    }
    handleSubmit = () => {
        this.handleCancel();
        // this.fetch();
        this.props.onAssignOrRetain()
    };
    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };
    handelRetain = async (data) => {
        Modal.confirm({
            title: 'Are you sure you want to retain vehicle!',
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                let obj = {
                    // franchiseeId: this.props.id, 
                    dealerId: this.props.dealerId, vehicleIds: [data.id]
                }
                try {
                    let response = await axios.post(
                        '/admin/dealer/retain-vehicle',
                        obj
                    );
                    if (response && response.code === 'OK') {
                        // this.fetch();
                        this.props.onAssignOrRetain()
                    } else {
                        console.log('error');
                    }
                } catch (error) {
                    console.log('Error****:', error.message);
                    this.setState({ loading: false });
                }
            }
        });

    }
    render() {
        const { data, loading } = this.state;
        // view vehicle detail permission
        const authpermission = this.props.auth.authUser.accessPermission;
        const vehiclePageId = PAGE_PERMISSION.VEHICLES;
        const getIndex = (el) => { return el.module === vehiclePageId };
        const index = authpermission.findIndex(getIndex);
        const vehicleViewPermission =
            index && authpermission[index] && authpermission[index].permissions ?
                authpermission[index].permissions.view :
                false;
        let FilterArray = [
            {
                title: <IntlMessages id="app.battery" defaultMessage="Battery" />,
                list: FILTER_BY_BATTERY,
                defaultSelected: this.batteryLevel,
                key: 'batteryLevel',
                visible: true
            }, {
                title: <IntlMessages id="app.sortBy" defaultMessage="Sort by" />,
                list: SORT_BY_ARRAY,
                defaultSelected: this.sort,
                sorter: true,
                isDesc: this.isDesc,
                key: 'sort',
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
            }, {
                title: <IntlMessages id="app.status" defaultMessage="Status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: 'isActive',
                visible: true
            }, {
                title: <IntlMessages id="app.vehicle.lockStatus" defaultMessage="Lock Status" />,
                list: FILTER_BY_LOCK_STATUS,
                defaultSelected: this.lockStatus,
                key: 'lockStatus',
                visible: true
            }
        ];
        return (
            <>
                <Row style={{ float: 'right', marginRight: '1px' }}>
                    <div className="SearchBarwithBtn" >
                        <Search
                            handelSearch={this.onSearch}
                            filter={this.state.filter}
                            keys={['name', 'qrNumber']}
                            placeholder="Search by Name / QrCode"
                        />
                        <div className="topbarCommonBtn" >
                            <Button type="primary" onClick={this.handelclick}>
                                <span>
                                    <AddButton />
                                </span>
                                <span><IntlMessages id="app.partner.assignVehicle" defaultMessage="Assign Vehicle" /></span>
                            </Button>
                        </div>
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
                <div className="RidersList" style={{ padding: '10px 0px' }}>
                    <VehicleList
                        data={data}
                        loading={loading}
                        vehicleViewPermission={vehicleViewPermission}
                        fetch={this.fetch}
                        vehicleDetails={this.vehicleDetails}
                        filter={this.state.filter}
                        page="DetailPage"
                        retainVehicle={this.handelRetain}
                    />
                </div>
                {this.state.modalVisible && (
                    <AssignVehicle
                        dealerId={this.props.dealerId}
                        authUser={this.props.auth.authUser}
                        vehicleViewPermission={vehicleViewPermission}
                        handleSubmit={this.handleSubmit}
                        onCancel={this.handleCancel}
                    />
                )}
            </>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps, { getFranchisee })(Vehicle);
