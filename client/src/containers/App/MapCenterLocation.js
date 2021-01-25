import React from "react";
import { geolocated } from "react-geolocated";
import { setDefaultMapCenter } from 'appRedux/actions/Auth';
import { connect } from 'react-redux';
 
class MapCenterLocation extends React.Component {
    render() {
        if (!this.props.isGeolocationAvailable) {
            console.log('Your browser does not support Geolocation');
            return null;
        }
        if (!this.props.isGeolocationEnabled) {
            console.log('Geolocation is not enabled');
            return null;
        }
        if (this.props.coords && this.props.coords.latitude) {
            let latitude = this.props.coords.latitude;
            let longitude = this.props.coords.longitude;
            console.log("latitude - ", latitude)
            console.log("longitude - ", longitude)
            this.props.setDefaultMapCenter({ lat: latitude, lng: longitude });
            // this.props.setDefaultMapCenter({ lat: 21.0724051, lng: 73.8225029 }); // for testing
        }
        return null;
    }
}

const Temp = geolocated({
    positionOptions: {
        enableHighAccuracy: false,
    },
    userDecisionTimeout: 5000,
})(MapCenterLocation);

export default connect(null,{ setDefaultMapCenter })(Temp);
