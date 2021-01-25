import { GoogleMap, Polygon, withGoogleMap, Marker, Circle, Rectangle } from 'react-google-maps';
import React, { Component } from 'react';
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager';
import SearchBox from 'react-google-maps/lib/components/places/SearchBox';
import { SHAPE_TYPE, FILTER_BY_NEST_TYPE } from '../../constants/Common';

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
let zoneRef = {};

const DrawingExampleGoogleMap = withGoogleMap((props) => {
    return (
        <GoogleMap
            defaultZoom={props.zoom}
            zoom={props.zoom}
            ref={(ref) => mapRef = ref}
        // center={new google.maps.LatLng(props.center.lat, props.center.lng)}
        >
            {<SearchBox
                ref={props.onSearchBoxMounted}
                bounds={props.bounds}
                controlPosition={google.maps.ControlPosition.TOP_LEFT}
                onBoundsChanged={props.onBoundsChanged}
                onPlacesChanged={props.onPlacesChanged}>
                <input
                    type="text"
                    placeholder="Search Address"
                    style={INPUT_STYLE}
                />
            </SearchBox>
            }
            {props.markers.map((marker, index) =>
                <Marker key={index} position={marker.position} />
            )}
            {
                !props.isDrwaingControl && <DrawingManager
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
                            fillColor: '#aaaaaa',
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
                props.zoneCoordinates.map((path) => {
                    let fillColor;
                    if (props.editId === path.id || path.id === 'addNewZone') {
                        fillColor = '#aaaaaa'  // light greay
                    } else if (!path.isActive) {
                        fillColor = "#ff0000" // red
                    } else {
                        fillColor = "#1aff1a" // green
                    }
                    if (path.shapeType === SHAPE_TYPE.POLYGON) {
                        return <>
                            <Marker
                                position={path.center}
                                icon="None"
                                label={path.name}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Polygon
                                ref={(ref) => {
                                    zoneRef[path.id] = ref;
                                }}
                                key={`poly-${path.id}`}
                                paths={path.coordinates}
                                strokeOpacity={0.8}
                                strokeWeight={3}
                                editable={props.editId === path.id || path.id === 'addNewZone'}
                                onMouseUp={(e) => {
                                    (props.editId === path.id || path.id === 'addNewZone') &&
                                        props.handleOverlayChange(path)
                                }}
                                options={{
                                    strokeOpacity: 0.8,
                                    strokeColor: "#454545",
                                    fillColor: fillColor
                                }}
                                shapeType={path.shapeType}
                            />
                        </>;
                    } else if (path.shapeType === SHAPE_TYPE.RECTANGLE) {
                        return <>
                            <Marker
                                position={path.center}
                                icon="None"
                                label={path.name}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Rectangle
                                ref={(ref) => {
                                    zoneRef[path.id] = ref;
                                }}
                                key={`rect-${path.id}`}
                                bounds={path.bounds}
                                strokeOpacity={0.8}
                                strokeWeight={3}
                                editable={props.editId === path.id || path.id === 'addNewZone'}
                                onBoundsChanged={(e) => {
                                    (props.editId === path.id || path.id === 'addNewZone') &&
                                        props.handleOverlayChange(path)
                                }}
                                options={{
                                    strokeOpacity: 0.8,
                                    strokeColor: "#454545",
                                    fillColor: fillColor
                                }}
                                shapeType={path.shapeType}
                            />
                        </>;
                    } else if (path.shapeType === SHAPE_TYPE.CIRCLE) {
                        return <>
                            <Marker
                                position={path.center}
                                icon="None"
                                label={path.name}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Circle
                                ref={(ref) => {
                                    zoneRef[path.id] = ref;
                                }}
                                center={{ lat: parseFloat(path.lat), lng: parseFloat(path.lng) }}
                                key={`circle-${path.id}`}
                                editable={props.editId === path.id || path.id === 'addNewZone'}
                                radius={parseFloat(path.radius)}
                                onCenterChanged={() => props.handleOverlayChange(path)}
                                onRadiusChanged={() => props.handleOverlayChange(path)}
                                onMouseUp={() => { (props.editId === path.id || path.id === 'addNewZone') && props.handleOverlayChange(path) }}
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
                        </>
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
                            onCenterChanged={() => props.handleOverlayChange(path)}
                            onRadiusChanged={() => props.handleOverlayChange(path)}
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
});

export default class MapPolygone extends Component {
    async componentWillMount() {
        const refs = {};

        await this.setState({
            zoom: 15,
            bounds: null,
            center: this.props.center,
            selectedZoneId: this.props.selectedZoneId,
            markers: [],
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
            }
        });
        await this.setZoneZoomLevel();
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
        if (props.selectedZoneId !== this.state.selectedZoneId) {
            const zoneData = zoneRef[props.selectedZoneId];
            let updateData = {};
            updateData.selectedZoneId = props.selectedZoneId;
            if (zoneData) {
                const bounds = this[`get${zoneData.props.shapeType}Bounds`](zoneData);
                mapRef.fitBounds(bounds);
                const boundCenter = bounds.getCenter();
                let center = {
                    lat: boundCenter.lat(),
                    lng: boundCenter.lng()
                };
                updateData.center = center;
            }
            this.setState(updateData);
        }
    }

    setZoneZoomLevel = async (a) => {
        if (this.state && !this.state.selectedZoneId) {
            let slat;
            let slng;
            let nlat;
            let nlng;

            if (!zoneRef || Object.keys(zoneRef).length === 0) {
                const sw = { lat: this.state.center.lat + 0.02, lng: this.state.center.lng - 0.02 };
                const ne = { lat: this.state.center.lat - 0.02, lng: this.state.center.lng + 0.02 };
                const bounds = new google.maps.LatLngBounds(sw, ne);
                mapRef.fitBounds(bounds);
            }
            for (const key in zoneRef) {
                const zone = zoneRef[key];
                if (!zone || !zone.props) {
                    continue;
                }
                const tmpBounds = this[`get${zone.props.shapeType}Bounds`](zone);
                if (!slat) {
                    slat = tmpBounds.getSouthWest().lat()
                    slng = tmpBounds.getSouthWest().lng();
                    nlat = tmpBounds.getNorthEast().lat();
                    nlng = tmpBounds.getNorthEast().lng();
                }
                slat = ((slat < tmpBounds.getSouthWest().lat()) ? slat : tmpBounds.getSouthWest().lat());
                nlat = ((nlat > tmpBounds.getNorthEast().lat()) ? nlat : tmpBounds.getNorthEast().lat());
                slng = ((slng < tmpBounds.getSouthWest().lng()) ? slng : tmpBounds.getSouthWest().lng());
                nlng = ((nlat > tmpBounds.getNorthEast().lng()) ? nlat : tmpBounds.getNorthEast().lng());
            }
            if (!slat) {
                return;
            }
            let bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(slat, slng));
            bounds.extend(new google.maps.LatLng(nlat, nlng));
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
    }
    async setBoundsOfShape(zoneBounds) {
        const sw = { lat: zoneBounds.south, lng: zoneBounds.west };
        const ne = { lat: zoneBounds.north, lng: zoneBounds.east };
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
        console.log('handleZoneDrawComplete rectabngle', shapeData);

        return shapeData;
    }

    getCircleData(circleRef) {
        const shapeData = {};
        shapeData.coordinates = [circleRef.getCenter().lng(), circleRef.getCenter().lat()];
        shapeData.radius = circleRef.getRadius();

        return shapeData;
    }
    getBoundsAndCenterOfZone(zoneRef, shapeType) {
        let ZoneBoundAndCenter = {};
        let boundsRef = this[`get${shapeType}Bounds`](zoneRef);

        ZoneBoundAndCenter.bounds = {
            north: boundsRef.getNorthEast().lat(),
            south: boundsRef.getSouthWest().lat(),
            east: boundsRef.getNorthEast().lng(),
            west: boundsRef.getSouthWest().lng()
        };
        ZoneBoundAndCenter.center = {
            lat: boundsRef.getCenter().lat(),
            lng: boundsRef.getCenter().lng()
        };
        return ZoneBoundAndCenter;
    }

    handleOverlayComplete(e) {
        console.log('handleZoneDrawComplete e');
        console.log(e);
        console.log('handleZoneDrawComplete e');
        const shapeTypeCapitalized = e.type.charAt(0).toUpperCase() + e.type.slice(1);
        let shapeData = this[`get${shapeTypeCapitalized}Data`](e.overlay);
        const zoneBoundAndCenter = this.getBoundsAndCenterOfZone(e.overlay, shapeTypeCapitalized);

        this.props.handleZoneDrawComplete(shapeTypeCapitalized, shapeData, zoneBoundAndCenter);
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
        const e = zoneRef[editShapeObj.id];
        const shapeType = e.props.shapeType;
        let shapeData = this[`getUpdated${shapeType}Data`](e, editShapeObj);
        const zoneBoundAndCenter = this.getBoundsAndCenterOfZone(e, shapeType);
        let zoneBounds = zoneBoundAndCenter.bounds;
        this.setBoundsOfShape(zoneBounds);

        this.props.handleZoneUpdateComplete(shapeType, shapeData, editShapeObj.id, zoneBoundAndCenter);
    };

    render() {
        const { handleZoneDrawComplete,
            ZoneChange, editId, isDrwaingControl, zoneCoordinates, nestCoordinates, selectedZoneId
        } = this.props;
        // Store Polygon path in state

        return (
            <DrawingExampleGoogleMap
                handleOverlayComplete={this.handleOverlayComplete.bind(this)}
                handleOverlayChange={this.handleOverlayChange.bind(this)}
                onSearchBoxMounted={this.state.onSearchBoxMounted}
                bounds={this.state.bounds}
                onPlacesChanged={this.state.onPlacesChanged}
                onBoundsChanged={this.state.onBoundsChanged}
                selectedZoneId={selectedZoneId}
                editId={editId}
                zoneCoordinates={zoneCoordinates}
                nestCoordinates={nestCoordinates}
                center={this.state.center}
                isDrwaingControl={isDrwaingControl}
                handleZoneDrawComplete={handleZoneDrawComplete}
                ZoneChange={ZoneChange}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%`, position: 'relative' }} />}
                mapElement={<div style={{ height: `100%` }} />}
                markers={this.state.markers}
                zoom={this.state.zoom}
                updateZoom={this.updateZoom.bind(this)}
            />
        );
    }
}
