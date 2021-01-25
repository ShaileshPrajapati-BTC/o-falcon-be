import { GoogleMap, InfoWindow, Marker, withGoogleMap, Polygon, Rectangle, Circle } from 'react-google-maps';
import { Icon, Card, Spin, Tooltip, Tag } from 'antd';
import React from 'react';
import { DEFAULT_MAP_CENTER, VEHICLE_TYPES, DEFAULT_VEHICLE, FILTER_BY_VEHICLE_TYPE, USER_TYPES, BASE_URL, SOCKET_PAGE, SOCKET_CONNECTION, FRANCHISEE_VISIBLE, CLIENT_VISIBLE, DEFAULT_API_ERROR, SHAPE_TYPE, FILTER_BY_NEST_TYPE } from '../../constants/Common';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import ScooterMapMarker from 'assets/images/scooter-map-marker.png';
import BicycleMapMarker from 'assets/images/bicycle-map-marker.png';
import BikeMapMarker from 'assets/images/bike-map-marker.png';

import { connect } from 'react-redux';
import { getFranchisee } from "../../appRedux/actions/franchisee";
import { Link } from 'react-router-dom';
import _ from 'lodash';
import UtilService from '../../services/util';
import axios from 'util/Api';
import IntlMessages from "../../util/IntlMessages";

const google = window.google;
const GoogleMapWithRideInfo = withGoogleMap((props) => {
    function handleZoomChanged() {
        props.updateZoom(this.getZoom());
    }

    const getVehicleIcon = vehicleType => {
        switch (vehicleType) {
            case VEHICLE_TYPES.SCOOTER:
                return ScooterMapMarker;
            case VEHICLE_TYPES.BICYCLE:
                return BicycleMapMarker;
            case VEHICLE_TYPES.BIKE:
                return BikeMapMarker;
            default:
                return ScooterMapMarker;
        }
    }

    return (
        <GoogleMap
            center={props.center}
            zoom={props.zoom}
            onZoomChanged={handleZoomChanged}
        >
            <MarkerClusterer
                averageCenter
                enableRetinaIcons
                gridSize={60}
            >
                {props.markers.map((marker) => {
                    return (
                        marker.isMarkerVisible &&
                        <Marker
                            icon={getVehicleIcon(marker.vehicleType)}
                            defaultIcon={ScooterMapMarker}
                            key={marker.id}
                            position={marker.location}
                            onClick={() => {
                                return props.onMarkerClick(marker);
                            }}
                        >
                            {marker.showInfo &&
                                <InfoWindow onCloseClick={() => {
                                    return props.onMarkerClose(marker);
                                }}>
                                    <div>{marker.infoContent}
                                    </div>
                                </InfoWindow>
                            }
                        </Marker>
                    );
                })}
            </MarkerClusterer>
            {
                props.zoneCoordinates && props.zoneCoordinates.map((path) => {
                    let fillColor = "#1aff1a";
                    if (path.shapeType === SHAPE_TYPE.POLYGON) {
                        return <Polygon
                            key={`poly-${path.id}`}
                            paths={path.coordinates}
                            strokeOpacity={0.8}
                            strokeWeight={3}
                            editable={props.editId === path.id || path.id === 'addNewZone'}
                            options={{
                                strokeOpacity: 0.8,
                                strokeColor: "#454545",
                                fillColor: fillColor
                            }}
                            shapeType={path.shapeType}
                        />;
                    } else if (path.shapeType === SHAPE_TYPE.RECTANGLE) {
                        return <Rectangle
                            key={`rect-${path.id}`}
                            bounds={path.bounds}
                            strokeOpacity={0.8}
                            strokeWeight={3}
                            editable={props.editId === path.id || path.id === 'addNewZone'}
                            options={{
                                strokeOpacity: 0.8,
                                strokeColor: "#454545",
                                fillColor: fillColor
                            }}
                            shapeType={path.shapeType}
                        />;
                    } else if (path.shapeType === SHAPE_TYPE.CIRCLE) {
                        return <Circle
                            center={{ lat: parseFloat(path.lat), lng: parseFloat(path.lng) }}
                            key={`circle-${path.id}`}
                            editable={props.editId === path.id || path.id === 'addNewZone'}
                            radius={parseFloat(path.radius)}
                            // onCenterChanged={() => props.handleOverlayChange(path)}
                            // onRadiusChanged={() => props.handleOverlayChange(path)}
                            // onMouseUp={() => { props.handleOverlayChange(path) }}
                            options={{
                                fillColor: fillColor,
                                fillOpacity: 0.2,
                                strokeWeight: 3,
                                clickable: false,
                                // draggable: true,
                                geodesic: true,
                                zIndex: 1,
                            }}
                        />
                    }
                })
            }
            {
                props.nestCoordinates && props.nestCoordinates.map((path) => {
                    let fillColor = FILTER_BY_NEST_TYPE.find((e) => e.type === path.nestType).nestColor;
                    if (path.shapeType === SHAPE_TYPE.POLYGON) {
                        return <Polygon
                            key={`poly-${path.id}`}
                            paths={path.coordinates}
                            strokeOpacity={0.8}
                            strokeWeight={3}
                            editable={props.editId === path.id || path.id === 'addNewNest'}
                            // onMouseUp={(e) => props.handleOverlayChange(path)}
                            options={{
                                strokeOpacity: 0.8,
                                strokeColor: "#454545",
                                fillColor: fillColor
                            }}
                            shapeType={path.shapeType}
                        />;
                    } else if (path.shapeType === SHAPE_TYPE.RECTANGLE) {
                        return <Rectangle
                            key={`rect-${path.id}`}
                            bounds={path.bounds}
                            strokeOpacity={0.8}
                            strokeWeight={3}
                            editable={props.editId === path.id || path.id === 'addNewNest'}
                            // onBoundsChanged={(e) => props.handleOverlayChange(path)}
                            options={{
                                strokeOpacity: 0.8,
                                strokeColor: "#454545",
                                fillColor: fillColor
                            }}
                            shapeType={path.shapeType}
                        />;
                    } else if (path.shapeType === SHAPE_TYPE.CIRCLE) {
                        return <Circle
                            center={{ lat: parseFloat(path.lat), lng: parseFloat(path.lng) }}
                            key={`circle-${path.id}`}
                            editable={props.editId === path.id || path.id === 'addNewNest'}
                            radius={parseFloat(path.radius)}
                            // onCenterChanged={() => props.handleOverlayChange(path)}
                            // onRadiusChanged={() => props.handleOverlayChange(path)}
                            // onMouseUp={() => { props.handleOverlayChange(path) }}
                            options={{
                                fillColor: fillColor,
                                fillOpacity: 0.2,
                                strokeWeight: 3,
                                clickable: false,
                                // draggable: true,
                                geodesic: true,
                                zIndex: 1,
                            }}
                            shapeType={path.shapeType}
                        />
                    }
                })
            }
        </GoogleMap>
    );
});

let count = 0;
class VehicleChart extends React.Component {
    constructor(props) {
        super(props);
        let filter = {
            vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type,
            // franchiseeId: null
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            zoom: 15,
            // array of objects of markers
            markers: [],
            openInfoWindowMarkerId: '',
            center: this.props.mapCenter,
            loading: false,
            filter: {
                filter: filter
            },
            totalVehicles: 0,
            zoneCoordinates: [],
            nestCoordinates: []
        };
        this.vechileInterval = 0;
    }
    componentWillReceiveProps(nextProps) {
        if ((this.props.filter.type !== nextProps.filter.type) || (FRANCHISEE_VISIBLE && this.props.filter.franchisee !== nextProps.filter.franchisee)) {
            this.setState((state) => {
                state.filter.filter.vehicleType = nextProps.filter.type;
                if (FRANCHISEE_VISIBLE) {
                    state.filter.filter.franchiseeId = nextProps.filter.franchisee;
                }
            }, () => {
                this.fetch();
            });
        }
    }

    updateZoom(zoom) {
        if (this.state.zoom !== zoom) {
            this.setState({ zoom: zoom });
        }
    }

    toggleMarker = (vehicle) => {
        let id = vehicle.id;
        // to toggle Popup
        if (vehicle.showInfo || vehicle.id === this.state.openInfoWindowMarkerId) {
            id = '';
        }
        this.setState({ openInfoWindowMarkerId: id });
    }

    componentDidMount() {
        if (!SOCKET_CONNECTION) {
            return;
        }
        this.props.socket.emit('adminPageChange', {
            page: SOCKET_PAGE.DASHBOARD,
            userId: this.props.authUser && this.props.authUser.id
        });
        this.props.socket.on('receiveVehicleData', ({ data }) => {
            if (data && data.length > 0) {
                this.fetch(data)
            }
        });
        this.props.socket.emit('getVehicles', {
            userId: this.props.authUser && this.props.authUser.id
        });
        this.props.socket.on('vehicleUpdate', ({ data }) => {
            console.log('vehicle', data.vehicleData);
            let newVehicleData = this.getMarkerObj(data.vehicleData);
            let markers = [...this.state.markers]
            var index = _.findIndex(markers, { id: data.vehicleData.id });
            markers.splice(index, 1, newVehicleData);
            this.setState({ markers })
        });
        this.getZones();
    }
    componentWillUnmount() {
        if (!SOCKET_CONNECTION) {
            return;
        }
        this.props.socket.emit('adminPageChange', { page: '', userId: '' });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.openInfoWindowMarkerId !== prevState.openInfoWindowMarkerId) {
            let markers = this.state.markers.map((marker) => {
                if (marker.id === prevState.openInfoWindowMarkerId) {
                    return {
                        ...marker,
                        showInfo: false
                    };
                }
                if (marker.id === this.state.openInfoWindowMarkerId) {
                    return {
                        ...marker,
                        showInfo: true
                    };
                }

                return marker;
            });

            this.setState({ markers });
        }
    }

    fetch = async (vehicleList = []) => {
        if (count < 1) {
            this.setState({ loading: true });
            count++;
        } else {
            this.setState({ loading: false });
        }
        try {
            // let response = await axios.post('admin/dashboard/get-vehicles', this.state.filter);
            let response = vehicleList;
            if (response && response.length > 0) {
                let markers = [];
                _.each(response, (vehicle) => {
                    if (vehicle && vehicle.currentLocation &&
                        vehicle.currentLocation.coordinates.length > 0
                    ) {
                        let obj = this.getMarkerObj(vehicle);
                        markers.push(obj);
                    }
                });
                this.setState({ markers: markers });
                this.setState({ totalVehicles: response.data.length });
            }
            this.setState({ loading: false });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
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
    getMarkerObj(vehicle) {
        let location = vehicle.currentLocation.coordinates;
        let obj = {
            id: vehicle.id,
            vehicleType: vehicle.type,
            location: {
                lat: location[1],
                lng: location[0]
            },
            isMarkerVisible: true,
            position: new google.maps.LatLng(location[1], location[0]),
            showInfo: false,
            infoContent:
                <div className="d-flex">
                    <div className="ml-1">
                        {
                            vehicle.activeRide ?
                                <div>
                                    <p>
                                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.dashboard.rideNumber" />: </span>
                                        {vehicle.activeRide.rideNumber}
                                    </p>
                                    <p>
                                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.user" />: </span>
                                        {vehicle.activeRide.userId.name}
                                    </p>
                                </div>
                                : null
                        }
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.name" />: </span>
                            <Link to={`/e-scooter/vehicle-details/${vehicle.id}`}>{vehicle.name}</Link>
                        </p>
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.qrnumber" />: </span>{vehicle.qrNumber}
                        </p>
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.battery" />: </span>{vehicle.batteryLevel}
                        </p>
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.speed" />: </span>{vehicle.speed}
                        </p>
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.status" />: </span>{vehicle.connectionStatus ? <Tag color="green"><IntlMessages id="app.connected" /></Tag> :
                                <Tag color="red"><IntlMessages id="app.notConnected" /></Tag>}
                        </p>
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.lastConnected" />: </span>{UtilService.displayDate(vehicle.lastConnectedDateTime)}
                        </p>
                        <p>
                            <span style={{ fontWeight: 600 }}><IntlMessages id="app.lastChecked" />: </span>{UtilService.displayDate(vehicle.lastConnectionCheckDateTime)}
                        </p>
                    </div>
                </div>

        };

        return obj;
    }

    render() {
        const { loading, totalVehicles } = this.state;

        const { authUser } = this.props;
        return (
            <Card className="CardTwoSec">
                <div className="cardInnerHead">
                    <h3 className="dashboardCardTitle">
                        <IntlMessages id="app.vehicles" />
                        <Tooltip title={<IntlMessages id="app.dashboard.allVehicleWithLocation" />}>
                            <Icon type="info-circle" />
                        </Tooltip>
                    </h3>
                    {
                        authUser.type === USER_TYPES.FRANCHISEE && FRANCHISEE_VISIBLE ?
                            <h4><IntlMessages id="app.dashboard.totalVehicleAssign" />: {totalVehicles}</h4> : null
                    }
                </div>
                <Spin spinning={loading} delay={100}>
                    <div style={{ height: 500, width: '100%' }}>
                        <GoogleMapWithRideInfo
                            loadingElement={<div style={{ height: `100%` }} />}
                            containerElement={<div style={{ height: `100%` }} />}
                            mapElement={<div style={{ height: `100%` }} />}
                            center={this.state.center}
                            markers={this.state.markers}
                            onMarkerClick={this.toggleMarker}
                            onMarkerClose={this.toggleMarker}
                            zoom={this.state.zoom}
                            updateZoom={this.updateZoom.bind(this)}
                            zoneCoordinates={this.state.zoneCoordinates}
                            nestCoordinates={this.state.nestCoordinates}
                        />
                    </div>
                </Spin>
            </Card>
        );
    }
}


const mapStateToProps = ({ auth }) => {
    const { authUser, mapCenter, socket } = auth;

    return { authUser, mapCenter, socket };
};

export default connect(mapStateToProps, { getFranchisee })(VehicleChart);
