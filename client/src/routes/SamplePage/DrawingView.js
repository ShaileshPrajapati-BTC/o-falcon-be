import React, { Component } from "react";
import { GoogleMap, withGoogleMap } from "react-google-maps";
import DrawingManager from "react-google-maps/lib/components/drawing/DrawingManager";
// import ListPolygon from './ListPolygon'
import List from './List'
import { Col, Row } from "antd";

const google = window.google;
const DrawingExampleGoogleMap = withGoogleMap(props => (
  <GoogleMap
    defaultZoom={15}
    defaultCenter={new google.maps.LatLng(21.232437, 72.782860)}
  >
    <DrawingManager
      onPolygonComplete={props.handleOverlayComplete}
      defaultDrawingMode={google.maps.drawing.OverlayType.POLYGON}
      defaultOptions={{
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            // google.maps.drawing.OverlayType.CIRCLE,
            google.maps.drawing.OverlayType.POLYGON,
            // google.maps.drawing.OverlayType.POLYLINE,
            // google.maps.drawing.OverlayType.RECTANGLE,
          ],
        },
        polygonOptions: {
          fillColor: '#ff0000',
          fillOpacity: 0.2,
          strokeWeight: 3,
          clickable: false,
          editable: false,
          zIndex: 1,
        },
      }}
    />
  </GoogleMap>
));
export default class DrawingView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isZone: false,
      geoDrawReq: {
        'type': 'Polygon',
        'coordinates': []
      }
    }
  }

  getPaths = (polygon) => {
    var coordinates = (polygon.getPath().getArray());
    return coordinates
  }
  onOverlayComplete = (event) => {
    let coordinatesArr = [];
    // arr = []
    coordinatesArr = [...this.state.geoDrawReq.coordinates]
    const arr = this.getPaths(event).map(path => {
      // arr.push([path.lat(), path.lng()])
      return [path.lat(), path.lng()]
    })
    coordinatesArr.push(arr)
    this.setState({
      // isZone: prevstate.true,
      geoDrawReq: {
        'type': 'Polygon',
        'coordinates': coordinatesArr,
      }
    })
    console.log("req", this.state.geoDrawReq)
    localStorage.removeItem('zone')
    localStorage.setItem('zone', JSON.stringify(this.state.geoDrawReq.coordinates))
  }

  handleList = (event) => {
    this.setState((prevState) => ({
      isZone: !prevState.isZone
    }));
    if (this.state.isZone)
      this.setState({
        geoDrawReq: {
          'type': 'Polygon',
          coordinates: []
        }
      })
  }

  render() {
    return (
      <div>

        {/* <Row>
          <Col span={12} style={{ border: '1px solid black' }}>
            <DrawingExampleGoogleMap
              handleOverlayComplete={this.onOverlayComplete}
              loadingElement={<div style={{ height: `100%` }} />}
              containerElement={<div style={{ height: `550px` }} />}
              mapElement={<div style={{ height: `100%` }} />}
            />
          </Col>
          <Col span={10} style={{ border: '1px solid black', marginLeft: '10px' }}>
           
            <button onClick={this.handleList} >List Polygon</button>
                        {this.state.isZone ?prevstate. <ListPolygon zoneArr={this.state.geoDrawReq.coordinates} /> : null}
          </Col>
        </Row> */}

        <button onClick={this.handleList} >
          {!this.state.isZone ? 'List' : 'Add/Update'}   Polygon</button>
        <Row>
          <Col span={20} style={{ border: '1px solid black' }}>

            {this.state.isZone ?
              <List />
              :
              <DrawingExampleGoogleMap
                handleOverlayComplete={this.onOverlayComplete}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `550px` }} />}
                mapElement={<div style={{ height: `100%` }} />}
              />
            }




          </Col>

        </Row>


      </div>
    );
  }
}
