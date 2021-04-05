/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */

import {
    FRANCHISEE_LABEL, PAID_STATUS_ARRAY, DEFAULT_MAP_CENTER, FILTER_VISIBLE, RIDE_STATUS, RIDE_STATUS_ARRAY, DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE,
    RIDE_TYPE, RIDE_TYPE_FILTER, SUBSCRIPTION_VISIBLE, USER_TYPES, DEALER_LABEL, FRANCHISEE_VISIBLE, CLIENT_VISIBLE, DEFAULT_API_ERROR, SHAPE_TYPE, EXPORT_EXCEL
} from '../../constants/Common';
import { Col, DatePicker, Empty, Row, Spin, message, Icon } from 'antd';
import React, { Component } from 'react';
// import { getFranchisee } from "../../appRedux/actions/franchisee";
import ESPagination from '../../components/ESPagination';
import FilterDropdown from '../../components/FilterDropdown';
import ESRidesStatusCard from '../../components/ESRidesStatusCard';
import RidesMap from './ridesMap';
import UtilService from '../../services/util';
import axios from 'util/Api';
import moment from 'moment';
import Search from '../../components/ESSearch';
import { CSVLink } from "react-csv";
import { connect } from 'react-redux';
import IntlMessages from '../../util/IntlMessages';
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';
let exportRef = null;
const _ = require('lodash');
class Rides extends Component {
    constructor(props) {
        super(props);
        let filter = {
            createdAt: {
                ">=": UtilService.getStartOfTheDay(moment()
                    .subtract(1, "months")
                    .startOf("day")
                    .toISOString()),
                "<=": UtilService.getEndOfTheDay(moment().toISOString())
            },
            status: RIDE_STATUS.ON_GOING,
            vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
            rideType: RIDE_TYPE.DEFAULT
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        let loggedInUser = this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null;
        if (loggedInUser && loggedInUser.type !== USER_TYPES.FRANCHISEE && loggedInUser.type !== USER_TYPES.DEALER) {
            delete filter.franchiseeId;
            delete filter.dealerId;
        }

        this.state = {
            loading: false,
            data: [],
            total: 0,
            paginate: false,
            loginUser: loggedInUser,
            isDrawPath: false,
            isVisibleMarker: true,
            filter: {
                page: 1,
                limit: 20,
                filter: filter
            },
            vehicleData: null,
            vehicleType: null,
            locationTrack: [],
            coordinates: [],
            isShowRideMap: true,
            center: this.props.auth.mapCenter,
            openInfoWindowMarkerId: '',
            zoneCoordinates: [],
            date: [moment().subtract(1, 'months'), moment()],
            excelData: []
        };
        this.status = RIDE_STATUS.ON_GOING;
        let redirectFilter = this.props.location.filter;
        this.vehicleType = redirectFilter && redirectFilter.filter && redirectFilter.filter.vehicleType
            ? _.find(FILTER_BY_VEHICLE_TYPE, f => _.isEqual(f.type, redirectFilter.filter.vehicleType)).value
            : DEFAULT_VEHICLE;
        this.status = redirectFilter && redirectFilter.filter && redirectFilter.filter.status
            ? _.find(RIDE_STATUS_ARRAY, f => f.type === redirectFilter.filter.status).value
            : RIDE_STATUS.ON_GOING;
        this.isPaid = redirectFilter && redirectFilter.filter && redirectFilter.filter.isPaid
            ? UtilService.getDefaultValue(PAID_STATUS_ARRAY, redirectFilter.filter.isPaid)
            : 1;
        this.franchiseeId = 0;
        this.dealerId = 0;
        this.rideType = redirectFilter && redirectFilter.filter && redirectFilter.filter.rideType
            ? UtilService.getDefaultValue(RIDE_TYPE_FILTER, redirectFilter.filter.rideType)
            : RIDE_TYPE.DEFAULT;
    }

    componentDidMount() {
        // this.props.getFranchisee(); // called from App/index.js
        if (this.props.location.vehicleStatus) {
            let from = this.props.location.filter.startDate;
            let to = this.props.location.filter.endDate;
            let range = { '>=': from, '<=': to };
            let datevalue = [moment(from), moment(to, 'YYYY/MM/DD')];
            this.status = Number(this.props.location.vehicleStatus);
            this.vehicleType = this.props.location.filter.filter.vehicleType[0];
            this.dealerId = _.find(
                this.props.dealer.dealersList,
                (f) => { return f.type === this.props.location.filter.filter.dealerId }
            ).value;
            this.franchiseeId = _.find(
                this.props.franchisee.franchisee,
                (f) => { return f.type === this.props.location.filter.filter.franchiseeId }
            ).value;
            this.setState((state) => {
                state.filter.filter.status = Number(this.props.location.vehicleStatus);
                state.filter.filter.createdAt = range;
                state.filter.filter.vehicleType = this.props.location.filter.filter.vehicleType[0];
                state.filter.filter.dealerId = this.props.location.filter.filter.dealerId;
                state.filter.filter.franchiseeId = this.props.location.filter.filter.franchiseeId;
                state.date = datevalue;
            }, () => {
                this.fetch();
            });
        } else if (this.props.location.filter) {
            let filter = this.props.location.filter;
            let datevalue = [moment(filter.filter.createdAt['>=']), moment(filter.filter.createdAt['<='], 'YYYY/MM/DD')];
            this.setState({ filter: filter, paginate: false, date: datevalue }, () => {
                this.fetch();
            });
        } else {
            this.fetch();
        }
        this.getZones();
    }

    async fetch(page) {
        let updateObj = { loading: true };
        let isOnGoingRides = this.state.filter.filter.status === RIDE_STATUS.ON_GOING;
        if (isOnGoingRides) {
            updateObj.isShowRideMap = false;
        }
        this.setState(updateObj);
        if (page) {
            this.setState((state) => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post('admin/ride-booking/paginate', this.state.filter);
            let updateData = {
                total: response.data.count,
                loading: false,
                data: response.data.list,
                paginate: true
            };
            if (isOnGoingRides) {
                updateData.isShowRideMap = true;
            }
            await this.setState(updateData);
            console.log('Data****:', this.state.data);
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({
                total: 0,
                loading: false,
                data: [],
                paginate: true,
                coordinates: [],
                isShowRideMap: true
            });
        }

    }
    getZones = async () => {
        let filter = { isActive: true }
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        try {
            let response = await axios.post("/admin/zone/paginate", { filter: filter });
            if (response && response.code === "OK") {
                let zoneCoordinates = [];
                let nestCoordinates = [];
                if (response.data.zones && response.data.zones.length > 0) {
                    zoneCoordinates = this.getZoneListforMap(response.data.zones);
                }
                if (response.data.nestList && response.data.nestList.length > 0) {
                    nestCoordinates = this.getNestListforMap(response.data.nestList);
                }
                this.setState({
                    zoneCoordinates: zoneCoordinates,
                    nestCoordinates: nestCoordinates
                });
            } else {
                this.setState({ zoneCoordinates: [], nestCoordinates: [] });
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            console.log('errorMsg :>> ', errorMsg);
        }
    };
    getZoneListforMap = (zoneData) => {
        let zoneCoordinates = [];
        for (const zone of zoneData) {
            if (zone && zone.boundary && zone.boundary.coordinates && zone.boundary.coordinates.length > 0) {
                let dataObj = this.getShapeData(zone.boundary.shapeType, zone.boundary);
                zoneCoordinates.push({
                    id: zone.id,
                    isActive: zone.isActive,
                    shapeType: zone.boundary.shapeType,
                    ...dataObj
                });
            }
        }

        return zoneCoordinates;
    }
    getNestListforMap = (nestData) => {
        let nestCoordinates = [];
        for (const nest of nestData) {
            if (nest && nest.currentLocation && nest.currentLocation.coordinates && nest.currentLocation.coordinates.length > 0) {
                let dataObj = this.getShapeData(nest.currentLocation.shapeType, nest.currentLocation);
                nestCoordinates.push({
                    id: nest.id,
                    isActive: nest.isActive,
                    shapeType: nest.currentLocation.shapeType,
                    nestType: nest.type,
                    ...dataObj
                });
            }
        }

        return nestCoordinates;
    }
    getShapeData = (shapeType, data) => {
        let shapeData = { ...data };
        if (shapeType === SHAPE_TYPE.CIRCLE) {
            shapeData.lat = data.coordinates[1];
            shapeData.lng = data.coordinates[0];
            shapeData.radius = data.radius;
        } else {
            let coordinatesArr = [];
            let coordinates = _.first(data.coordinates);
            if (data.shapeType) {
                coordinates.splice(coordinates.length - 1, 1);
            }
            for (const latLng of coordinates) {
                let obj = {
                    lat: latLng[1],
                    lng: latLng[0]
                };
                coordinatesArr.push(obj);
            }
            shapeData.coordinates = coordinatesArr;
            if (shapeType === SHAPE_TYPE.RECTANGLE) {
                shapeData.bounds = data.bounds;
            }
        }
        shapeData.shapeType = shapeType;

        return shapeData;
    }
    onSearch = (newState) => {
        this.setState({
            filter: newState,
            paginate: false
        }, () => {
            this.fetch();
        });
    };

    getStatusColor = (status) => {
        // find status wise color for tag
        let color = '';
        if (status) {
            let displayRecord = _.find(RIDE_STATUS_ARRAY, { type: status });
            if (displayRecord && displayRecord.displayColor) {
                color = displayRecord.displayColor;
            }
        }

        return color;
    }

    getStatusLablel = (status) => {
        let label = '';
        if (status) {
            let displayRecord = _.find(RIDE_STATUS_ARRAY, { type: status });
            if (displayRecord && displayRecord.label) {
                label = displayRecord.label;
            }
        }

        return label;
    }

    toggleMarker = (ride) => {
        let id = ride.id;
        // to toggle Popup
        if (ride.showInfo || ride.id === this.state.openInfoWindowMarkerId) {
            id = '';
        }
        this.setState({ openInfoWindowMarkerId: id });
    }

    handleSelection = (selectedVal, key, listData) => {
        let self = this;

        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };

        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState((state) => {
            if (data !== 'error') {
                state.filter.filter[key] = data.type;
            }
            else {
                delete state.filter.filter[key];
            }
        });
        self.setState(
            (state) => {
                state.filter.page = 1;
                state.paginate = false;
                state.locationTrack = 0;
            },
            () => {
                return self.fetch();
            }
        );
    };
    handleClick = async (id) => {
        try {
            this.setState({ loading: true });
            let response = await axios.post(
                '/admin/ride-booking/charge-customer-for-ride',
                { rideId: id }
            );
            if (response && response.code === 'OK') {
                message.success(response.message || <IntlMessages id="app.rides.paymentSuccess" />);
                this.fetch();
            } else if (response) {
                message.error(response.message || <IntlMessages id="app.rides.paymentFailed" />);
            }
            this.setState({ loading: false });
        } catch (error) {
            console.log('error', error);
        }
    }
    dateChange = (date) => {
        let from = UtilService.getStartOfTheDay(moment(date[0]).startOf('day')
            .toISOString());
        let to = UtilService.getEndOfTheDay(date[1].toISOString());
        let value = [moment(date[0]), moment(date[1])]
        let range = { '>=': from, '<=': to };
        this.setState((state) => {
            state.filter.filter.createdAt = range;
            state.filter.page = 1;
            state.paginate = false;
            state.date = value;
        });
        this.fetch();
    }
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
    // eslint-disable-next-line max-lines-per-function
    changeLocationTrack = (updatedData) => {
        let rideIndex = this.state.data.findIndex((ride => ride.id === updatedData.rideId));
        console.log('rideIndex :>> ', rideIndex);
        let newRideData = this.state.data;
        newRideData[rideIndex] && newRideData[rideIndex].locationTrack && newRideData[rideIndex].locationTrack.push({
            coordinates: updatedData.vehicleData.currentLocation.coordinates
        });

        this.setState({ data: newRideData });
        if (newRideData[rideIndex]) {
            this.handleCompletedRideId(newRideData[rideIndex]);
        }
    }

    handleCompletedRideId = async (data) => {
        try {
            if (data.locationTrack && data.locationTrack.length > 1) {
                locationTrack = data.locationTrack.map((lc) => {
                    const lat = lc.coordinates[1]
                    const lng = lc.coordinates[0]
                    return { lat, lng }
                }) // format locationrack in proper way
                this.getRefreshMap(locationTrack, data.vehicleId, data.vehicleType);

                return true;
            }
            let body = {
                rideId: data.id
            };
            let response = await axios.post('/admin/ride-booking/get-ride-location-data', body);
            // console.log('response', response);
            let locationTrack = [];
            if (!response.data || !response.data.locationTrack || response.data.locationTrack.length === (0 || 1)) {
                // message.error('unable to draw path on map')
                locationTrack.push({
                    lat: data.startLocation.coordinates[1],
                    lng: data.startLocation.coordinates[0]
                });
                locationTrack.push({
                    lat: data.endLocation.coordinates[1],
                    lng: data.endLocation.coordinates[0]
                });
            } else {
                locationTrack = response.data.locationTrack.map((lc) => {
                    const lat = lc.coordinates[1]
                    const lng = lc.coordinates[0]
                    return { lat, lng }
                }) // format locationrack in proper way
            }
            this.getRefreshMap(locationTrack, data.vehicleId, data.vehicleType);
        } catch (error) {
            let locationTrack = [];
            if (data.startLocation && data.startLocation.coordinates &&
                data.endLocation && data.endLocation.coordinates
            ) {
                // message.error('unable to draw path on map')
                locationTrack.push({
                    lat: data.startLocation.coordinates[1],
                    lng: data.startLocation.coordinates[0]
                });
                locationTrack.push({
                    lat: data.endLocation.coordinates[1],
                    lng: data.endLocation.coordinates[0]
                });
                this.getRefreshMap(locationTrack, data.vehicleId, data.vehicleType);
                message.error(`${error.message}, showing start and end location`);
            } else {
                message.error(error.message);
            }
        }
    }
    getRefreshMap = async (locationTrack, vehicleData, vehicleType) => {
        await this.setState({
            locationTrack,
            vehicleData,
            vehicleType,
            isShowRideMap: false,
            isDrawPath: true,
            isVisibleMarker: false
        })
        await this.setState({ isShowRideMap: true })
    }
    exportExcel = () => {
        this.setState({ loading: true })
        axios
            .post('admin/ride-booking/export-rides', this.state.filter)
            .then(async (data) => {
                this.setState({ loading: false })
                if (data && data.data && data.data.list && data.data.list.length === 0) {
                    message.error('No records found!');
                    return;
                }
                if (data.code === 'OK' && data && data.data) {
                    await this.setState({
                        excelData: data.data.list
                    });
                    exportRef.link.click();
                } else {
                    message.error(data.message)
                }
            })
            .catch((error) => {
                message.error(error.message)
                this.setState({ loading: false })
                console.log('ERROR   ', error);
            });
    }
    render() {
        let { data, loading, loginUser } = this.state;
        let isFranchisee = loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        // let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;
        let FilterArray = [
            {
                title: <IntlMessages id="app.payment.rideType" />,
                list: RIDE_TYPE_FILTER,
                defaultSelected: this.rideType,
                key: "rideType",
                visible: RIDE_TYPE_FILTER.length > 2
            },
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleType,
                key: "vehicleType",
                visible: FILTER_VISIBLE
            },
            {
                title: <IntlMessages id="app.browse" />,
                list: RIDE_STATUS_ARRAY,
                defaultSelected: this.status,
                key: "status",
                visible: true
            },
            {
                title: <IntlMessages id="app.status" />,
                list: PAID_STATUS_ARRAY,
                defaultSelected: this.isPaid,
                key: "isPaid",
                visible:
                    this.status === RIDE_STATUS_ARRAY[2].value ||
                    this.status === RIDE_STATUS_ARRAY[3].value
            },
            // {
            //     title: FRANCHISEE_LABEL,
            //     list: this.props.franchisee.franchisee,
            //     defaultSelected: this.franchiseeId,
            //     key: 'franchiseeId',
            //     visible: this.props.franchisee.franchisee.length > 2 && !isFranchisee && FRANCHISEE_VISIBLE
            // },
            {
                title: DEALER_LABEL,
                list: this.props.dealer.dealersList,
                defaultSelected: this.dealerId,
                key: 'dealerId',
                visible: this.props.dealer.dealersList.length > 2 && isFranchisee && CLIENT_VISIBLE
            }
        ];

        return (
            <div className="gx-module-box gx-mw-100">
                <Row gutter={8}>
                    <Col span={12}>
                        <div className="gx-module-box-header" style={{ paddingBottom: 0 }}>
                            <Row type="flex" align="middle" justify="space-between">
                                <h1 className="pageHeading"><IntlMessages id="app.rides" /></h1>

                                <div className="gx-mt-2" style={{ display: 'flex' }}>
                                    {EXPORT_EXCEL && loginUser.type === USER_TYPES.SUPER_ADMIN &&
                                        <span
                                            className="ant-radio-button-wrapper"
                                            style={{ marginRight: 10, borderRadius: 5 }}
                                            onClick={this.exportExcel}>
                                            <Icon type="download" />
                                        </span>}
                                    <CSVLink
                                        data={this.state.excelData}
                                        filename={'RidesData.csv'}
                                        className="hidden"
                                        ref={(ref) => {
                                            exportRef = ref;
                                        }}
                                        target="_blank"
                                    />
                                    {this.state.paginate ?
                                        <ESPagination
                                            limit={this.state.filter.limit}
                                            total={this.state.total}
                                            fetch={this.fetch.bind(this)}
                                            page={this.state.filter.page}
                                        /> :
                                        null}
                                </div>
                            </Row>
                            <Row type="flex" align="middle" justify="space-between" style={{ marginTop: 20 }}>
                                <div className="DropdownWidth d-block-xs">
                                    {FilterArray.map((filter) => {
                                        return (
                                            filter.visible && <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                defaultSelected={
                                                    filter.defaultSelected
                                                }
                                                key={filter.key}
                                                handleSelection={(
                                                    val
                                                ) => {
                                                    this.handleSelection(
                                                        val,
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
                                <div className="SearchBarwithBtn riderSearchBar gx-mt-2">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={['rideNumber']}
                                        placeholder="Search Ride Number"
                                        width="100%"
                                    />
                                    <div className="graphFilterWithCalander gx-d-flex" style={{ marginLeft: '5%' }}>
                                        <div className="dateRanges">
                                            <RangePicker
                                                defaultValue={[moment().subtract(1, 'months'), moment()]}
                                                value={this.state.date}
                                                format={dateFormat}
                                                onChange={this.dateChange.bind(this)}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </Row>


                            <Spin spinning={loading} delay={100} >
                                {data && data.length ?
                                    <div className="gx-mt-3 ridesListingScroll"  >
                                        <ESRidesStatusCard
                                            pageName='rides'
                                            data={data}
                                            handleClick={this.handleClick}
                                            toggleMarker={this.toggleMarker}
                                            currentPage={window.location.pathname}
                                            filter={this.state.filter}
                                            status={this.status}
                                            fetch={this.fetch.bind(this)}
                                            completedRideId={this.handleCompletedRideId}
                                        />
                                    </div> :
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                }
                            </Spin>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="mapView">

                            {this.state.isShowRideMap &&
                                <RidesMap center={
                                    (this.state.locationTrack !== null && this.state.locationTrack.length > 0) ? this.state.locationTrack[0] : this.state.center}
                                    rides={this.state.data}
                                    isVisibleMarker={this.state.isVisibleMarker}
                                    openInfoWindowMarkerId={this.state.openInfoWindowMarkerId}
                                    toggleMarker={this.toggleMarker}
                                    vehicleData={this.state.vehicleData}
                                    vehicleType={this.state.vehicleType}
                                    locationTrack={
                                        (this.state.locationTrack !== null && this.state.locationTrack.length > 0) ? this.state.locationTrack : []}
                                    isOnGoingStatus={this.status}
                                    isDrawPath={this.state.isDrawPath}
                                    zoneCoordinates={this.state.zoneCoordinates}
                                    nestCoordinates={this.state.nestCoordinates}
                                // changeLocationTrack={this.changeLocationTrack}
                                />}

                            {/* <img alt="" src={require('assets/images/map.jpg')} /> */}
                        </div>
                    </Col>
                </Row >
            </div >

        );
    }
}
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Rides);
