import React, { Component } from 'react';
import { GoogleMap, Polygon, withGoogleMap } from 'react-google-maps';
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager';
import { DEFAULT_MAP_CENTER } from '../../constants/Common';

const google = window.google;

const DrawingExampleGoogleMap = withGoogleMap((props) => {
    return (
        < GoogleMap
            defaultZoom={15}
            defaultCenter={new google.maps.LatLng(21.232437, 72.782860)}
        >
            <DrawingManager
                onPolygonComplete={props.handleOverlayComplete}
                defaultOptions={{
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: [
                            google.maps.drawing.OverlayType.POLYGON

                        ]
                    },
                    polygonOptions: {
                        fillColor: '#ff0000',
                        fillOpacity: 0.2,
                        strokeWeight: 3,
                        clickable: false,
                        editable: true,
                        zIndex: 1
                    }
                }}
            />
            {
                props.array.map((path, i) => {
                    return < Polygon
                        key={`poly-${i}`}
                        paths={path}
                        strokeOpacity={0.8}
                        strokeWeight={3}
                        fillColor="#FF0000"
                        strokeColor="#FF0000"
                        fillOpacity={0.2}
                        editable={i === 1}
                        onMouseUp={(e) => { return props.handleEditable(e, i) }}
                    />;
                })
            }
        </GoogleMap >
    );
}
);
export default class ListPolygon extends Component {

    state = {
        editablePoly: false,
        coordinates: [],
        polygonArr: [],
        center: DEFAULT_MAP_CENTER
    }
    onChangeEnd = (e) => {
        console.log(e);
        alert('change end');
    }

    componentDidMount() {
        let zoneArr = JSON.parse(localStorage.getItem('zone'));
        let coordinatesArr = []; let tempArr = [];
        zoneArr.map(function (zone) {

            coordinatesArr = [];
            zone.map((arr) => {

                let obj = { lat: arr[0], lng: arr[1] };
                coordinatesArr.push(obj);
                return coordinatesArr;
            });
            tempArr.push(coordinatesArr);
            return tempArr;
        });
        this.setState({
            polygonArr: tempArr
        });
        // this.center = this.state.polygonArr[0]
    }

    onhandleEditable = (event, index) => {
        // console.log("lat--", event.latLng.lat())
        // console.log("lng--", event.latLng.lng())

        this.state.polygonArr.map((x, i) => {
            debugger;
            return x;
            // if (i === index) {
            // x.getPath().then(y=>{
            //     debugger
            //     console.log('-');
            //     y.map(z => console.log(z.lat(), z.lng()));
            // })
            // }
        });
    }
    onOverlayComplete = (event) => {
        console.log(event);
        alert('Hi');
    }
    render() {

        return (
            <div>
                <DrawingExampleGoogleMap
                    handleOverlayComplete={this.onOverlayComplete}
                    array={this.state.polygonArr} center={this.state.center}
                    handleEditable={this.onhandleEditable}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `550px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />
            </div>
        );
    }
}
