import { GoogleMap, Polygon, withGoogleMap, Circle, Marker, Rectangle } from 'react-google-maps';
import React, { Component } from 'react';
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager';
import SearchBox from 'react-google-maps/lib/components/places/SearchBox';
import { SHAPE_TYPE, FILTER_BY_NEST_TYPE, NEST_TYPE } from '../../constants/Common';
import NoRide from 'assets/images/no-ride.svg';
import NoParking from 'assets/images/no-parking.svg';
import Parking from 'assets/images/parking.svg';
import SlowSpeed from 'assets/images/slow-speed.svg';
import RepairZone from 'assets/images/repair-Zone.svg';
import Ride from 'assets/images/ride.svg';
const _ = require('lodash');

const INPUT_STYLE = {
    boxSizing: `border-box`,
    MozBoxSizing: `border-box`,
    border: `1px solid transparent`,
    width: `300px`,
    height: `34px`,
    marginTop: `10px`,
    padding: `0 12px`,
    borderRadius: `1px`,
    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
    fontSize: `14px`,
    outline: `none`,
    textOverflow: `ellipses`,
    fillColor: '#454545'
};

const google = window.google;
let mapRef = {}
let nestRef = {};
let zoneRef = null;
let nestMarkerRef = {};

const getNestIcon = nestType => {
    switch (nestType) {
        case NEST_TYPE.NEST_RIDER:
            return Ride;
        case NEST_TYPE.NEST_REPAIR:
            return RepairZone;
        case NEST_TYPE.NO_RIDE_AREA:
            return NoRide;
        case NEST_TYPE.NO_PARKING:
            return NoParking;
        case NEST_TYPE.SLOW_SPEED:
            return SlowSpeed;
        case NEST_TYPE.NEST_DOCKING_STATION:
            return Parking;
        default:
            return Ride;
    }
}

const DrawingExampleGoogleMap = withGoogleMap((props) =>

    <GoogleMap
        defaultZoom={props.zoom}
        zoom={props.zoom}
        ref={(ref) => mapRef = ref}
        // center={new google.maps.LatLng(props.center.lat, props.center.lng)}
        options={{
            restriction: {
                latLngBounds: props.restrictedBounds,
                strictBounds: true
            }
        }}
        onZoomChanged={props.onZoonChanged}
    >
        {<SearchBox
            ref={props.onSearchBoxMounted}
            bounds={props.bounds}
            controlPosition={google.maps.ControlPosition.TOP_LEFT}
            onPlacesChanged={props.onPlacesChanged}
            onBoundsChanged={props.onBoundsChanged} >
            <input
                type="text"
                placeholder="Search Address"
                style={INPUT_STYLE}
            />
        </SearchBox >
        }
        {props.nestMarkers.map((nestMarker, index) => {
            return props.editId !== nestMarker.id &&
                <Marker
                    ref={(ref) => {
                        nestMarkerRef[nestMarker.id] = ref;
                    }}
                    key={nestMarker.id}
                    position={{
                        lat: nestMarker.lat,
                        lng: nestMarker.lng
                    }}
                    icon={{
                        url: getNestIcon(nestMarker.nestType),
                        // origin: new google.maps.Point(16, 0),
                        size: new google.maps.Size(props.iconSize, props.iconSize),
                        scaledSize: new google.maps.Size(props.iconSize, props.iconSize),
                        anchor: new google.maps.Point(props.iconSize / 2, props.iconSize / 2),
                    }}
                />;
        })}
        {
            props.markers.map((marker, index) =>
                <Marker key={index} position={marker.position} />
            )
        }
        {
            !props.isDrwaingControl && <DrawingManager
                // defaultDrawingMode={google.maps.drawing.OverlayType.CIRCLE}
                defaultOptions={{
                    drawingControl: !props.isDrwaingControl,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_RIGHT,
                        drawingModes: [
                            google.maps.drawing.OverlayType.POLYGON,
                            // google.maps.drawing.OverlayType.CIRCLE,
                            google.maps.drawing.OverlayType.RECTANGLE
                        ]
                    },
                    polygonOptions: {
                        fillColor: '#aaaaaa',
                        fillOpacity: 0.2,
                        strokeWeight: 3,
                        clickable: false,
                        editable: !props.isDrwaingControl,
                        zIndex: 1
                    },
                    circleOptions: {
                        fillColor: '#ff0000',
                        fillOpacity: 0.2,
                        strokeWeight: 3,
                        clickable: false,
                        draggable: true,
                        editable: !props.isDrwaingControl,
                        zIndex: 1,
                        geodesic: true
                    },
                    rectangleOptions: {
                        fillColor: '#aaaaaa',
                        fillOpacity: 0.2,
                        strokeWeight: 3,
                        clickable: false,
                        editable: !props.isDrwaingControl,
                        zIndex: 1
                    },
                }}
                onOverlayComplete={props.handleOverlayComplete}
            />
        }
        {
            props.zoneArr.map((path) => {
                if (path.shapeType === SHAPE_TYPE.CIRCLE) {
                    return <Circle
                        ref={(ref) => {
                            zoneRef = ref;
                        }}
                        center={{ lat: parseFloat(path.lat), lng: parseFloat(path.lng) }}
                        key={`circle-${path.id}`}
                        radius={parseFloat(path.radius)}
                        options={{
                            strokeOpacity: 0.8,
                            strokeColor: "#454545",
                            fillColor: "#454545"
                        }}
                        shapeType={path.shapeType}
                    />
                } else if (path.shapeType === SHAPE_TYPE.RECTANGLE) {
                    return <Rectangle
                        ref={(ref) => {
                            zoneRef = ref;
                        }}
                        key={`rect-${path.id}`}
                        bounds={path.bounds}
                        strokeOpacity={0.8}
                        strokeWeight={3}
                        editable={false}
                        options={{
                            strokeOpacity: 0.8,
                            strokeColor: "#454545",
                            fillColor: "#454545"
                        }}
                        shapeType={path.shapeType}
                    />;
                } else if (path.shapeType === SHAPE_TYPE.POLYGON) {
                    return <Polygon
                        ref={(ref) => {
                            zoneRef = ref;
                        }}
                        key={`poly-${path.id}`}
                        paths={path.coordinates}
                        strokeOpacity={0.8}
                        strokeWeight={3}
                        editable={false}
                        options={{
                            strokeOpacity: 0.8,
                            strokeColor: "#454545",
                            fillColor: "#454545"
                        }}
                        shapeType={path.shapeType}
                    />;
                }

            })
        }
        {
            props.nestCoordinates.map((path) => {
                let fillColor = FILTER_BY_NEST_TYPE.find((e) => e.type === path.nestType) ?
                    FILTER_BY_NEST_TYPE.find((e) => e.type === path.nestType).nestColor :
                    "#454545";
                if (path.shapeType === SHAPE_TYPE.POLYGON) {
                    return <Polygon
                        ref={(ref) => {
                            nestRef[path.id] = ref;
                        }}
                        key={`poly-${path.id}`}
                        paths={path.coordinates}
                        strokeOpacity={0.8}
                        strokeWeight={3}
                        editable={props.editId === path.id || path.id === 'addNewNest'}
                        onMouseUp={(e) => props.handleOverlayChange(path)}
                        options={{
                            strokeOpacity: 0.8,
                            strokeColor: "#454545",
                            fillColor: fillColor
                        }}
                        shapeType={path.shapeType}
                    />;
                } else if (path.shapeType === SHAPE_TYPE.RECTANGLE) {
                    return <Rectangle
                        ref={(ref) => {
                            nestRef[path.id] = ref;
                        }}
                        key={`rect-${path.id}`}
                        bounds={path.bounds}
                        strokeOpacity={0.8}
                        strokeWeight={3}
                        editable={props.editId === path.id || path.id === 'addNewNest'}
                        onBoundsChanged={(e) => props.handleOverlayChange(path)}
                        options={{
                            strokeOpacity: 0.8,
                            strokeColor: "#454545",
                            fillColor: fillColor
                        }}
                        shapeType={path.shapeType}
                    />;
                } else if (path.shapeType === SHAPE_TYPE.CIRCLE) {
                    return <Circle
                        ref={(ref) => {
                            nestRef[path.id] = ref;
                        }}
                        center={{ lat: parseFloat(path.lat), lng: parseFloat(path.lng) }}
                        key={`circle-${path.id}`}
                        editable={props.editId === path.id || path.id === 'addNewNest'}
                        radius={parseFloat(path.radius)}
                        onCenterChanged={() => props.handleOverlayChange(path)}
                        onRadiusChanged={() => props.handleOverlayChange(path)}
                        onMouseUp={() => { props.handleOverlayChange(path) }}
                        options={{
                            fillColor: fillColor,
                            fillOpacity: 0.2,
                            strokeWeight: 3,
                            clickable: false,
                            draggable: true,
                            geodesic: true,
                            zIndex: 1,
                        }}
                        shapeType={path.shapeType}
                    />
                }
            })
        }
    </GoogleMap >
);

export default class MapPolygone extends Component {

    async componentWillMount() {
        const refs = {};

        await this.setState({
            zoom: 15,
            bounds: null,
            center: this.props.center,
            selectedNestId: this.props.selectedNestId,
            markers: [],
            iconSize: 32,
            onMapMounted: (ref) => {
                refs.map = ref;
            },
            onBoundsChanged: () => {
                this.setState({
                    bounds: refs.map.getBounds(),
                    center: refs.map.getCenter()
                });
                refs.searchBox.setBounds(mapRef.getBounds());
            },
            onSearchBoxMounted: (ref) => {
                refs.searchBox = ref;
            },
            onPlacesChanged: () => {
                const places = refs.searchBox.getPlaces();
                const bounds = new google.maps.LatLngBounds();

                const nextMarkers = [];
                places.forEach((place) => {
                    const marker = {
                        position: place.geometry.location
                    };
                    nextMarkers.push(marker);
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                let firstAddress = _.first(places);
                const nextCenter = { lat: firstAddress.geometry.location.lat(), lng: firstAddress.geometry.location.lng() };
                //this.props.center = nextCenter;
                this.setState({ center: nextCenter, markers: nextMarkers });
                mapRef.fitBounds(bounds);
            },
        });
        await this.setZoneZoomLevel();
    }
    onZoonChanged() {
        var zoom = mapRef.getZoom();
        console.log('zoom', zoom);
        for (let key in nestMarkerRef) {
            const marker = nestMarkerRef[key];
            if (!marker) {
                continue;
            }
            let iconSize = 16;
            if (zoom >= 18) {
                iconSize = 94;
            } else if (zoom == 17) {
                iconSize = 94;
            } else if (zoom == 16) {
                iconSize = 80;
            } else if (zoom == 15) {
                iconSize = 64;
            } else if (zoom == 14) {
                iconSize = 48;
            } else if (zoom === 13) {
                iconSize = 32;
            }

            this.setState({ iconSize: iconSize })
        }
    }
    componentDidUpdate() {
        this.setZoneZoomLevel();
    }

    getPolygonBounds = (polygonRef) => {
        var paths = polygonRef.getPaths();
        const bounds = new google.maps.LatLngBounds();
        paths.forEach(function (path) {
            var ar = path.getArray();
            for (var i = 0, l = ar.length; i < l; i++) {
                bounds.extend(ar[i]);
            }
        });

        return bounds;
    }

    getRectangleBounds = (rectangleRef, mapRef2) => {
        const sw = rectangleRef.getBounds().getSouthWest();
        const ne = rectangleRef.getBounds().getNorthEast();
        const bounds = new google.maps.LatLngBounds(sw, ne);

        return bounds;
    }

    getCircleBounds = (circleRef) => {
        const bounds = circleRef.getBounds();

        return bounds;
    }
    componentWillReceiveProps = (props) => {
        if (props.selectedNestId !== this.state.selectedNestId) {
            const nestData = nestRef[props.selectedNestId];
            let updateData = {};
            updateData.selectedNestId = props.selectedNestId;
            if (nestData) {
                const bounds = this[`get${nestData.props.shapeType}Bounds`](nestData);
                mapRef.fitBounds(bounds);
                const boundCenter = bounds.getCenter();
                let center = {
                    lat: boundCenter.lat(),
                    lng: boundCenter.lng()
                };
                updateData.center = center;
            }
            this.setState(updateData);
        } else if (!this.state.selectedNestId && zoneRef && zoneRef.props) {
            const bounds = this[`get${zoneRef.props.shapeType}Bounds`](zoneRef);
            mapRef.fitBounds(bounds);
            const boundCenter = bounds.getCenter();
            let center = {
                lat: boundCenter.lat(),
                lng: boundCenter.lng()
            };
            this.setState({ center });
        }
    }
    setZoneZoomLevel = async (a) => {
        if (this.state && !this.state.selectedNestId) {
            if (!this.props.bounds || !this.props.bounds.north) {
                return;
            }
            let nestBounds = this.props.bounds;
            this.setBoundsOfShape(nestBounds);
        }
    }
    async setBoundsOfShape(nestBounds) {
        const sw = { lat: nestBounds.south, lng: nestBounds.west };
        const ne = { lat: nestBounds.north, lng: nestBounds.east };
        const bounds = new google.maps.LatLngBounds(sw, ne);
        let boundCenter = bounds.getCenter();
        let center = {
            lat: boundCenter.lat(),
            lng: boundCenter.lng()
        };
        if (this.state.center.lat !== center.lat) {
            mapRef.fitBounds(bounds);
            await this.setState({ center: center });
        }
    }
    updateZoom(zoom) {
        if (this.state.zoom !== zoom) {
            this.setState({ zoom: zoom });
        }
    }
    getPolygonData(polygonRef) {
        const shapeData = {};
        shapeData.coordinates = [];
        let coordinates = polygonRef.getPath().getArray()
        for (let coordinate of coordinates) {
            shapeData.coordinates.push([coordinate.lng(), coordinate.lat()]);
        }
        return shapeData;
    }
    getRectangleData(rectangleRef, shapeObj = {}) {
        const shapeData = shapeObj;
        shapeData.bounds = {
            north: rectangleRef.getBounds().getNorthEast().lat(),
            south: rectangleRef.getBounds().getSouthWest().lat(),
            east: rectangleRef.getBounds().getNorthEast().lng(),
            west: rectangleRef.getBounds().getSouthWest().lng()
        };
        shapeData.coordinates = [];
        shapeData.coordinates.push([shapeData.bounds.east, shapeData.bounds.north]);
        shapeData.coordinates.push([shapeData.bounds.west, shapeData.bounds.north]);
        shapeData.coordinates.push([shapeData.bounds.west, shapeData.bounds.south]);
        shapeData.coordinates.push([shapeData.bounds.east, shapeData.bounds.south]);

        return shapeData;
    }

    getCircleData(circleRef) {
        const shapeData = {};
        shapeData.coordinates = [circleRef.getCenter().lng(), circleRef.getCenter().lat()];
        shapeData.radius = circleRef.getRadius();

        return shapeData;
    }
    getBoundsAndCenterOfNest(nestRef, shapeType) {
        let NestBoundAndCenter = {};
        let boundsRef = this[`get${shapeType}Bounds`](nestRef);

        NestBoundAndCenter.bounds = {
            north: boundsRef.getNorthEast().lat(),
            south: boundsRef.getSouthWest().lat(),
            east: boundsRef.getNorthEast().lng(),
            west: boundsRef.getSouthWest().lng()
        };
        NestBoundAndCenter.center = {
            lat: boundsRef.getCenter().lat(),
            lng: boundsRef.getCenter().lng()
        };
        return NestBoundAndCenter;
    }
    handleOverlayComplete(e) {
        const shapeTypeCapitalized = e.type.charAt(0).toUpperCase() + e.type.slice(1);
        let shapeData = this[`get${shapeTypeCapitalized}Data`](e.overlay);
        const nestBoundAndCenter = this.getBoundsAndCenterOfNest(e.overlay, shapeTypeCapitalized);

        this.props.handleNestDrawComplete(shapeTypeCapitalized, shapeData, nestBoundAndCenter);
        const shape = e.overlay;
        shape.setMap(null)
    };

    getUpdatedPolygonData(polygonRef, zone) {
        const shapeData = zone;
        shapeData.coordinates = [];
        let coordinates = polygonRef.getPath().getArray()
        for (let coordinate of coordinates) {
            shapeData.coordinates.push({
                lat: coordinate.lat(),
                lng: coordinate.lng()
            });
        }

        return shapeData;
    }
    getUpdatedCircleData(circleRef, zone) {
        const shapeData = zone;
        shapeData.lat = circleRef.getCenter().lat();
        shapeData.lng = circleRef.getCenter().lng();
        shapeData.radius = circleRef.getRadius();

        return shapeData;
    }

    getUpdatedRectangleData(rectangleRef, zone) {
        return this.getRectangleData(rectangleRef, zone);
    }

    handleOverlayChange(editShapeObj) {
        const e = nestRef[editShapeObj.id];
        const shapeType = e.props.shapeType;
        let shapeData = this[`getUpdated${shapeType}Data`](e, editShapeObj);
        const nestBoundAndCenter = this.getBoundsAndCenterOfNest(e, shapeType);
        let nestBounds = nestBoundAndCenter.bounds;
        this.setBoundsOfShape(nestBounds);

        this.props.handleNestUpdateComplete(shapeType, shapeData, editShapeObj.id, nestBoundAndCenter);
    };

    render() {
        const { isDrwaingControl, restrictedBounds, editId, nestMarkers, zonePolygoneCoordinates, handleNestDrawComplete, selectedNestId, nestCoordinates, handleCircleComplete, circleArr, onCircleChanged, onCenterChanged, editCircleChange } = this.props;

        // Store Polygon path in state
        return (
            <DrawingExampleGoogleMap
                iconSize={this.state.iconSize}
                onZoonChanged={this.onZoonChanged.bind(this)}
                handleOverlayComplete={this.handleOverlayComplete.bind(this)}
                handleOverlayChange={this.handleOverlayChange.bind(this)}
                onSearchBoxMounted={this.state.onSearchBoxMounted}
                bounds={this.state.bounds}
                onPlacesChanged={this.state.onPlacesChanged}
                onBoundsChanged={this.state.onBoundsChanged}
                selectedNestId={selectedNestId}
                editId={editId}
                zoneArr={zonePolygoneCoordinates}
                nestCoordinates={nestCoordinates}
                nestMarkers={nestMarkers}
                center={this.state.center}
                isDrwaingControl={isDrwaingControl}
                handleNestDrawComplete={handleNestDrawComplete}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%`, position: 'relative' }} />}
                mapElement={<div style={{ height: `100%` }} />}
                markers={this.state.markers}
                zoom={this.state.zoom}
                updateZoom={this.updateZoom.bind(this)}
                restrictedBounds={restrictedBounds}
            />
        );
    }
}
