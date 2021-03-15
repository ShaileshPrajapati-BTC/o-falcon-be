/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
import {
    DEFAULT_API_ERROR,
    FILTER_BY_ACTIVE,
    PAGE_PERMISSION,
    FILTER_BY_NEST_TYPE,
    NEST_ROUTE,
    NEST_LABEL,
    SHAPE_TYPE,
    ZONE_LABEL
} from "../../constants/Common";
import {
    Button, Row, message, Icon, Modal
} from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import AddButton from "../../components/ESAddButton";
import UtilService from "../../services/util";
import axios from "util/Api";
import NestList from './nestList';
import NestUpsert from './upsert';
import DrawNest from './drawNest';
import AddVehicle from './addVehicle';
import { Link } from "react-router-dom";

const _ = require("lodash");
const tmpId = 'addNewNest';
let mapcenter = {};
class Nest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            zoneId: props.match.params.id,
            addform: false,
            listView: true,
            isDrwaingControl: true,
            nestList: [],
            userList: [],
            total: 0,
            userId: "",
            editData: {},
            loading: false,
            paginate: false,
            filter: {
                page: 1,
                limit: 10,
                sort: "createdAt DESC",
                filter: { zoneId: props.match.params.id }
            },
            editId: '',
            selectedNestId: "",
            zoneCoordinates: [],
            nestCoordinates: [],
            nestMarkers: [],
            restrictedBounds: {},
            geoDrawReq: {
                type: SHAPE_TYPE.POLYGON,
                coordinates: [],
                radius: 0
            },
            visibleAll: false,
            refresh: false,
            isDrwaingNestIsCircle: false,
            addVehicleModal: false,
            center: this.props.auth.mapCenter,
            nestBoundAndCenter: {},
            bounds: {},
            nestIdToAddVehicle: {}
        };
        this.isActive = 1;
        this.type = 1;
    }
    componentDidMount = async () => {
        await this.getZoneData(this.state.zoneId);
        await this.fetch();
    }
    getZoneData = async (id) => {
        this.setState({ loading: true });
        try {
            let response = await axios.get(`/admin/zone/${id}`);
            if (response && response.code === "OK") {
                let zoneCoordinates = [];
                if (response.data && response.data.boundary.coordinates) {
                    const shapeType = response.data.boundary.shapeType;
                    let zoneCenter = {};
                    if (shapeType === SHAPE_TYPE.CIRCLE) {
                        const shapeData = {};
                        shapeData.lat = response.data.boundary.coordinates[1];
                        shapeData.lng = response.data.boundary.coordinates[0];
                        shapeData.radius = response.data.boundary.radius;
                        shapeData.shapeType = response.data.boundary.shapeType;
                        zoneCoordinates.push(shapeData);
                        zoneCenter = { lat: shapeData.lat, lng: shapeData.lng };
                    } else {
                        let coordinates = _.first(
                            response.data.boundary.coordinates
                        );
                        zoneCenter = { lat: coordinates[0][1], lng: coordinates[0][0] };
                        let coordinatesArr = [];
                        coordinates.splice(coordinates.length - 1, 1);
                        _.each(coordinates, latLng => {
                            let obj = { lat: latLng[1], lng: latLng[0] };
                            coordinatesArr.push(obj);
                        });
                        zoneCoordinates.push({
                            id: response.data.id,
                            coordinates: coordinatesArr,
                            isActive: response.data.isActive,
                            shapeType: response.data.boundary.shapeType,
                            bounds: response.data.bounds
                        });
                    }
                    let center = response.data.center ? response.data.center : zoneCenter;
                    mapcenter = center;
                    let restrictedBounds = {
                        east: response.data.bounds.east + 0.050,
                        north: response.data.bounds.north + 0.050,
                        south: response.data.bounds.south - 0.050,
                        west: response.data.bounds.west - 0.050
                    }
                    this.setState({ center: center, restrictedBounds: restrictedBounds })
                }
                this.setState({
                    zoneCoordinates: zoneCoordinates,
                    loading: false
                });
            } else {
                this.setState({ zoneCoordinates: [], loading: false });
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ zoneCoordinates: [], loading: false });
        }
    }
    /* listing start */
    fetch = async (page) => {
        if (page) {
            this.setState(state => {
                state.filter.page = page;
                return state;
            });
        }
        this.setState({ loading: true, nestList: [] });
        try {
            let response = await axios.post("/admin/nest/paginate", this.state.filter);
            if (response && response.code === "OK") {
                let nestCoordinates = [];
                let bounds = {};
                let nestMarkers = [];
                if (response.data.list && response.data.list.length) {
                    let result = this.getNestListforMap(response.data.nestList);
                    nestCoordinates = result.nestCoordinates;
                    bounds = result.bounds;
                    nestMarkers = result.nestMarkers;
                }
                this.setState({
                    loading: false,
                    total: response.data.count,
                    nestList: response.data.list,
                    nestCoordinates: nestCoordinates,
                    nestMarkers: nestMarkers,
                    bounds: bounds,
                    refresh: false,
                    selectedNestId: '',
                    editId: '',
                    paginate: true
                });
            } else {
                this.setState({
                    loading: false,
                    nestList: [],
                    nestCoordinates: [],
                    nestMarkers: [],
                    bounds: {},
                    refresh: false,
                });
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false });
        }
    };
    getNestListforMap = (nestData) => {
        let nestCoordinates = [];
        let nestMarkers = [];
        let bounds = {};
        for (const nest of nestData) {
            if (nest && nest.currentLocation && nest.currentLocation.coordinates && nest.currentLocation.coordinates.length > 0) {
                let dataObj = this.getShapeData(nest.currentLocation.shapeType, nest.currentLocation);
                nestCoordinates.push({
                    id: nest.id,
                    isActive: nest.isActive,
                    shapeType: nest.currentLocation.shapeType,
                    nestType: nest.type,
                    ...dataObj
                });
                if (!nest.center || !nest.center.lat || !nest.center.lng) {
                    continue;
                }
                nestMarkers.push({
                    id: nest.id,
                    lat: nest.center.lat,
                    lng: nest.center.lng,
                    nestType: nest.type
                })
                if (!nest.bounds) {
                    continue;
                }
                if (!bounds || !bounds.north) {
                    bounds = nest.bounds ? nest.bounds : {};
                } else {
                    bounds.north = ((bounds.north > nest.bounds.north) ? bounds.north : nest.bounds.north);
                    bounds.south = ((bounds.south < nest.bounds.south) ? bounds.south : nest.bounds.south);
                    bounds.west = ((bounds.west < nest.bounds.west) ? bounds.west : nest.bounds.west);
                    bounds.east = ((bounds.east > nest.bounds.east) ? bounds.east : nest.bounds.east);
                }
            }
        }
        let returnObj = { nestCoordinates: nestCoordinates, bounds: bounds, nestMarkers: nestMarkers }
        return returnObj;
    }
    getShapeData = (shapeType, data) => {
        let shapeData = { ...data };
        if (shapeType === SHAPE_TYPE.CIRCLE) {
            shapeData.lat = data.coordinates[1];
            shapeData.lng = data.coordinates[0];
            shapeData.radius = data.radius;
        } else {
            let coordinatesArr = [];
            let coordinates = _.first(data.coordinates);
            if (data.shapeType) {
                coordinates.splice(coordinates.length - 1, 1);
            }
            for (const latLng of coordinates) {
                let obj = {
                    lat: latLng[1],
                    lng: latLng[0]
                };
                coordinatesArr.push(obj);
            }
            shapeData.coordinates = coordinatesArr;
            if (shapeType === SHAPE_TYPE.RECTANGLE) {
                shapeData.bounds = data.bounds;
            }
        }
        shapeData.shapeType = shapeType;

        return shapeData;
    }
    onSearch = newState => {
        this.setState({
            filter: newState,
            paginate: false
        }, () => {
            this.fetch();
        });
    };
    handleSelection = (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(state => {
            if (data !== "error") {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });
        self.setState(
            state => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => self.fetch()
        );
    };
    upsertNestForm = () => {
        this.setState({ listView: false, addform: true, isDrwaingControl: false })
    };
    viewNestList = () => {
        this.setState({
            isDrwaingControl: true,
            listView: true,
            addform: false,
            geoDrawReq: {
                type: SHAPE_TYPE.POLYGON,
                coordinates: []
            },
            refresh: true,
            isDrwaingNestIsCircle: false,
            center: mapcenter
        }, () => {
            return this.fetch();
        });
    }
    handleReset = () => {
        let id = this.state.selectedNestId;
        let index = _.findIndex(this.state.nestCoordinates, { id: id });
        let tempCoordArr = [...this.state.nestCoordinates];
        tempCoordArr.splice(index, 1);
        this.setState({
            geoDrawReq: {
                type: SHAPE_TYPE.POLYGON,
                coordinates: []
            },
            isDrwaingControl: false,
            isDrwaingNestIsCircle: false,
            nestCoordinates: tempCoordArr,
            selectedNestId: ''
        });
    }
    editNest = (record) => {
        let dataToUpdate = {
            selectedNestId: record.id,
            editId: record.id,
            listView: false,
            addform: true,
            isDrwaingControl: true,
            geoDrawReq: record.currentLocation,
            editData: record,
            isDrwaingNestIsCircle: record.currentLocation.shapeType === SHAPE_TYPE.CIRCLE
        }
        this.setState({ ...dataToUpdate });
        // this.setState({ selectedNestId: record.id, nestViewId: '', listView: false, addform: true, isDrwaingControl: false })
    }

    deleteNest = async (id) => {
        this.setState({ loading: true })
        try {
            let data = await axios.delete(`admin/nest/${id}`);
            if (data.code === "OK") {
                message.success(`${data.message}`);
                this.setState({
                    refresh: true,
                    paginate: false
                }, () => { return this.fetch(); })

            } else {
                message.error(`${data.message}`);
            }
            this.setState({ loading: false });
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false });
        }
    }
    addVehicle = (id, availableSlot) => {
        this.setState({ addVehicleModal: true, nestIdToAddVehicle: { id: id, availableSlot: availableSlot } })
    }
    submitVehicleModal = () => {
        this.cancelVehicleModal();
        this.fetch();
    }
    cancelVehicleModal = () => {
        this.setState({ addVehicleModal: false, nestIdToAddVehicle: {} })
    }
    handleRadiusChange = (radius) => {
        let id = this.state.selectedNestId;
        const geoDrawReq = this.state.geoDrawReq;
        geoDrawReq.radius = radius;
        let index = _.findIndex(this.state.nestCoordinates, { id: id });
        let tempCoordArr = [...this.state.nestCoordinates];
        if (index >= 0) {
            tempCoordArr[index].radius = radius;
        }
        this.setState({ nestCoordinates: tempCoordArr, geoDrawReq: geoDrawReq });
    }
    handleNestFormSubmit = async (values) => {
        let self = this;
        let url, method;
        let reqObj = _.clone(values);

        reqObj.bounds = this.state.nestBoundAndCenter.bounds ? this.state.nestBoundAndCenter.bounds : {};
        reqObj.center = this.state.nestBoundAndCenter.center ? this.state.nestBoundAndCenter.center : {};

        let geoDrawReq = this.state.geoDrawReq;
        if (geoDrawReq && geoDrawReq.coordinates && geoDrawReq.coordinates.length > 0) {
            if (geoDrawReq.shapeType !== SHAPE_TYPE.CIRCLE) {
                let array = _.clone(geoDrawReq.coordinates[0]);
                let firstCoordinate = _.first(array);
                let lastCoordinate = _.last(array);
                if (firstCoordinate !== lastCoordinate) {
                    console.log('in first not = last')
                    let coordinateArr = [];
                    array.push(firstCoordinate);
                    coordinateArr.push(array);
                    geoDrawReq.coordinates = coordinateArr;
                }
            }
            reqObj.currentLocation = geoDrawReq;
        }
        if (this.state.editId) {
            url = `/admin/nest/${this.state.editId}`;
            method = `put`;
        } else {
            if (!geoDrawReq || !geoDrawReq.coordinates || !geoDrawReq.coordinates.length > 0) {
                // Please draw.
                message.error(`Please draw ${NEST_ROUTE} to add new ${NEST_ROUTE}!`);
                return false;
            }
            reqObj.zoneId = this.state.zoneId;
            url = `/admin/nest/add`;
            method = `post`;
        }
        try {
            let data = await axios[method](url, reqObj);
            if (data.code === "OK") {
                message.success(`${data.message}`);
                this.setState({
                    isDrwaingControl: true,
                    geoDrawReq: {
                        type: SHAPE_TYPE.POLYGON,
                        coordinates: [],
                        radius: 0
                    },
                    isDrwaingNestIsCircle: false,
                    refresh: true,
                    listView: true,
                    addform: false
                }, () => this.fetch());
            } else {
                message.error(`${data.message}`);
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    };

    viewNest = option => {
        this.setState({ selectedNestId: option.id });
    };
    handleNestDrawComplete = async (shapeType, shapeData, nestBoundAndCenter) => {
        // get circle, rectagel, polygon data
        let nestBoundaryObj = {
            type: SHAPE_TYPE.POLYGON,
            coordinates: []
        };
        if (shapeType === SHAPE_TYPE.CIRCLE) {
            nestBoundaryObj.type = 'Point';
            nestBoundaryObj.coordinates = shapeData.coordinates;
            nestBoundaryObj.radius = shapeData.radius;
        } else if (shapeType === SHAPE_TYPE.RECTANGLE) {
            let firstCoordinate = _.first(shapeData.coordinates);
            shapeData.coordinates.push(firstCoordinate);
            nestBoundaryObj.coordinates.push(shapeData.coordinates);
            nestBoundaryObj.bounds = shapeData.bounds;
        } else if (shapeType === SHAPE_TYPE.POLYGON) {
            let firstCoordinate = _.first(shapeData.coordinates);
            shapeData.coordinates.push(firstCoordinate);
            nestBoundaryObj.coordinates.push(shapeData.coordinates);
        }
        // make nestData for adding nest
        let shapeDataObj = this.getShapeData(shapeType, nestBoundaryObj);
        nestBoundaryObj.shapeType = shapeType;
        // add into nestData
        let nestData = _.clone(this.state.nestCoordinates);
        nestData.push({
            id: tmpId,
            isActive: true,
            shapeType: shapeType,
            ...shapeDataObj
        });
        let updateObj = {
            nestCoordinates: nestData,
            isDrwaingControl: true,
            geoDrawReq: nestBoundaryObj,
            isDrwaingNestIsCircle: shapeType === SHAPE_TYPE.CIRCLE,
            nestBoundAndCenter: nestBoundAndCenter
        };
        await this.setState(updateObj);
        if (this.state.selectedNestId !== tmpId) {
            this.setState({ selectedNestId: tmpId });
        }
    };

    updatePolygonData = (data) => {
        let newCoordinates = [];
        let coordinateArr = [];
        for (let coordinate of data.coordinates) {
            newCoordinates.push([coordinate.lng, coordinate.lat]);
        }

        // check if last coordinate is same as  first if not
        // then check does it exist? if yes then splice from that and add in last
        let firstCoordinate = _.first(newCoordinates);
        // find if matching index of  first coordinates
        let existsIndexs = _.pickBy(newCoordinates, coordinate => {
            return _.isEqual(firstCoordinate, coordinate);
        });
        existsIndexs = _.keys(existsIndexs);
        if (existsIndexs && existsIndexs.length) {
            _.each(existsIndexs, index => {
                if (index && Number(index) !== 0) {
                    newCoordinates.splice(index, 1);
                }
            });
        }
        newCoordinates.push(firstCoordinate);
        coordinateArr.push(newCoordinates);
        const shapeData = this.state.geoDrawReq;
        shapeData.coordinates = coordinateArr;
        this.setState({ geoDrawReq: shapeData });
    }
    updateCircleData = (data) => {
        const shapeData = this.state.geoDrawReq;

        shapeData.coordinates = [
            data.lng,
            data.lat
        ];
        shapeData.radius = data.radius;

        this.setState({ geoDrawReq: shapeData });
    }
    updateRectangleData = (data) => {
        const shapeData = this.state.geoDrawReq;
        shapeData.bounds = data.bounds;
        let firstCoordinate = _.first(data.coordinates);
        data.coordinates.push(firstCoordinate);
        shapeData.coordinates = [];
        shapeData.coordinates.push(data.coordinates);

        this.setState({ geoDrawReq: shapeData });
    }

    handleNestUpdateComplete = (shapeType, shapeData, id, nestBoundAndCenter) => {
        let index = _.findIndex(this.state.nestCoordinates, { id: id });
        let tempCoordArr = [...this.state.nestCoordinates];
        if (index >= 0) {
            tempCoordArr[index] = shapeData;
        }
        this.setState({ nestCoordinates: tempCoordArr, selectedNestId: id, nestBoundAndCenter: nestBoundAndCenter });
        this[`update${shapeType}Data`](shapeData);
    };

    render() {
        const { loading, listView, addform, selectedNestId, refresh, center } = this.state;
        const radius = this.state.geoDrawReq.radius;

        let FilterArray = [
            {
                title: "Status",
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive",
                visible: true
            },
            {
                title: "Type",
                list: FILTER_BY_NEST_TYPE,
                defaultSelected: this.type,
                key: "type",
                visible: true
            },
        ];

        return (
            <div className="gx-main-content">
                <div className="gx-app-module">
                    <div className="gx-module-sidenav gx-d-none gx-d-lg-flex">
                        <div className="gx-module-side" style={{ minWidth: "430px" }}>
                            <div className="gx-module-side-header" style={{ display: 'inline', minHeight: '50px' }}>
                                <Row type="flex" align="middle" justify="space-between">
                                    <h1 className="pageHeading">{NEST_LABEL}</h1>
                                    <div className="SearchBarwithBtn">
                                        <Link
                                            to={{
                                                pathname: '/e-scooter/geo-location',
                                                zoneFilter: this.props.location.filter
                                            }}
                                        >
                                            <Button className="gx-mb-0"><Icon type="rollback" />{ZONE_LABEL}</Button>
                                        </Link>
                                        {listView && <AddButton
                                            onClick={this.upsertNestForm}
                                            text="Add"
                                            pageId={PAGE_PERMISSION.NEST}
                                        />}
                                        {addform && <div className="topbarCommonBtn">
                                            <Button className="gx-mb-0" onClick={this.viewNestList}>List</Button>
                                        </div>}
                                    </div>
                                </Row>
                            </div>

                            {/* <div className="gx-module-side-content"> */}
                            {listView &&
                                <NestList
                                    nestList={this.state.nestList}
                                    loading={loading}
                                    selectedNestId={this.state.selectedNestId}
                                    filter={this.state.filter}
                                    FilterArray={FilterArray}
                                    viewNest={this.viewNest.bind(this)}
                                    fetch={this.fetch}
                                    editNest={this.editNest}
                                    onSearch={this.onSearch}
                                    handleSelection={this.handleSelection}
                                    deleteNest={this.deleteNest}
                                    paginate={this.state.paginate}
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    page={this.state.filter.page}
                                    addVehicle={this.addVehicle}
                                // nestViewId={nestViewId}
                                // getNestCenter={this.getNestCenter}
                                />}
                            {addform &&
                                <NestUpsert
                                    isDrwaingNestIsCircle={this.state.isDrwaingNestIsCircle}
                                    radius={radius}
                                    editData={this.state.editData}
                                    editId={this.state.editId}
                                    clearFormFn={this.viewNestList}
                                    handleRadiusChange={this.handleRadiusChange.bind(this)}
                                    handleReset={this.handleReset.bind(this)}
                                    selectedNestId={this.state.selectedNestId}
                                    handleSubmit={this.handleNestFormSubmit} />}
                            {/* </div> */}
                        </div>

                    </div>
                    <div className="gx-module-box">
                        <div className="gx-module-box-content">
                            <div style={{ height: '100%' }}>
                                {!this.state.refresh && <DrawNest
                                    selectedNestId={this.state.selectedNestId}
                                    editId={this.state.editId}
                                    zonePolygoneCoordinates={this.state.zoneCoordinates}
                                    handleNestDrawComplete={this.handleNestDrawComplete.bind(this)}
                                    handleNestUpdateComplete={this.handleNestUpdateComplete.bind(this)}
                                    nestCoordinates={this.state.nestCoordinates}
                                    nestMarkers={this.state.nestMarkers}
                                    center={this.state.center}
                                    isDrwaingControl={this.state.isDrwaingControl}
                                    restrictedBounds={this.state.restrictedBounds}
                                    bounds={this.state.bounds}
                                // handleCircleComplete={this.handleCircleComplete}
                                // circleArr={this.state.circleArr}
                                // onCircleChanged={this.onCircleChanged.bind(this)}
                                />}
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.addVehicleModal &&
                    <AddVehicle
                        onSubmit={this.submitVehicleModal}
                        onCancel={this.cancelVehicleModal}
                        authUser={this.props.auth.authUser}
                        nestId={this.state.nestIdToAddVehicle.id}
                        availableSlot={this.state.nestIdToAddVehicle.availableSlot}
                    />
                }
            </div>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Nest);
