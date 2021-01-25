
import React, { Component } from 'react';
import GoogleMapWithRideInfo from "./ridePath";
import UtilService from '../../services/util';
import { connect } from 'react-redux';
import { RIDE_STATUS, SOCKET_PAGE, BASE_URL, SOCKET_CONNECTION } from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';
var _ = require('lodash')

/*
 *
 *  Add <script src="https://maps.googleapis.com/maps/api/js"></script>
 *  to your HTML to provide google.maps reference
 *
 *  @author: @chiwoojo
 */
class RidesMap extends Component {
    constructor(props) {
        super(props);

        this.state = {
            zoom: 12,
            center: props.center,
            // array of objects of markers
            markers: [],
            openInfoWindowMarkerId: props.openInfoWindowMarkerId,
            locationTrack: this.props.locationTrack
        };



        if (props.rides && props.rides.length) {
            _.each(props.rides, (ride) => {
                if (ride && ride.vehicleId && ride.vehicleId.currentLocation &&
                    ride.vehicleId.currentLocation.coordinates.length > 0
                ) {
                    let location = ride.vehicleId.currentLocation.coordinates;
                    let obj = {
                        id: ride.id,
                        location: {
                            lat: location[1],
                            lng: location[0]
                        },
                        isMarkerVisible: true,
                        showInfo: false,
                        infoContent: this.getInfoContent(ride)
                    };
                    this.state.markers.push(obj);
                }
            });
        }
    }

    getInfoContent(ride) {
        return (
            <div className="d-flex">
                <div className="ml-1">
                    <p>
                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.dashboard.rideNumber" />: </span>{ride.rideNumber ? ride.rideNumber : ''}
                    </p>
                    <p>
                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.name" />: </span>{ride.vehicleId.name}
                    </p>
                    <p>
                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.qrnumber" />: </span>{ride.vehicleId.qrNumber}
                    </p>
                    <p>
                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.battery" />: </span>{ride.vehicleId.batteryLevel}%
                                    </p>
                    <p>
                        <span style={{ fontWeight: 600 }}><IntlMessages id="app.speed" />: </span>{ride.vehicleId.speed}
                    </p>
                </div>
            </div>
        )
    }
    updateZoom(zoom) {
        if (this.state.zoom !== zoom) {
            this.setState({ zoom: zoom });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.openInfoWindowMarkerId !== this.state.openInfoWindowMarkerId) {
            let center = {};
            let markers = this.state.markers.map((marker) => {
                if (marker.id === this.props.openInfoWindowMarkerId) {
                    center = marker.location;

                    return {
                        ...marker,
                        showInfo: true
                    };
                }
                if (marker.id === this.state.openInfoWindowMarkerId) {
                    return {
                        ...marker,
                        showInfo: false
                    };
                }

                return marker;
            });
            let updateObj = {
                markers: markers,
                openInfoWindowMarkerId: this.props.openInfoWindowMarkerId
            };
            if (center && center.lat) {
                if (this.state.center !== center) {
                    updateObj.center = center;
                }
                updateObj.zoom = 15;
            }

            this.setState(updateObj, () => {
                if (updateObj.center) {
                    this.setState({ zoom: 15 });
                }
            });
        }
    }

    // socket disabled for ride's page

    // componentDidMount() {
    //     if (!SOCKET_CONNECTION) {
    //         return;
    //     }
    //     this.props.socket.emit('adminPageChange', { page: SOCKET_PAGE.RIDES });

    //     if (this.props.isOnGoingStatus === RIDE_STATUS.ON_GOING) {
    //         this.props.socket.on('vehicleUpdate', ({ data }) => {
    //             console.log('vehicle', data);
    //             let rideObj = { vehicleId: { ...data.vehicleData } }
    //             let location = data.vehicleData.currentLocation.coordinates;
    //             let newVehicleData = {
    //                 id: data.rideId,
    //                 location: {
    //                     lat: location[1],
    //                     lng: location[0]
    //                 },
    //                 isMarkerVisible: true,
    //                 showInfo: false,
    //                 infoContent: this.getInfoContent(rideObj)
    //             }
    //             this.props.changeLocationTrack(data);
    //             let markers = [...this.state.markers]
    //             var index = _.findIndex(markers, { id: data.rideId });
    //             markers.splice(index, 1, newVehicleData);
    //             this.setState({ markers })
    //         });
    //     }
    // }

    componentWillUnmount() {
        if (!SOCKET_CONNECTION) {
            return;
        }
        this.props.socket.emit('adminPageChange', { page: '' });
    }

    render() {
        return (
            <GoogleMapWithRideInfo
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                center={this.state.center}
                markers={this.state.markers}
                onMarkerClick={this.props.toggleMarker}
                onMarkerClose={this.props.toggleMarker}
                zoom={this.state.zoom}
                updateZoom={this.updateZoom.bind(this)}
                vehicleType={this.props.vehicleType}
                vehicleData={this.props.vehicleData}
                locationTrack={this.props.locationTrack}
                isDrawPath={this.props.isDrawPath}
                isVisibleMarker={this.props.isVisibleMarker}
                zoneCoordinates={this.props.zoneCoordinates}
                nestCoordinates={this.props.nestCoordinates}
            />
        );
    }
}


const mapStateToProps = ({ auth }) => {
    const { authUser, socket } = auth;

    return { authUser, socket };
};

export default connect(mapStateToProps)(RidesMap);
