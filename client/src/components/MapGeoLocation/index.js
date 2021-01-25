import { Circle, GoogleMap, withGoogleMap } from 'react-google-maps';
import React, { Component } from 'react';
import { DEFAULT_MAP_CENTER } from '../../constants/Common';


/*
 * https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
 *
 * Add <script src="https://maps.googleapis.com/maps/api/js"></script> to your HTML to provide google.maps reference
 */
class Geolocation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            center: DEFAULT_MAP_CENTER,
            radius: 50
        };

        if (props.center && props.center.length) {
            this.state.center = {
                lat: props.center[1],
                lng: props.center[0]
            };

        }
    }

    render() {
        const GeolocationGoogleMap = withGoogleMap((props) => {
            return (
                <GoogleMap
                    defaultZoom={15}
                    center={this.state.center}
                >
                    {props.center &&
                        <Circle
                            center={this.state.center}
                            radius={this.state.radius}
                            options={{
                                fillColor: 'var(--es--chart--bullet)',
                                fillOpacity: 0.7,
                                strokeColor: '#888',
                                strokeOpacity: 0.5,
                                strokeWeight: 50
                            }}
                        />
                    }
                </GoogleMap>
            );
        });

        return (
            <GeolocationGoogleMap
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `330px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
                center={this.state.center}
                content={this.state.content}
                radius={this.state.radius}
            />
        );
    }
}
export default Geolocation;
