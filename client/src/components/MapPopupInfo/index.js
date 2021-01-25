import { GoogleMap, InfoWindow, Marker, withGoogleMap } from 'react-google-maps';
import React, { Component } from 'react';
import { DEFAULT_MAP_CENTER } from '../../constants/Common';

const google = window.google;
const _ = require('lodash');
const PopUpInfoWindowExampleGoogleMap = withGoogleMap((props) => {

    return (
        <GoogleMap
            defaultZoom={15}
            center={props.center}
        >
            {props.markers.map((marker, index) => {
                return (
                    <Marker
                        defaultIcon={require('assets/images/scooter-map-marker.png')}
                        key={index}
                        position={marker.position}
                        onClick={() => {

                            return props.onMarkerClick(marker);
                        }}
                    >
                        {/*
         Show info window only if the 'showInfo' key of the marker is true.
         That is, when the Marker pin has been clicked and 'onCloseClick' has been
         Successfully fired.
         */}
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
        </GoogleMap>
    )
    ;
});

/*
 *
 *  Add <script src="https://maps.googleapis.com/maps/api/js"></script>
 *  to your HTML to provide google.maps reference
 *
 *  @author: @chiwoojo
 */
export default class MapPopupInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            center: DEFAULT_MAP_CENTER,
            // array of objects of markers
            markers: []
        };

        if (props.coordinates && props.coordinates.length) {
            let centerCoordinates = _.first(props.coordinates);
            if (centerCoordinates && centerCoordinates.coordinates && centerCoordinates.coordinates.length) {
                this.state.center = {
                    lat: centerCoordinates.coordinates[1],
                    lng: centerCoordinates.coordinates[0]
                };
            }

            _.each(props.coordinates, (coor) => {
                if (coor && coor.coordinates && coor.coordinates.length) {
                    let obj = {
                        position: new google.maps.LatLng(coor.coordinates[1], coor.coordinates[0]),
                        showInfo: false,
                        infoContent:
              <div className="d-flex">
                  <div className="ml-1">
                      <p>{coor.name}</p>
                  </div>
              </div>

                    };
                    this.state.markers.push(obj);
                }
            });

        }


        this.handleMarkerClick = this.handleMarkerClick.bind(this);
        this.handleMarkerClose = this.handleMarkerClose.bind(this);

    }

    // Toggle to 'true' to show InfoWindow and re-renders simple
    handleMarkerClick(targetMarker) {
        this.setState({
            markers: this.state.markers.map((marker) => {
                if (marker === targetMarker) {
                    return {
                        ...marker,
                        showInfo: true
                    };
                }

                return marker;
            })
        });
    }

    handleMarkerClose(targetMarker) {
        this.setState({
            markers: this.state.markers.map((marker) => {
                if (marker === targetMarker) {
                    return {
                        ...marker,
                        showInfo: false
                    };
                }

                return marker;
            })
        });
    }

    render() {
        return (
            <PopUpInfoWindowExampleGoogleMap
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                center={this.state.center}
                markers={this.state.markers}
                onMarkerClick={this.handleMarkerClick}
                onMarkerClose={this.handleMarkerClose}
            />
        );
    }
}
