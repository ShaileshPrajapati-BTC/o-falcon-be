// We are not using this file anywhere. Deleted it but some merge has generated it again then no change.



/* eslint-disable max-lines-per-function */
import {
    Button, Divider, Icon, Input, List, Row, Tag
} from 'antd';
import {
    DEFAULT_DISTANCE_UNIT,
    FILTER_BY_ACTIVE,
    RIDE_STATUS,
    STATUS_TYPES,
    USER_TYPES,
    VEHICLE_CONNECTION_TYPES,
    VEHICLE_LOCK_STATUS_TYPES,
    VEHICLE_STATUS,
    VEHICLE_STATUS_ARRAY,
    VEHICLE_TYPES,
    FILTER_BY_VEHICLE_TYPE,
    DEFAULT_VEHICLE
} from '../../constants/Common';
import React, { Component } from 'react';
import ActionButtons from '../../components/ActionButtons';
import ActiveDeactive from '../../components/custom/ActiveDeactive';
import { ReactComponent as AddButton } from '../../assets/svg/addButton.svg';
import { ReactComponent as Battery } from '../../assets/svg/battery.svg';
import { ReactComponent as BicycleRider } from '../../assets/svg/bicycle-rider.svg';
import ESPagination from '../../components/ESPagination';
import ESQrCode from '../../components/ESQrCode';
import FilterDropdown from '../../components/FilterDropdown';
import { ReactComponent as Kms } from '../../assets/svg/kms.svg';
import { Link } from 'react-router-dom';
import { ReactComponent as Location } from '../../assets/svg/location.svg';
import { ReactComponent as Speed } from '../../assets/svg/speed.svg';
import { ReactComponent as User } from '../../assets/svg/user.svg';
// import { ReactComponent as Lock } from '../Vehicle/lock.svg';
// import { ReactComponent as UnLock } from '../Vehicle/unlock.svg';
import { ReactComponent as Connected } from '../Vehicle/connected.svg';
import { ReactComponent as NotConnected } from '../Vehicle/not-connected.svg';
import UtilService from '../../services/util';
import axios from 'util/Api';
import { connect } from 'react-redux';

const { Search } = Input;
const _ = require('lodash');

class Vehicles extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            total: 0,
            loading: false,
            filter: {
                page: 1,
                limit: 10,
                filter: {
                    type: DEFAULT_VEHICLE,
                    imei: { '!=': '' }
                }
            },
            paginate: false,
            showQrView: false
        };
        this.defaultScooterStatus = 1;

        this.filterByBattery = [
            { label: 'All', value: 1 },
            { label: 'Upto 25%', value: 2, request: { '>=': 0, '<=': 25 } },
            { label: '26% to 50%', value: 3, request: { '>=': 26, '<=': 50 } },
            { label: '51% to 75%', value: 4, request: { '>=': 51, '<=': 75 } },
            { label: '76% to 100%', value: 5, request: { '>=': 76, '<=': 100 } }
        ];
        this.defaultFilterBy = 1;
        this.filterByVehicleType = [
            { label: 'All', value: 0 },
            { label: 'Scooter', value: 1, type: VEHICLE_TYPES.SCOOTER },
            { label: 'Bicycle', value: 2, type: VEHICLE_TYPES.BICYCLE }
        ];
        this.defaultVehicleType = DEFAULT_VEHICLE;
        this.filterByConnectionType = [
            { label: 'All', value: 1 },
            { label: 'Connected', value: 2, connectionStatus: VEHICLE_CONNECTION_TYPES.CONNECTED },
            { label: 'Not Connected', value: 3, connectionStatus: VEHICLE_CONNECTION_TYPES.NOT_CONNECTED }
        ];
        this.defaultConnectionType = 1;
        this.filterByLockStatus = [
            { label: 'All', value: 1 },
            { label: 'Locked', value: 2, lockStatus: VEHICLE_LOCK_STATUS_TYPES.LOCKED },
            { label: 'Unlocked', value: 3, lockStatus: VEHICLE_LOCK_STATUS_TYPES.UNLOCKED }
        ];
        this.defaultLockStatus = 1;
        this.sortByArray = [
            { label: 'None', value: 1 },
            { label: 'Name', key: 'name', value: 2 },
            { label: 'Last Connected', key: 'lastConnectedDateTime', value: 3 },
            { label: 'Battery', key: 'batteryLevel', value: 4 },
            { label: 'Vehicle Id', key: 'registerId', value: 5 }
        ];
        this.defaultSortBy = 1;
    }

    componentDidMount() {
        const { authUser } = this.props.auth;
        if (authUser.type !== USER_TYPES.SUPER_ADMIN) {
            this.setState((state) => {
                state.filter.filter.userId = authUser.id;
            });
        }
        let self = this;
        let filter = localStorage.getItem('pageFilter');
        if (filter) {
            this.setState({ filter: JSON.parse(filter), paginate: false },
                () => {
                    self.fetch();
                });
        } else {
            this.fetch();
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
        localStorage.removeItem('pageFilter');
        try {
            let response = await axios.post('admin/vehicle/paginate', this.state.filter);
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
    }
    onSearch = (search) => {
        this.setState({
            filter: Object.assign(this.state.filter, {
                page: 1,
                search: {
                    keyword: search,
                    keys: ['name', 'qrNumber']
                }
            })
        });
        this.setState({ paginate: false });
        this.fetch();
    };
    handleSelection = (selectedVal, isAscending, key) => {
        if (key === 'battery') {
            let data = _.find(this.filterByBattery, { value: selectedVal });
            this.defaultFilterBy = selectedVal;
            if (data && data.request) {
                this.setState((state) => {
                    state.filter.filter.batteryLevel = data.request;
                });
            } else {
                this.setState((state) => {
                    delete state.filter.filter.batteryLevel;
                });
            }
        } else if (key === 'vehicleType') {
            let data = _.find(this.filterByVehicleType, { value: selectedVal });
            this.defaultVehicleType = selectedVal;
            if (data && data.type) {
                this.setState((state) => {
                    state.filter.filter.type = data.type;
                });
            } else {
                this.setState((state) => {
                    delete state.filter.filter.type;
                });
            }
        } else if (key === 'connectionType') {
            let data = _.find(this.filterByConnectionType, { value: selectedVal });
            this.defaultConnectionType = selectedVal;
            if (data && typeof data.connectionStatus === 'boolean') {
                this.setState((state) => {
                    state.filter.filter.connectionStatus = data.connectionStatus;
                });
            } else {
                this.setState((state) => {
                    delete state.filter.filter.connectionStatus;
                });
            }
        } else if (key === 'scooterStatus') {
            let data = _.find(FILTER_BY_ACTIVE, { value: selectedVal });
            this.defaultScooterStatus = selectedVal;
            if (data && typeof data.isActive === 'boolean') {
                this.setState((state) => {
                    state.filter.filter.isActive = data.isActive;
                });
            } else {
                this.setState((state) => {
                    delete state.filter.filter.isActive;
                });
            }
        } else if (key === 'lockStatus') {
            let data = _.find(this.filterByLockStatus, { value: selectedVal });
            this.defaultLockStatus = selectedVal;

            if (data && typeof data.lockStatus === 'boolean') {
                this.setState((state) => {
                    state.filter.filter.lockStatus = data.lockStatus;
                });
            } else {
                this.setState((state) => {
                    delete state.filter.filter.lockStatus;
                });
            }
        } else if (key === 'sorting') {
            this.defaultSortBy = selectedVal;
            let valPath = _.find(this.sortByArray, { value: selectedVal });
            if (valPath && valPath.key) {
                let sortBy = `${valPath.key} DESC`;
                if (isAscending) {
                    sortBy = `${valPath.key} ASC`;
                }
                this.setState((state) => {
                    state.filter.sort = sortBy;
                });
            } else {
                this.setState((state) => {
                    delete state.filter.sort;
                });
            }
        }
        this.setState((state) => {
            state.filter.page = 1;
            state.paginate = false;
        });
        this.fetch();
    }
    getStatusColor = (detail) => {
        // find status wise color for tag
        let color = '';
        if (detail) {
            if (detail.status === RIDE_STATUS.ON_GOING) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, { value: VEHICLE_STATUS.RUNNING });
                if (displayRecord && displayRecord.displayColor && !detail.currentRiderDetail.isPaused) {
                    color = displayRecord.displayColor;
                }
            }
            if (detail.status === RIDE_STATUS.COMPLETED || detail.status === RIDE_STATUS.CANCELLED) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, { value: VEHICLE_STATUS.STANDING });
                if (displayRecord && displayRecord.displayColor) {
                    color = displayRecord.displayColor;
                }
            }
        }

        return color;
    }
    getStatusLabel = (detail) => {
        let label = '';
        if (detail) {
            if (detail.status === RIDE_STATUS.ON_GOING) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, { value: VEHICLE_STATUS.RUNNING });
                if (displayRecord && displayRecord.label && !detail.currentRiderDetail.isPaused) {
                    label = displayRecord.label;
                }
            }
            if (detail.status === RIDE_STATUS.COMPLETED || detail.status === RIDE_STATUS.CANCELLED) {
                let displayRecord = _.find(VEHICLE_STATUS_ARRAY, { value: VEHICLE_STATUS.STANDING });
                if (displayRecord && displayRecord.label) {
                    label = displayRecord.label;
                }
            }
        }

        return label;
    }
    vehicleDetails = (id) => {
        this.props.history.push(`/e-scooter/vehicle-details/${id}`);
    }
    viewQrCode = (qrNumber) => {
        this.setState({ showQrView: true, qrNumber: qrNumber });
    }
    handleViewCancel = () => {
        this.setState({ showQrView: false, qrNumber: null });
    }
    getLatestConnectionStatus = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.get('admin/vehicle/get-connection-status');
            if (response && response.code === 'OK') {
                this.fetch();
            }
            this.setState({ loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    render() {
        const { showQrView, qrNumber, data, loading } = this.state;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading">Vehicles</h1>
                        <div className="SearchBarwithBtn">
                            <Search placeholder="Search by Name / QrCode"
                                onSearch={this.onSearch}
                                style={{ width: 300 }} />
                            <div className="topbarCommonBtn">
                                <Button type="primary" title="Get Latest Connection Status"
                                    onClick={this.getLatestConnectionStatus}>
                                    <Icon type="reload" />
                                </Button>
                            </div>
                            <div className="topbarCommonBtn">
                                <Link
                                    to={`/e-scooter/vehicle/upsert`}
                                >
                                    <Button type="primary" >
                                        <span>
                                            <AddButton />
                                        </span>
                                        <span>Add Vehicle</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Row>
                    <Row type="flex" align="middle"
                        justify="space-between"
                        style={{ marginTop: 20 }}>
                        <div className="DropdownWidth vehicleDropdownWidth">
                            <FilterDropdown
                                title1="Battery"
                                list={this.filterByBattery}
                                defaultSelected={this.defaultFilterBy}
                                handleSelection={(val, isAscending) => {
                                    return this.handleSelection(val, isAscending, 'battery');
                                }}
                            />
                            <FilterDropdown
                                title1="Sort by"
                                list={this.sortByArray}
                                sorter={true}
                                isDesc={true}
                                defaultSelected={this.defaultSortBy}
                                handleSelection={(val, isAscending) => {
                                    return this.handleSelection(val, isAscending, 'sorting');
                                }}
                            />
                            <FilterDropdown
                                title1="Type"
                                list={this.filterByVehicleType}
                                defaultSelected={this.defaultVehicleType}
                                handleSelection={(val, isAscending) => {
                                    return this.handleSelection(val, isAscending, 'vehicleType');
                                }}
                            />
                            <FilterDropdown
                                title1="Connection Type"
                                list={this.filterByConnectionType}
                                defaultSelected={this.defaultConnectionType}
                                handleSelection={(val, isAscending) => {
                                    return this.handleSelection(val, isAscending, 'connectionType');
                                }}
                            />
                            <FilterDropdown
                                title1="Status"
                                list={FILTER_BY_ACTIVE}
                                defaultSelected={this.defaultScooterStatus}
                                handleSelection={(val, isAscending) => {
                                    return this.handleSelection(val, isAscending, 'scooterStatus');
                                }}
                            />
                            <FilterDropdown
                                title1="Lock Status"
                                list={this.filterByLockStatus}
                                defaultSelected={this.defaultLockStatus}
                                handleSelection={(val, isAscending) => {
                                    return this.handleSelection(val, isAscending, 'lockStatus');
                                }}
                            />
                        </div>
                        {this.state.paginate ?
                            <ESPagination
                                limit={this.state.filter.limit}
                                total={this.state.total}
                                fetch={this.fetch.bind(this)}
                            /> :
                            null}
                    </Row>
                </div>
                <div className="RidersList" >
                    <List
                        itemLayout="horizontal"
                        dataSource={data}
                        loading={loading}
                        renderItem={(item) => {
                            return <List.Item>
                                <div className="ant-list-item-meta">
                                    <div className="ant-list-item-meta-avatar gx-pointer"
                                        onClick={() => {
                                            return this.vehicleDetails(item.id);
                                        }}>
                                        <div className="totalRideCounter">
                                            <div className="scooterIdRound">
                                                <h3>{item.registerId}</h3>
                                                <div className="lbl">Scooter Id</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ant-list-item-meta-content" >

                                        <div className="ant-list-item-meta">
                                            <div className="ant-list-item-meta-description m-r-20">
                                                <b>{item.name} </b> &nbsp;&nbsp; <Battery />Power  &nbsp;<b>{`${item.batteryLevel}%`}</b>
                                            </div>
                                            <div className="ant-list-item-meta-description">
                                                {!item.isRideCompleted ? <Tag color="green">Running</Tag> : null}
                                            </div>


                                            <div className="ant-list-item-meta-description">
                                                <div className="connectionStatus">
                                                    Last Connected: <b>{UtilService.displayDate(item.lastConnectedDateTime)}</b>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ant-list-item-meta-content">
                                            <div className="gx-flex-row d-block-xs">
                                                <div className="ant-list-item-meta-description m-r-20">
                                                    <Location />{item.currentLocation ? item.currentLocation.name : '-'}
                                                </div>
                                                <div className="ant-list-item-meta-description m-r-20">
                                                    {VEHICLE_TYPES.SCOOTER!=undefined && item.type === VEHICLE_TYPES.SCOOTER ?
                                                        <Speed /> :
                                                        <BicycleRider />}
                                                    Speed Limit  &nbsp;
                                                    <b>
                                                        {item.speed ? UtilService.displayNumber(item.speed) : '0'} {DEFAULT_DISTANCE_UNIT}/hour
                                                    </b>
                                                </div>
                                                <div className="ant-list-item-meta-description">
                                                    <Kms /> Total {DEFAULT_DISTANCE_UNIT}:   &nbsp;<b>{item.vehicleRideSummary ?
                                                        `${UtilService.displayNumber(item.vehicleRideSummargy.totalKm)} ${DEFAULT_DISTANCE_UNIT}` :
                                                        `0 ${DEFAULT_DISTANCE_UNIT}`}</b>
                                                </div>
                                                {/* <div className="ant-list-item-meta-description">
                                                    <div className="connectionStatus">
                                                        Last Checked: <b>{UtilService.displayDate(item.lastConnectionCheckDateTime)}</b>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cardRightThumb">
                                        <div className="cardRightContainer flex-align-center">
                                            <div className="ant-list-item-meta-description">
                                                <div className="connectionStatus">
                                                    <div className="lbl">
                                                        {item.connectionStatus ?
                                                            <div className="lock_icon_block connected_block lock_block">
                                                                <Connected />
                                                                <span>Connected</span>
                                                            </div>
                                                            :
                                                            <div className="lock_icon_block connected_block unlock_block">
                                                                <NotConnected />
                                                                <span>Not Connected</span>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {item.hasOwnProperty('lockStatus') && <div className="ant-list-item-meta-description">
                                                <div className="connectionStatus lbl">
                                                    {item.lockStatus ?
                                                        <div className="lock_icon_block lock_block">
                                                            <Lock />
                                                            <span>Locked</span>
                                                        </div> :
                                                        <div className="lock_icon_block unlock_block">
                                                            <UnLock />
                                                            <span>Unlocked</span>
                                                        </div>
                                                    }
                                                </div>
                                            </div>}

                                            <div className="totalRideCounter">
                                                <div>
                                                    <h2>
                                                        {item.vehicleRideSummary ?
                                                            item.vehicleRideSummary.totalRide :
                                                            '0'}
                                                    </h2>
                                                    <div className="lbl">
                                                        {item.vehicleRideSummary.totalRide > 1 ?
                                                            'Rides' :
                                                            'Ride'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="action-btnsWithSignupDate">
                                                <div className="ActionNotification">
                                                    <ActiveDeactive
                                                        onSuccess={this.fetch.bind(this)}
                                                        key={item.id}
                                                        documentId={item.id}
                                                        isActive={item.isActive}
                                                        model="vehicle"
                                                    />
                                                    <div className="scooterActionItem">
                                                        <ActionButtons
                                                            edit={`/e-scooter/vehicle/upsert/${item.id}`}
                                                            filter={this.state.filter}
                                                        />
                                                        <div className="scooterIC">
                                                            <Button type="primary" className="gx-no-padd" onClick={this.viewQrCode.bind(this, item.qrNumber)}>
                                                                <Icon type="qrcode" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {
                                        item.vehicleRideSummary.status === RIDE_STATUS.ON_GOING ?
                                            <>
                                                <Divider type="horizontal"></Divider>
                                                <div className="ant-list-item-meta">
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        <User />
                                                        {`${item.vehicleRideSummary.currentRiderDetail.userId.firstName} ${
                                                            item.vehicleRideSummary.currentRiderDetail.userId.lastName}`}
                                                    </div>
                                                    <div className="ant-list-item-meta-description m-r-20">
                                                        Total {DEFAULT_DISTANCE_UNIT} Ride: {item.vehicleRideSummary.currentRiderDetail.estimateKm} {DEFAULT_DISTANCE_UNIT}
                                                    </div>
                                                    {/* <div className="ant-list-item-meta-description">
                                                        From:    <RightArrow />       To :
                                                </div> */}
                                                </div>
                                            </> :
                                            null
                                    }
                                </div>
                            </List.Item>;
                        }
                        } />
                </div>
                {showQrView && <ESQrCode
                    qrNumber={qrNumber}
                    visible={showQrView}
                    onCancel={this.handleViewCancel.bind(this)}
                />}
            </div>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};
export default connect(mapStateToProps)(Vehicles);
