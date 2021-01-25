import {
  GoogleMap, InfoWindow, Marker, withGoogleMap, Polyline, Polygon, Rectangle, Circle
} from 'react-google-maps';
import MarkerClusterer from 'react-google-maps/lib/components/addons/MarkerClusterer';
import React, { Component } from 'react';
import ScooterMapMarker from 'assets/images/scooter-map-marker.png';
import { Link } from 'react-router-dom';
import { Tag } from 'antd';
import UtilService from '../../services/util';
import BicycleMapMarker from 'assets/images/bicycle-map-marker.png';
import BikeMapMarker from 'assets/images/bike-map-marker.png';
import { VEHICLE_TYPES, SHAPE_TYPE, FILTER_BY_NEST_TYPE } from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';
const google = window.google;



class Mapping extends Component {

  constructor(props) {
    super(props);
    this.state = {
      locationTrack: [],
      propperAddress: [],
      isMarkerClick: false,
      markerId: null,
      icon: null,
    };
  }

  componentDidMount() {
    this.inIt()
  }

  getVehicleIcon = vehicleType => {
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

  inIt = async () => {
    const { locationTrack } = this.props;

    const startAndEndLocation = [locationTrack[0], locationTrack[locationTrack.length - 1]]

    const propperAddress = startAndEndLocation.map((place, i) => {
      return {
        latlng: startAndEndLocation[i]
      }
    })
    const icon = this.getVehicleIcon(this.props.vehicleType)

    await this.setState({ locationTrack, propperAddress, icon });
  }

  handleMarker = () => {
    this.setState(state => ({ isMarkerClick: !state.isMarkerClick, markerId: 0 }))
  }

  render() {
    const iconsettings = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      strokeColor: '#038fdd',
      strokeWeight: 8
    };

    const vehicle = this.props.vehicleData
    return (
      <React.Fragment>
        <React.Fragment>
          {
            this.state.propperAddress.map((place, i) => {
              return ((this.props.isDrawPath) && <Marker
                key={i} position={place.latlng}
                icon={(i === 0) ? this.state.icon : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'}
                onClick={this.handleMarker}
              >
                {
                  // Info window for start position
                  this.state.isMarkerClick && (this.state.markerId === i) &&
                  <InfoWindow>
                    <div className="d-flex">
                      <div className="ml-1">
                        {
                          vehicle.activeRide ?
                            <div>
                              <p>
                                <span style={{ fontWeight: 600 }}><IntlMessages id="app.rides.rideNumber" />: </span>
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
                          <span style={{ fontWeight: 600 }}> Status: </span>{vehicle.connectionStatus ? <Tag color="green"><IntlMessages id="app.connected" /></Tag> :
                            <Tag color="red">Not Connected</Tag>}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}><IntlMessages id="app.lastConnected" />: </span>{UtilService.displayDate(vehicle.lastConnectedDateTime)}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}><IntlMessages id="app.lastConnected" />: </span>{UtilService.displayDate(vehicle.lastConnectionCheckDateTime)}
                        </p>
                      </div>
                    </div>
                  </InfoWindow>}
              </Marker>)
            })
          }

          {this.props.isDrawPath && <Polyline
            path={this.state.locationTrack}
            options={{
              strokeColor: '#038fdd',
              strokeOpacity: 0.8,
              strokeWeight: 5,
              // icons: [{
              //   repeat: '100px', //CHANGE THIS VALUE TO CHANGE THE DISTANCE BETWEEN ARROWS
              //   icon: iconsettings,
              //   offset: '100%'
              // }]
            }}
          />}

        </React.Fragment>

        <React.Fragment>
          <MarkerClusterer
            averageCenter
            enableRetinaIcons
            gridSize={60}
          >
            {this.props.markers.map((marker) => {
              return (
                ((marker.isMarkerVisible && this.props.isVisibleMarker)) &&
                < Marker
                  icon={this.getVehicleIcon(marker.vehicleType)}
                  defaultIcon={ScooterMapMarker}
                  key={marker.id}
                  position={marker.location}
                  onClick={() => {
                    return this.props.onMarkerClick(marker);
                  }}
                >
                  {marker.showInfo &&
                    <InfoWindow onCloseClick={() => {
                      return this.props.onMarkerClose(marker);
                    }}>
                      <div>{marker.infoContent}
                      </div>
                    </InfoWindow>
                  }
                </Marker>
              );
            })}
          </MarkerClusterer>
        </React.Fragment>
      </React.Fragment >
    )
  }
}

const GoogleMapWithRideInfo =
  withGoogleMap(props => (
    <GoogleMap
      center={props.center}
      zoom={props.zoom}
      onZoomChanged={props.defaultZoom}
    >
      {
        ((props.markers.length > 0 && props.isVisibleMarker) ||
          (props.locationTrack.length > 0 && props.isDrawPath)) &&
        <Mapping
          markers={props.markers}
          onMarkerClick={props.onMarkerClick}
          onMarkerClose={props.onMarkerClose}
          locationTrack={props.locationTrack}
          travelMode={google.maps.TravelMode.WALKING}
          vehicleData={props.vehicleData}
          vehicleType={props.vehicleType}
          isDrawPath={props.isDrawPath}
          isVisibleMarker={props.isVisibleMarker}
        />
      }
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
      {
        props.nestCoordinates && props.nestCoordinates.map((path) => {
          let fillColor = FILTER_BY_NEST_TYPE.find((e) => e.type === path.nestType)
            ? FILTER_BY_NEST_TYPE.find((e) => e.type === path.nestType).nestColor
            : "#454545";
          console.log('path.nestType :>> ', fillColor);
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


  )
  );


export default GoogleMapWithRideInfo;