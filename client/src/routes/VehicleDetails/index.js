/* eslint-disable max-lines-per-function */
import {
    DEFAULT_DISTANCE_UNIT,
    RIDE_STATUS_ARRAY,
    VEHICLE_TYPES,
    BASE_URL,
    SOCKET_PAGE,
    DEFAULT_MAP_CENTER,
    IOT_COMMANDS,
    USER_TYPES,
    SOCKET_CONNECTION,
    PAGE_PERMISSION
} from '../../constants/Common';
import {
    Breadcrumb,
    Card,
    Col,
    Row,
    Tag,
    message,
    Affix,
    Empty
} from 'antd';
import { Link } from 'react-router-dom';
import React, { Component } from 'react';
import { Button } from 'antd/lib/radio';
import ChartData from '../../components/ESAmChart/chartData';
import ESRidesStatusCard from '../../components/ESRidesStatusCard';
import CustomScrollbars from '../../util/CustomScrollbars';
import WrappedActionModal from './actionModal';
import axios from 'util/Api';
import UtilService from '../../services/util';
import { connect } from 'react-redux';
import { Circle, GoogleMap, withGoogleMap, Marker } from 'react-google-maps';
import IotButtons from './iotButtons';
import AssignRetainVehicleTrack from './AssignRetainVehicleTrack';
import VehicleCommandTrack from './VehicleCommandTrack';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

const GeoLocationGoogleMapDetails = withGoogleMap((props) => {
    return (
        <GoogleMap
            defaultZoom={15}
            center={props.mapCenter}
        >
            {/* <Circle
                center={props.center}
                radius={props.radius}
                options={{
                    fillColor: 'var(--es--chart--bullet)',
                    fillOpacity: 0.3,
                    strokeColor: '#888',
                    strokeOpacity: 0.5,
                    strokeWeight: 50
                }}
            /> */}
            <Marker
                icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                position={props.center}
            />
        </GoogleMap>
    );
});

class VehicleDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 'overview',
            data: [],
            vehicleRecord: [],
            lastRide: [],
            loading: false,
            gmap: false,
            id: _.last(_.split(window.location.pathname, '/')),
            setSpeedModal: false,
            showModal: false,
            command: '',
            key: '',
            assignRetainVehicleLog: [],
            assignRetainVehicleLoading: false,
            IOTLogTrack: [],
            IOTLogTrackCount: 0,
        };
    }

    componentDidMount() {
        this.fetch();
        this.assignRetainVehicleLog();
        let nId = this.props.history.location && this.props.history.location.search && this.props.history.location.search.split('=')[1]
        if (nId) {
            this.readNotification(nId);
        }
        if (!SOCKET_CONNECTION) {
            return;
        }
        this.props.socket.emit('adminPageChange', { page: SOCKET_PAGE.VEHICLE_DETAILS, vehicleId: this.state.id });
        this.props.socket.on('vehicleUpdate', ({ data }) => {
            console.log('vehicle', data.vehicleData);
            this.setState({ data: data.vehicleData })
        });
    }
    componentWillUnmount() {
        if (!SOCKET_CONNECTION) {
            return;
        }
        this.props.socket.emit('adminPageChange', { page: '', vehicleId: '' });
    }

    /* listing start */
    fetch = async () => {
        let random = Math.random() * 10;
        const { id } = this.state;
        this.setState({ loading: true });
        try {
            let response = await axios.get(`admin/vehicle/detail/${id}?a=${random}`);
            if (response && response.code === 'OK') {
                this.setState({
                    data: response.data,
                    vehicleRecord: response.data,
                    loading: false,
                    gmap: true,
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
        this.fetchIotLogTrack();
        this.fetchLastRides();
    }
    readNotification = async (id) => {
        try {
            this.setState({ loading: true })
            await axios.post(`admin/notification/read-notification`, { id: id });
        } catch (error) {
            console.log('error :>> ', error);
        }
    }
    assignRetainVehicleLog = async () => {
        this.setState({ assignRetainVehicleLoading: true });
        const filter = {
            filter:
                { vehicleId: this.state.id }
        }
        if (this.props.authUser.type === USER_TYPES.FRANCHISEE) {
            filter.filter.or = [
                { referenceId: this.props.authUser.id },
                { assignerId: this.props.authUser.id }
            ]
        } else if (this.props.authUser.type === USER_TYPES.DEALER) {
            filter.filter.referenceId = this.props.authUser.id
        } else {
            filter.filter.userType = USER_TYPES.FRANCHISEE
        }
        try {
            let response = await axios.post(`admin/assign-vehicle-logs`, filter);
            if (response && response.code === 'OK') {
                this.setState({
                    assignRetainVehicleLog: response.data,
                    assignRetainVehicleLoading: false,
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ assignRetainVehicleLoading: false });
        }
    }
    readNotification = async (id) => {
        try {
            this.setState({ loading: true })
            await axios.post(`admin/notification/read-notification`, { id: id });
        } catch (error) {
            console.log('error :>> ', error);
        }
    }
    handleClick = (e) => {
        this.setState({
            current: e.key
        });
    }
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

    getStatusLable = (status) => {
        let label = '';
        if (status) {
            let displayRecord = _.find(RIDE_STATUS_ARRAY, { type: status });
            if (displayRecord && displayRecord.label) {
                label = displayRecord.label;
            }
        }

        return label;
    }
    handleAction = async (command, isPopUp, index, isNewMethod, manufacturer) => {
        if (isPopUp) {
            let key = IOT_COMMANDS[manufacturer][index].key;
            this.setState({
                showModal: true,
                command: command,
                key: key,
                isNewMethod: isNewMethod,
                manufacturer: manufacturer
            });
        } else {
            let obj = {};
            obj.vehicleId = this.state.id;
            obj.command = command;
            if (isNewMethod) {
                obj.command = 'commandToPerform';
                obj.data = {
                    command: command
                }
                let commandValue = IOT_COMMANDS[manufacturer][index].commandValue;
                if (commandValue) {
                    obj.data.value = commandValue;
                }
            }
            this.handleResponse(obj);
        }
    }
    handleResponse = async (obj) => {
        try {
            let response = await axios.post('admin/iot/command', obj);
            message.success(response.message);
            setTimeout(this.fetch(), 1000);
        } catch (error) {
            message.error(error.message);
        }
    }
    handleOk = (obj) => {
        obj.command = this.state.command;
        if (obj.command.indexOf('lock') > -1 &&
            this.state.data.onGoingRide &&
            this.state.data.onGoingRide.iotRideId
        ) {
            obj.iotRideId = this.state.data.onGoingRide.iotRideId;
        }
        obj.vehicleId = this.state.id;
        this.setState({ showModal: false });
        this.handleResponse(obj);
    }
    handleIotNewButton = (value) => {
        let obj = {};
        obj.command = 'commandToPerform';
        obj.vehicleId = this.state.id;
        obj.data = {
            command: this.state.command,
            value: value
        }
        this.setState({ showModal: false });
        this.handleResponse(obj);
    }
    handleCancel = () => {
        this.setState({ showModal: false });
        setTimeout(this.fetch(), 1000);
    }
    handlePaymentClick = async (id) => {
        try {
            this.setState({ loading: true });
            let response = await axios.post(
                '/admin/ride-booking/charge-customer-for-ride',
                { rideId: id }
            );
            if (response && response.code === 'OK') {
                message.success(response.message || <IntlMessages id="app.paymentSuccessful" defaultMessage="Payment Successful!" />);
                this.fetch();
            } else if (response) {
                message.error(response.message || <IntlMessages id="app.paymentFailed" defaultMessage="Payment Failed!" />);
            }
            this.setState({ loading: false });
        } catch (error) {
            console.log('error', error);
        }
    }

    fetchIotLogTrack = async () => {
        let random = Math.random() * 10;
        const { id } = this.state;
        try {
            let response = await axios.get(`admin/vehicle/detail/iot-log-track/${id}?a=${random}`);
            if (response && response.code === 'OK') {
                this.setState({
                    IOTLogTrack: response.data.IOTLogTrack,
                    IOTLogTrackCount: response.data.IOTLogTrackCount
                });
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    fetchLastRides = async () => {
        let random = Math.random() * 10;
        const { id } = this.state;
        try {
            let response = await axios.get(`admin/vehicle/detail/last-rides/${id}?a=${random}`);
            if (response && response.code === 'OK') {
                this.setState({ lastRide: response.data.lastRides });
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }

    render() {
        const { data, vehicleRecord, id, loading, showModal, command, key, isNewMethod, manufacturer } = this.state;
        let url = 'admin/vehicle/get-chart-data';
        let image = {
            scooter: require('assets/images/scooter.png'),
            halfScooter: require('assets/images/escooter-2.png'),
            bicycle: require('assets/images/ebike.png'),
            halfbicycle: require('assets/images/ebike.png'),
            bike: require('assets/images/bike.png'),
            halfbike: require('assets/images/bike-half.png')
        };
        let vehicleLatLong = {};
        if (data && data.currentLocation && data.currentLocation.coordinates) {
            vehicleLatLong = {
                lat: data.currentLocation.coordinates[1],
                lng: data.currentLocation.coordinates[0]
            };
        }

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between" style={{ marginBottom: 20 }}>
                            <div className="gx-d-flex pageTitleBreadcrumb">
                                <h1 className="pageHeading">{vehicleRecord.name}</h1>
                                <Breadcrumb>
                                    <Breadcrumb.Item>Vehicle</Breadcrumb.Item>
                                    <Breadcrumb.Item>{vehicleRecord.name}</Breadcrumb.Item>
                                </Breadcrumb>
                                <div>
                                    {data.connectionStatus ? <Tag color="green"><IntlMessages id="app.connected" defaultMessage="Connected" /></Tag> :
                                        <Tag color="red"><IntlMessages id="app.notConnected" defaultMessage="Not Connected" /></Tag>}
                                </div>
                            </div>
                            <div className="topbarCommonBtn">
                                <Link to={{ pathname: `/e-scooter/vehicle`, filter: this.props.location.filter }}>
                                    <Button className="ant-btn gx-mb-0" style={{ display: 'inline-flex' }}>List</Button>
                                </Link>
                            </div>

                            {/* <div className="vehicleTabMenu">
                                <Menu onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal">
                                    <Menu.Item key="overview">
                                        Overview
                                    </Menu.Item>
                                    <Menu.Item key="liveTrack">
                                        Live Track
                                    </Menu.Item>
                                    <Menu.Item key="fares">
                                        Fares
                                    </Menu.Item>
                                </Menu>
                            </div> */}
                        </Row>
                    </div>
                </Affix>
                <div className="vehicleDetailMain" style={{ padding: '0px 15px' }}>
                    <Row>
                        <Col span={7}>
                            <Card
                                className="cardPaddingLess cardWithScooterImage"
                                loading={loading}
                            >
                                <div className="scooterImageCard">
                                    <img alt=""
                                        src={vehicleRecord.type === VEHICLE_TYPES.SCOOTER ? image.scooter : vehicleRecord.type === VEHICLE_TYPES.BIKE ? image.bike : image.bicycle} />
                                </div>
                                <ul>
                                    <li>
                                        <div
                                            className="cardListTitle">{vehicleRecord.type === VEHICLE_TYPES.SCOOTER ? <IntlMessages id="app.scooterID" defaultMessage="Scooter ID" /> : vehicleRecord.type === VEHICLE_TYPES.BIKE ? <IntlMessages id="app.bikeId" defaultMessage="Bike ID" /> : <IntlMessages id="app.bicycleId" defaultMessage="Bicycle ID" />}</div>
                                        <div>{vehicleRecord.registerId ? vehicleRecord.registerId : '-'}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.power" defaultMessage="Power" /></div>
                                        <div>{data.batteryLevel ? data.batteryLevel : '0'} %</div>
                                    </li>
                                    {vehicleRecord.type !== VEHICLE_TYPES.BICYCLE ?
                                        <>
                                            <li>
                                                <div className="cardListTitle"><IntlMessages id="app.speedLimit" defaultMessage="Speed Limit" /></div>
                                                <div>{data.maxSpeedLimit && data.maxSpeedLimit.actualValue ?
                                                    <>{data.maxSpeedLimit.actualValue} {DEFAULT_DISTANCE_UNIT}/<IntlMessages id="app.hour" defaultMessage="hour" /></>
                                                    : '-'}
                                                </div>
                                            </li>
                                            <li>
                                                <div className="cardListTitle"><IntlMessages id="app.vehicle.macAddress" defaultMessage="MAC Address" /></div>
                                                <div>{vehicleRecord.mac ? vehicleRecord.mac : '-'}</div>
                                            </li>
                                        </> :
                                        null}
                                    {vehicleRecord.type === VEHICLE_TYPES.BIKE ?
                                        <li>
                                            <div className="cardListTitle"><IntlMessages id="app.vehicle.numberPlateLabel" defaultMessage="VIN (Number Plate)" /></div>
                                            <div>{vehicleRecord.numberPlate ? vehicleRecord.numberPlate : '-'}</div>
                                        </li>
                                        : null}
                                    {vehicleRecord.type === VEHICLE_TYPES.BIKE ?
                                        <>
                                            <li>
                                                <div className="cardListTitle"><IntlMessages id="app.vehicle.qrNumber" defaultMessage="QR number" /></div>
                                                <div>{data.qrNumber}</div>
                                            </li>
                                            <li>
                                                <div className="cardListTitle"><IntlMessages id="app.vehicle.macAddress" defaultMessage="MAC Address" /></div>
                                                <div>{data.mac || '-'}</div>
                                            </li>
                                            <li>
                                                <div className="cardListTitle"><IntlMessages id="app.addedBy" defaultMessage="Added By" /></div>
                                                <div>{data.addedBy ? data.addedBy.name : '-'}</div>
                                            </li>
                                            <li>
                                                <div className="cardListTitle"><IntlMessages id="app.vehicle.modelName" defaultMessage="Model Name" /></div>
                                                <div>{vehicleRecord.modelName ? vehicleRecord.modelName : '-'}</div>
                                            </li>
                                        </>
                                        : null}
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.distance" defaultMessage="Distance" /></div>
                                        <div>{vehicleRecord.vehicleSummary && vehicleRecord.vehicleSummary.rideSummary ?
                                            UtilService.displayNumber(vehicleRecord.vehicleSummary.rideSummary.distance) :
                                            0} {DEFAULT_DISTANCE_UNIT}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.status" defaultMessage="Status" /></div>
                                        <div>{data.isActive === true ? <IntlMessages id="app.active" defaultMessage="Active" /> : <IntlMessages id="app.deactive" defaultMessage="Deactive" />}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.vehicle.activated" defaultMessage="Activated" /></div>
                                        <div>{vehicleRecord.createdAt ? UtilService.displayDate(vehicleRecord.createdAt) : '-'}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.vehicle.imei" defaultMessage="IMEI" /></div>
                                        <div>{vehicleRecord.imei ? vehicleRecord.imei : '-'}</div>
                                    </li>
                                    {vehicleRecord.iccid && <li>
                                        <div className="cardListTitle"><IntlMessages id="app.vehicle.iccid" defaultMessage="ICCID" /></div>
                                        <div>{vehicleRecord.iccid}</div>
                                    </li>}
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.lastConnected" defaultMessage="Last Connected" /></div>
                                        <div>{UtilService.displayDate(data.lastConnectedDateTime)}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.lastChecked" defaultMessage="Last Checked" /></div>
                                        <div>{UtilService.displayDate(vehicleRecord.lastConnectionCheckDateTime)}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.lastLocationChanged" defaultMessage="Last Location Changed" /></div>
                                        <div>{UtilService.displayDate(vehicleRecord.lastLocationChanged)}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.vehicle.manufacturer" defaultMessage="Manufacturer" /></div>
                                        <div>{vehicleRecord.manufacturer ? vehicleRecord.manufacturer.name : '-'}</div>
                                    </li>
                                    <li>
                                        <div className="cardListTitle"><IntlMessages id="app.addedBy" defaultMessage="Added By" /></div>
                                        <div>{vehicleRecord.addedBy ? vehicleRecord.addedBy.name : '-'}</div>
                                    </li>
                                    {data.hasOwnProperty('lockStatus') && <li>
                                        <div className="cardListTitle"><IntlMessages id="app.vehicle.locked" defaultMessage="Locked" /></div>
                                        {data.lockStatus ? <Tag color="green"><IntlMessages id="app.yes" defaultMessage="Yes" /></Tag> :
                                            <Tag color="red"><IntlMessages id="app.no" defaultMessage="No" /></Tag>}
                                    </li>}
                                    {/* <li>
                                                <div className="cardListTitle">Connection Status</div>
                                                {vehicleRecord.connectionStatus ? <Tag color="green">Connected</Tag> :
                                                    <Tag color="red">Not Connected</Tag>}
                                            </li> */}
                                    {!data.isRideCompleted && <li>
                                        <div className="cardListTitle"><IntlMessages id="app.running" defaultMessage="Running" /></div>
                                        <Tag color="green"><IntlMessages id="app.true" defaultMessage="True" /></Tag>
                                    </li>}
                                </ul>
                            </Card>
                            <div>
                                <Card
                                    className="cardPaddingLess cardWithScooterImage"
                                    loading={loading}
                                >
                                    {this.state.gmap ?
                                        <GeoLocationGoogleMapDetails
                                            loadingElement={<div style={{ height: `100%` }} />}
                                            containerElement={<div style={{ height: `330px` }} />}
                                            mapElement={<div style={{ height: `100%` }} />}
                                            center={vehicleLatLong.lat ? vehicleLatLong : null}
                                            mapCenter={vehicleLatLong.lat ? vehicleLatLong : DEFAULT_MAP_CENTER}
                                            radius={50}
                                        /> :
                                        null}
                                </Card>
                            </div>
                        </Col>
                        <Col span={17}>
                            <ChartData url={url} filterBy={{ vehicleId: id }} height={500} page={PAGE_PERMISSION.VEHICLES} authUser={this.props.authUser} />
                            <Row>
                                <Col span={14} className="CardTimeline">
                                    <Card
                                        className="cardPaddingLess"
                                        loading={loading}
                                    >
                                        <CustomScrollbars className="gx-module-content-scroll"
                                            style={{ maxHeight: 330 }}>
                                            {
                                                this.state.lastRide && this.state.lastRide.length > 0 ?
                                                    <ESRidesStatusCard
                                                        data={this.state.lastRide}
                                                        currentPage={window.location.pathname}
                                                        handleClick={this.handlePaymentClick}
                                                    /> :
                                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                        </CustomScrollbars>
                                    </Card>
                                    <Card
                                        className="cardPaddingLess"
                                        loading={this.state.assignRetainVehicleLoading}
                                    >
                                        <CustomScrollbars className="gx-module-content-scroll"
                                            style={{ maxHeight: 330 }}>
                                            {
                                                this.state.assignRetainVehicleLog && this.state.assignRetainVehicleLog.length > 0 ?
                                                    <AssignRetainVehicleTrack
                                                        data={this.state.assignRetainVehicleLog}
                                                        userType={this.props.authUser.type}
                                                    /> :
                                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                        </CustomScrollbars>
                                    </Card>
                                </Col>

                                <Col span={10} className="CardTimeline">
                                    <Card
                                        title={<IntlMessages id="app.vehicle.vehicleStatus" defaultMessage="Vehicle Status" />}
                                        className="cardPaddingLess vehicleStatusCard"
                                        loading={loading}
                                    >
                                        <Row>
                                            <Col span={8}>
                                                <div className="StatusVehicle">
                                                    <h4>{vehicleRecord.batteryLevel ? vehicleRecord.batteryLevel : '0'}%</h4>
                                                    <div className="StatusLabel"><IntlMessages id="app.battery" defaultMessage="Battery" /></div>
                                                </div>
                                                <div className="StatusVehicle">
                                                    <h4 className="gx-text-nowrap">
                                                        {vehicleRecord.vehicleSummary && vehicleRecord.vehicleSummary.rideSummary ?
                                                            UtilService.displayNumber(vehicleRecord.vehicleSummary.rideSummary.distance) :
                                                            0} {DEFAULT_DISTANCE_UNIT}</h4>
                                                    <div
                                                        className="StatusLabel"><IntlMessages id="app.total" defaultMessage="Total" /> {DEFAULT_DISTANCE_UNIT}</div>
                                                </div>
                                                {vehicleRecord.type !== VEHICLE_TYPES.BICYCLE ?
                                                    <div className="StatusVehicle">
                                                        <h4 className="gx-text-nowrap">{vehicleRecord ? vehicleRecord.speed : 0} {DEFAULT_DISTANCE_UNIT}/<IntlMessages id="app.hour" defaultMessage="hour" /></h4>
                                                        <div className="StatusLabel"><IntlMessages id="app.speed" defaultMessage="Speed" /></div>
                                                    </div> : null}
                                                <div className="StatusVehicle">
                                                    <h4 className="gx-text-nowrap">
                                                        {vehicleRecord.vehicleSummary && vehicleRecord.vehicleSummary.rideSummary ?
                                                            UtilService.getSecondsToHms(vehicleRecord.vehicleSummary.rideSummary.time) :
                                                            '00:00'} </h4>
                                                    <div className="StatusLabel"><IntlMessages id="app.rides.totalTime" defaultMessage="Total Time" /></div>
                                                </div>
                                            </Col>
                                            <Col span={16} className="VehicleImage">
                                                <img alt=""
                                                    src={vehicleRecord.type === VEHICLE_TYPES.SCOOTER ? image.halfScooter : vehicleRecord.type === VEHICLE_TYPES.BIKE ? image.halfbike : image.halfbicycle} />
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={23}>
                            <IotButtons
                                vehicleRecord={this.state.vehicleRecord}
                                handleAction={this.handleAction}
                                handleFetch={this.fetch}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={23}>
                            <VehicleCommandTrack
                                loading={loading}
                                IOTLogTrack={this.state.IOTLogTrack}
                                IOTLogTrackCount={this.state.IOTLogTrackCount}
                                data={this.state.vehicleRecord}
                            />
                        </Col>
                    </Row>
                    {showModal && <WrappedActionModal
                        visible={showModal}
                        command={command}
                        value={data[key] ? data[key] : null}
                        isNewMethod={isNewMethod}
                        onOk={this.handleOk.bind(this)}
                        onCancel={this.handleCancel.bind(this)}
                        handleIotNewButton={this.handleIotNewButton.bind(this)}
                        manufacturer={manufacturer}
                    />}
                </div>
            </div>
        );
    }
}



const mapStateToProps = ({ auth }) => {
    const { authUser, socket } = auth;

    return { authUser, socket };
};

export default connect(mapStateToProps)(VehicleDetails);

