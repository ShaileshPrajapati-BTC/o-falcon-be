import React, { Component, useRef, useCallback } from "react";
import { GoogleMap, withGoogleMap, Polygon } from "react-google-maps";

const google = window.google;
// const polygonRef = useRef(null);
// const listenersRef = useRef([]);

// // Call setPath with new edited path
// const onEdit = useCallback(() => {
//     if (polygonRef.current) {
//         const nextPath = polygonRef.current
//             .getPath()
//             .getArray()
//             .map(latLng => {
//                 return { lat: latLng.lat(), lng: latLng.lng() };
//             });
//         console.log("nextPath", nextPath)
//         // setPath(nextPath);
//     }
// });
// // }, [setPath]);

// // Bind refs to current Polygon and listeners
// const onLoad = useCallback(
//     polygon => {
//         polygonRef.current = polygon;
//         const path = polygon.getPath();
//         listenersRef.current.push(
//             path.addListener("set_at", onEdit),
//             path.addListener("insert_at", onEdit),
//             path.addListener("remove_at", onEdit)
//         );
//     },
//     [onEdit]
// );
// const onUnmount = useCallback(() => {
//     listenersRef.current.forEach(lis => lis.remove());
//     polygonRef.current = null;
// }, []);

const DrawingExampleGoogleMap = withGoogleMap(props => {
    console.log("props.array", props.array)
   
    return (
        < GoogleMap
            defaultZoom={15}
            defaultCenter={new google.maps.LatLng(21.232437, 72.782860)}
        >
            {/* < Polygon
                paths={props.array}
                strokeOpacity={0.8}
                strokeWeight={3}
                fillColor='#FF0000'
                strokeColor='#FF0000'
                fillOpacity={0.2}
                editable={true}
                onMouseUp={(e) => props.handleEditable(e)}
                // onMouseUp={onEdit}  
                // onUnmount={onUnmount}
                // onLoad={onLoad}
            /> */}

< Polygon
                paths={props.array}
                strokeOpacity={0.8}
                strokeWeight={3}
                fillColor='#FF0000'
                strokeColor='#FF0000'
                fillOpacity={0.2}
                editable={true}
                onMouseUp={(e) => props.handleEditable(e)}
                ref={props.refname}
    //             onMouseDown={onChangeStart}
    //   onTouchStart={onChangeStart}
      onMouseUp={props.onChangeEnd}
    //   onTouchEnd={onChangeEnd}
            />


        </GoogleMap >
    )
}
);
export default class ListPolygon extends Component {

    state = {
        coordinates: [
            // { lat: 25.774, lng: -80.190 },
            // { lat: 18.466, lng: -66.118 },
            // { lat: 32.321, lng: -64.757 },
            // { lat: 25.774, lng: -80.190 }
        ],
        arr: []
    }
    onChangeEnd=(e)=>{
        console.log(e)
        alert("change end")
    }
    onChange = position => ({
        coordinate: {
          lat: this.__polygon.b[position].lat(),
          lng: this.__polygon.b[position].lng(),
        },
        id: this.props.id,
        position,
      });  
    
      onRemove = position => ({
        id: this.props.id,
        position,
      });
      __ref = ref => this.__polygon = ref && ref.getPath();    
    componentDidMount() {
debugger
        const addListener = (type, func) => google.maps.event.addListener(this.__polygon, type, func);
    
        // addListener('set_at', position => this.props.onChangeSet(this.onChange(position)));
        // addListener('insert_at', position => this.props.onChangeInsert(this.onChange(position)));
        // addListener('remove_at', position => this.props.onChangeRemove(this.onChange(position)));
     



        let coordinatesArr = [], tempArr = []
        tempArr = this.state.arr
        this.props.zoneArr.map(zone => {
            zone.map(arr => {
                let obj = { lat: arr[0], lng: arr[1] }
                coordinatesArr.push(obj)

            })
            tempArr.push(coordinatesArr)
            let defaultArr = [
                { lat: 21.238517209726744, lng: 72.77518016503814 },
                { lat: 21.23947721992062, lng: 72.78290492700103 },
                { lat: 21.236877177850211, lng: 72.78882724450591 },
            ]
            tempArr.push(defaultArr)

        })
        this.setState({
            polygonArr: tempArr
        })

    }

    showArrays=(e)=>{
        alert('ok')
        var vertices = this.getPath();
        console.log("vertices",vertices)
    }
    abc=(event,index,polygon)=>{
        let tempZoneArr=[...this.props.zoneArr]
        tempZoneArr.map(x=>{

        })

    //     var i  =0;
    //     this.polygonData.forEach(
    //         x =>{
    //             if(i==index){
    //             x.getPath().then((y: any[]) => {
    //                 console.log('-');
    //                 y.forEach(z => console.log(z.lat(), z.lng()));
    //             });
    //             }
    //                 i++;
    // }
    }
    onhandleEditable = (e) => {
        // this.abc(e)
        alert("Hello Done!!")
        var bermudaTriangle = new google.maps.Polygon({
            paths: this.props.zoneArr,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#FF0000',
            fillOpacity: 0.35
          });
          console.log("bermudaTriangle",bermudaTriangle)
          bermudaTriangle.addListener('click', this.showArrays);
          google.maps.event.addListener(this.getPolygonCoords, "insert_at", this.showArrays);
        // console.log("Polygon",Polygon)
        console.log("Polygon",this.props)
        // console.log("--a", a.props.paths)
        // console.log("--a", a.props.getPath())
        console.log("lat--", e.latLng.lat())
        console.log("lng--", e.latLng.lng())
        // google.maps.event.addListener(a.props.paths, "insert_at", this.getPolygonCoords);

    }
    getPolygonCoords = () => {
        alert("Hi")
    }
    render() {

        const center = {
            lat: 60,
            lng: 105,
        }
        return (
            <div>

                <DrawingExampleGoogleMap refname={this.__ref} onChangeEnd={this.onChangeEnd}
                    array={this.state.polygonArr} center={center} handleEditable={this.onhandleEditable.bind(this)}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `550px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />



            </div>
        );
    }
}
