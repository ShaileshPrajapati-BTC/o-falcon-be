/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
import {
    DEFAULT_API_ERROR,
    DEFAULT_VEHICLE,
    FILTER_BY_ACTIVE,
    FILTER_BY_VEHICLE_TYPE,
    FILTER_VISIBLE,
    USER_TYPES,
    PAGE_PERMISSION,
    FRANCHISEE_LABEL,
    DEALER_LABEL,
    FILTER_BY_FLEET_TYPE,
    SHAPE_TYPE,
    FRANCHISEE_VISIBLE,
    ZONE_LABEL,
    CLIENT_VISIBLE,
    PARTNER_WITH_CLIENT_FEATURE
} from "../../constants/Common";
import { Button, Row, message, Modal, Switch } from "antd";
import React, { Component } from "react";
import AddButton from "../../components/ESAddButton";
import MapPolygone from "../../components/MapPolygone";
import UtilService from "../../services/util";
import axios from "util/Api";
import { connect } from "react-redux";
import ZoneList from "./zoneList";
import ZoneUpsert from "./upsert";
import IntlMessages from "../../util/IntlMessages";

const _ = require("lodash");
const tmpId = "addNewZone";
class Zone extends Component {
    constructor(props) {
        super(props);
        let filter = {
            vehicleTypes: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type
        };
        if (!FRANCHISEE_VISIBLE) {
            filter.franchiseeId = null;
        }
        if (!CLIENT_VISIBLE) {
            filter.dealerId = null;
        }
        this.state = {
            addform: false,
            listView: true,
            isDrwaingControl: true,
            zoneList: [],
            userList: [],
            list: [],
            total: 0,
            userId: "",
            editkey: "",
            editData: {},
            loading: false,
            paginate: false,
            loginUser:
                this.props.auth && this.props.auth.authUser
                    ? this.props.auth.authUser
                    : null,
            filter: {
                page: 1,
                limit: 10,
                sort: "createdAt DESC",
                filter: filter
            },
            editId: "",
            selectedZoneId: "",
            zoneCoordinates: [],
            nestCoordinates: [],
            // drawing polygone coordinates
            geoDrawReq: {
                type: SHAPE_TYPE.POLYGON,
                coordinates: []
            },
            visibleAll: false,
            refresh: false,
            isDrwaingZoneIsCircle: false,
            zoneBoundAndCenter: {},
            showGeoFenceInApp: false
        };
        let redirectFilter = this.props.location && this.props.location.filter;
        this.vehicleTypes =
            redirectFilter &&
                redirectFilter.filter &&
                redirectFilter.filter.vehicleTypes
                ? _.find(FILTER_BY_VEHICLE_TYPE, f =>
                    _.isEqual(f.type, redirectFilter.filter.vehicleTypes)
                ).value
                : DEFAULT_VEHICLE;
        this.isActive =
            redirectFilter &&
                redirectFilter.filter &&
                redirectFilter.filter.isActive
                ? _.find(FILTER_BY_ACTIVE, f => {
                    return f.type === redirectFilter.filter.isActive;
                }).value
                : 1;
        this.franchiseeId = 0;
        this.dealerId = 0;
        this.fleetType = 1;
        this.isFranchiseeOrDealer =
            props.auth.authUser.type === USER_TYPES.FRANCHISEE ||
            props.auth.authUser.type === USER_TYPES.DEALER;
    }
    componentDidMount = async () => {
        if (this.props.auth.authUser.type === USER_TYPES.SUPER_ADMIN) {
            await this.getProjectConfig();
        }
        await this.getList();
        if (this.props.dealerId) {
            this.setState(state => {
                state.filter.filter.dealerId = this.props.dealerId;
            });
        }
        if (this.props.franchiseeId && FRANCHISEE_VISIBLE) {
            this.setState(state => {
                state.filter.filter.franchiseeId = this.props.franchiseeId;
            });
        }
        let filter = this.props.location && this.props.location.filter;
        if (filter) {
            this.setState({ filter: filter, paginate: false }, () => {
                this.fetch();
            });
        } else {
            this.fetch();
        }
    };
    getList = async () => {
        let data;
        if (this.isFranchiseeOrDealer) {
            data = await axios.post("admin/user/dealer-list", {
                filter: { isDeleted: false, isActive: true, addOwnUser: true }
            });
        } else {
            data = await axios.post("admin/user/franchisee-list", {
                filter: {
                    type: USER_TYPES.FRANCHISEE,
                    isDeleted: false,
                    isActive: true,
                    addOwnUser: true
                }
            });
        }
        if (data && data.code === "OK") {
            data = data.data;
            let { list } = data;
            if (
                list.length === 1 &&
                this.props.auth.authUser.type === USER_TYPES.DEALER
            ) {
                list = [
                    ...list,
                    {
                        id: this.props.auth.authUser.id,
                        name: this.props.auth.authUser.name
                    }
                ];
            }
            this.setState({
                list: list
            });
        }
    };
    getProjectConfig = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.get(`/admin/config/project`);
            if (response && response.code === "OK" && response.data) {
                this.setState({
                    showGeoFenceInApp: response.data.showGeoFenceInApp
                });
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false, isEdit: false });
            console.log("ERROR   ", error);
        }
    }
    getAdminUserList = async () => {
        const { authUser } = this.props.auth;
        if (authUser.type === USER_TYPES.ADMIN) {
            this.setState(state => {
                state.userList = [authUser];
                return state;
            });
        } else {
            try {
                let response = await axios.post("admin/user/paginate", {
                    filter: { type: USER_TYPES.ADMIN },
                    project: ["firstName", "lastName", "type", "isActive"]
                });
                if (response && response.code === "OK") {
                    if (
                        response.data &&
                        response.data.list &&
                        response.data.list.length
                    ) {
                        this.setState(state => {
                            return state;
                        });
                    }
                    this.setState({ userList: response.data.list });
                }
            } catch (error) {
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
                this.setState({ userList: [] });
            }
        }
    };
    fetch = async page => {
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        this.setState({ zoneList: [], loading: true });
        try {
            let response = await axios.post("/admin/zone/paginate", this.state.filter);
            if (response && response.code === "OK") {
                let zoneCoordinates = [];
                let nestCoordinates = [];
                if (response.data.zones && response.data.zones.length > 0) {
                    zoneCoordinates = this.getZoneListforMap(response.data.zones);
                }
                if (response.data.nestList && response.data.nestList.length > 0) {
                    nestCoordinates = this.getNestListforMap(response.data.nestList);
                }
                this.setState({
                    loading: false,
                    total: response.data.count,
                    zoneList: response.data.list,
                    zoneCoordinates: zoneCoordinates,
                    nestCoordinates: nestCoordinates,
                    refresh: false,
                    selectedZoneId: '',
                    editId: '',
                    paginate: true
                });
            } else {
                this.setState({ loading: false, zoneList: [], zoneCoordinates: [], refresh: false });
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false });
        }
    };
    changeUserType = val => {
        this.setState(state => {
            return state;
        });
        this.fetch();
    };
    onSearch = newState => {
        this.setState({ filter: newState, paginate: false },
            () => { this.fetch(); }
        );
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
        // this.fetch();

        self.setState(
            state => {
                state.filter.page = 1;
                state.paginate = false;
            },
            () => self.fetch()
        );
    };

    getZoneListforMap = zoneData => {
        let zoneCoordinates = [];
        for (const zone of zoneData) {
            if (
                zone &&
                zone.boundary &&
                zone.boundary.coordinates &&
                zone.boundary.coordinates.length > 0
            ) {
                let dataObj = this.getShapeData(
                    zone.boundary.shapeType,
                    zone.boundary
                );
                let zoneName = zone.name;
                // console.log('zone.franchiseeId', zone.franchiseeId);
                // if (zone.dealerId) {
                //     let index = _.findIndex(this.state.list, { id: zone.dealerId });
                //     zoneName += ` (${this.state.list[index].name})`;
                // } else if (zone.franchiseeId) {
                //     let index = _.findIndex(this.state.list, { id: zone.franchiseeId });
                //     zoneName += ` (${this.state.list[index].name})`;
                // }
                zoneCoordinates.push({
                    id: zone.id,
                    name: zoneName,
                    center: zone.center,
                    isActive: zone.isActive,
                    shapeType: zone.boundary.shapeType,
                    ...dataObj
                });
            }
        }

        return zoneCoordinates;
    };
    getNestListforMap = (nestData) => {
        let nestCoordinates = [];
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
            }
        }

        return nestCoordinates;
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
    };

    // setDefault = async option => {
    //     try {
    //         let data = await axios.put(
    //             `/admin/zone-and-fare-management/is-default/${option.id}`,
    //         );
    //         if (data.code === "OK") {
    //             message.success(`${data.message}`);
    //             this.fetch()
    //         } else {
    //             message.error(`${data.message}`);
    //         }
    //     } catch (error) {
    //         let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
    //         message.error(errorMsg);
    //     }
    // };
    viewZoneForm = () => {
        this.setState({ listView: false, addform: true, isDrwaingControl: false })
    };
    viewZoneList = () => {
        this.setState({
            isDrwaingControl: true,
            listView: true,
            addform: false,
            editData: {},
            geoDrawReq: {
                type: SHAPE_TYPE.POLYGON,
                coordinates: []
            },
            refresh: true,
            isDrwaingZoneIsCircle: false
        }, () => {
            return this.fetch();
        });
    }
    handleReset = () => {
        let id = this.state.selectedZoneId;
        let index = _.findIndex(this.state.zoneCoordinates, { id: id });
        let tempCoordArr = [...this.state.zoneCoordinates];
        tempCoordArr.splice(index, 1);
        this.setState({
            geoDrawReq: {
                type: SHAPE_TYPE.POLYGON,
                coordinates: []
            },
            isDrwaingControl: false,
            isDrwaingZoneIsCircle: false,
            zoneCoordinates: tempCoordArr,
            selectedZoneId: ''
        });
    }
    editZone = (zone, key) => {
        let zoneBoundAndCenter = {
            bounds: zone.bounds,
            center: zone.center
        }
        let dataToUpdate = {
            selectedZoneId: zone.id,
            editkey: key,
            editId: zone.id,
            listView: false,
            addform: true,
            isDrwaingControl: true,
            geoDrawReq: zone.boundary,
            visibleAll: true,
            isDrwaingZoneIsCircle: zone.boundary.shapeType === SHAPE_TYPE.CIRCLE,
            zoneBoundAndCenter: zoneBoundAndCenter
        }
        if (key === "edit") {
            dataToUpdate.visibleAll = false;
            dataToUpdate.editData = zone;
        }
        this.setState({ ...dataToUpdate });
    };
    handleDelete = (id) => {
        let self = this;
        Modal.confirm({
            title: `Are you sure to delete this ${ZONE_LABEL}!`,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk() {
                self.deleteZone(id);
            }
        });
    }
    deleteZone = async (id) => {
        this.setState({ loading: true })
        try {
            let data = await axios.delete(`/admin/zone/${id}`);
            if (data.code === "OK") {
                message.success(`${data.message}`);
                this.fetch();
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
    handleRadiusChange = (radius) => {
        let id = this.state.selectedZoneId;
        const geoDrawReq = this.state.geoDrawReq;
        geoDrawReq.radius = radius;
        let index = _.findIndex(this.state.zoneCoordinates, { id: id });
        let tempCoordArr = [...this.state.zoneCoordinates];
        if (index >= 0) {
            tempCoordArr[index].radius = radius;
        }
        this.setState({ zoneCoordinates: tempCoordArr, geoDrawReq: geoDrawReq });
    }
    handleZoneFormSubmit = async (values) => {
        let url;
        let method;
        let reqObj = _.clone(values);
        reqObj.bounds = this.state.zoneBoundAndCenter.bounds ? this.state.zoneBoundAndCenter.bounds : {};
        reqObj.center = this.state.zoneBoundAndCenter.center ? this.state.zoneBoundAndCenter.center : {};

        if (
            this.props.auth.authUser.type === USER_TYPES.FRANCHISEE &&
            reqObj.dealerId
        ) {
            reqObj.franchiseeId = this.props.auth.authUser.id;
        }
        if (this.props.auth.authUser.type === USER_TYPES.DEALER) {
            reqObj.franchiseeId = this.props.auth.authUser.franchiseeId;
        }
        if (!reqObj.vehicleTypes) {
            reqObj.vehicleTypes = [DEFAULT_VEHICLE];
        }
        let geoDrawReq = this.state.geoDrawReq;
        console.log('this.state.geoDrawReq', geoDrawReq);
        if (geoDrawReq && geoDrawReq.coordinates && geoDrawReq.coordinates.length > 0) {
            console.log('in if, add boundry');
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
            reqObj.boundary = geoDrawReq;
        }
        if (this.state.editId && !this.state.visibleAll) {
            url = `/admin/zone/${this.state.editId}`;
            method = `put`;
        } else {
            if (values.vehicleTypes.length === 0) {
                reqObj.vehicleTypes = [FILTER_BY_VEHICLE_TYPE[0].type];
            } else {
                reqObj.vehicleTypes = values.vehicleTypes;
            }
            if (!geoDrawReq || !geoDrawReq.coordinates || !geoDrawReq.coordinates.length > 0) {
                // Please draw.
                message.error(<><IntlMessages id="app.zone.pleaseDraw" /><span className="gx-text-lowercase"> {ZONE_LABEL} </span><IntlMessages id="app.zone.toAddNew" /><span className="gx-text-lowercase"> {ZONE_LABEL}</span>!</>);
                return false;
            }
            url = `/admin/zone/add`;
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
                    isDrwaingZoneIsCircle: false,
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

    viewZone = option => {
        this.setState({ selectedZoneId: option.id });
    };

    handleZoneDrawComplete = async (shapeType, shapeData, zoneBoundAndCenter) => {
        // get circle, rectagel, polygon data
        let zoneBoundaryObj = {
            type: SHAPE_TYPE.POLYGON,
            coordinates: []
        };
        if (shapeType === SHAPE_TYPE.CIRCLE) {
            zoneBoundaryObj.type = 'Point';
            zoneBoundaryObj.coordinates = shapeData.coordinates;
            zoneBoundaryObj.radius = shapeData.radius;
        } else if (shapeType === SHAPE_TYPE.RECTANGLE) {
            let firstCoordinate = _.first(shapeData.coordinates);
            shapeData.coordinates.push(firstCoordinate);
            zoneBoundaryObj.coordinates.push(shapeData.coordinates);
            zoneBoundaryObj.bounds = shapeData.bounds;
        } else if (shapeType === SHAPE_TYPE.POLYGON) {
            let firstCoordinate = _.first(shapeData.coordinates);
            shapeData.coordinates.push(firstCoordinate);
            zoneBoundaryObj.coordinates.push(shapeData.coordinates);
        }
        // make zoneData for adding zone
        let shapeDataObj = this.getShapeData(shapeType, zoneBoundaryObj);
        zoneBoundaryObj.shapeType = shapeType;
        // add into zoneData
        let zoneData = _.clone(this.state.zoneCoordinates);
        zoneData.push({
            id: tmpId,
            isActive: true,
            shapeType: shapeType,
            ...shapeDataObj
        });
        let updateObj = {
            zoneCoordinates: zoneData,
            isDrwaingControl: true,
            geoDrawReq: zoneBoundaryObj,
            isDrwaingZoneIsCircle: shapeType === SHAPE_TYPE.CIRCLE,
            zoneBoundAndCenter: zoneBoundAndCenter
        };
        await this.setState(updateObj);
        if (this.state.selectedZoneId !== tmpId) {
            this.setState({ selectedZoneId: tmpId });
        }
    };

    updatePolygonData = data => {
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
    };

    updateCircleData = data => {
        const shapeData = this.state.geoDrawReq;

        shapeData.coordinates = [data.lng, data.lat];
        shapeData.radius = data.radius;

        this.setState({ geoDrawReq: shapeData });
    };

    updateRectangleData = data => {
        const shapeData = this.state.geoDrawReq;
        shapeData.bounds = data.bounds;
        let firstCoordinate = _.first(data.coordinates);
        data.coordinates.push(firstCoordinate);
        shapeData.coordinates = [];
        shapeData.coordinates.push(data.coordinates);

        this.setState({ geoDrawReq: shapeData });
    };

    handleZoneUpdateComplete = (shapeType, shapeData, id) => {
        // findInexFromZone Array, update zone list
        let index = _.findIndex(this.state.zoneCoordinates, { id: id });
        let tempCoordArr = [...this.state.zoneCoordinates];
        if (index >= 0) {
            tempCoordArr[index] = shapeData;
        }
        this.setState({ zoneCoordinates: tempCoordArr });
        // update drawZone object
        this[`update${shapeType}Data`](shapeData);
    };
    onZoneVisibilityChange = async (e) => {
        this.setState({ showGeoFenceInApp: e })
        let obj = { showGeoFenceInApp: e }
        try {
            let data = await axios.put('/admin/config/project', obj);
            if (data.code === "OK") {
                message.success(`${data.message}`);
            } else {
                message.error(`${data.message}`);
            }
        } catch (error) {
            console.log("error", error);
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
        }
    }
    render() {
        const {
            loading,
            listView,
            addform,
            list,
            userList,
            editData,
            visibleAll,
            editkey,
            loginUser,
            isDrwaingZoneIsCircle
        } = this.state;
        const { authUser } = this.props.auth;
        let isFranchisee =
            loginUser && loginUser.type === USER_TYPES.FRANCHISEE;
        let isDealer = loginUser && loginUser.type === USER_TYPES.DEALER;
        const radius = this.state.geoDrawReq.radius;

        let FilterArray = [
            {
                title: <IntlMessages id="app.status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive",
                visible: true
            },
            {
                title: <IntlMessages id="app.vehicleType" />,
                list: FILTER_BY_VEHICLE_TYPE,
                defaultSelected: this.vehicleTypes,
                key: "vehicleTypes",
                visible: FILTER_VISIBLE
            },
            {
                title: FRANCHISEE_LABEL,
                list: this.props.franchisee.franchisee,
                defaultSelected: this.franchiseeId,
                key: "franchiseeId",
                visible:
                    this.props.franchisee.franchisee.length > 2 &&
                    !this.props.franchiseeId &&
                    !isFranchisee &&
                    !isDealer &&
                    FRANCHISEE_VISIBLE
            },
            {
                title: DEALER_LABEL,
                list: this.props.dealer.dealersList,
                defaultSelected: this.dealerId,
                key: "dealerId",
                visible:
                    this.props.dealer.dealersList.length > 2 &&
                    !this.props.dealerId &&
                    isFranchisee &&
                    CLIENT_VISIBLE
            },
            {
                title: <IntlMessages id="app.user.fleetTypeLabel" />,
                list: FILTER_BY_FLEET_TYPE,
                defaultSelected: this.fleetType,
                key: "fleetType",
                visible: (CLIENT_VISIBLE || PARTNER_WITH_CLIENT_FEATURE) && (isFranchisee || isDealer)
            }
        ];
        return (
            <div className="gx-main-content">
                <div className="gx-app-module" style={{ display: 'flex' }}>
                    <div
                        className="gx-module-sidenav gx-d-none gx-d-lg-flex"
                        style={{
                            height: this.props.isMultiTab
                                ? "calc(100vh - 136px)"
                                : "calc(100vh - 20px)"
                        }}
                    >
                        <div
                            className="gx-module-side"
                            style={{ minWidth: "430px" }}
                        >
                            <div
                                className="gx-module-side-header"
                                style={{ display: "inline", minHeight: "50px" }}
                            >
                                <Row
                                    type="flex"
                                    align="middle"
                                    justify="space-between"
                                >
                                    <h1 className="pageHeading">{ZONE_LABEL}</h1>
                                    <div className="SearchBarwithBtn">
                                        {authUser.type === USER_TYPES.SUPER_ADMIN &&
                                            <>
                                                <IntlMessages id="app.zone.showZoneInApp" /> &nbsp;
                                        	<Switch checked={this.state.showGeoFenceInApp} onChange={(checked) => { return this.onZoneVisibilityChange(checked) }} />
                                            </>}
                                        {listView && (
                                            <AddButton
                                                onClick={this.viewZoneForm}
                                                text={<IntlMessages id="app.add" />}
                                                pageId={PAGE_PERMISSION.ZONES}
                                            />
                                        )}
                                        {addform && (
                                            <div className="topbarCommonBtn">
                                                <Button
                                                    className="gx-mb-0"
                                                    onClick={this.viewZoneList}
                                                >
                                                    <IntlMessages id="app.list" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Row>
                            </div>
                            {listView && (
                                <ZoneList
                                    zoneList={this.state.zoneList}
                                    loading={loading}
                                    selectedZoneId={this.state.selectedZoneId}
                                    authUser={authUser}
                                    userList={userList}
                                    filter={this.state.filter}
                                    FilterArray={FilterArray}
                                    viewZone={this.viewZone.bind(this)}
                                    fetch={this.fetch}
                                    editZone={this.editZone}
                                    onSearch={this.onSearch}
                                    changeUserType={this.changeUserType}
                                    handleSelection={this.handleSelection}
                                    handleDelete={this.handleDelete}
                                    paginate={this.state.paginate}
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    page={this.state.filter.page}
                                />
                            )}
                            {addform && (
                                <ZoneUpsert
                                    isDrwaingZoneIsCircle={
                                        isDrwaingZoneIsCircle
                                    }
                                    radius={radius}
                                    editkey={editkey}
                                    userList={userList}
                                    list={list}
                                    dealerId={
                                        CLIENT_VISIBLE && authUser.type === USER_TYPES.DEALER
                                            ? authUser.id
                                            : this.props.dealerId
                                    }
                                    authUser={authUser}
                                    editData={editData}
                                    franchiseeId={FRANCHISEE_VISIBLE ? this.props.franchiseeId : null}
                                    visibleAll={visibleAll}
                                    clearFormFn={this.viewZoneList}
                                    handleRadiusChange={this.handleRadiusChange.bind(this)}
                                    handleReset={this.handleReset.bind(this)}
                                    handleSubmit={this.handleZoneFormSubmit} />
                            )}
                        </div>

                    </div>
                    <div className="gx-module-box">
                        <div className="gx-module-box-content">
                            <div style={{ height: '99%' }}>
                                {!this.state.refresh && <MapPolygone
                                    ZoneChange={this.ZoneChange}
                                    selectedZoneId={this.state.selectedZoneId}
                                    editId={this.state.editId}
                                    handleZoneDrawComplete={this.handleZoneDrawComplete.bind(this)}
                                    handleZoneUpdateComplete={this.handleZoneUpdateComplete.bind(this)}
                                    zoneCoordinates={this.state.zoneCoordinates}
                                    nestCoordinates={this.state.nestCoordinates}
                                    center={this.props.auth.mapCenter}
                                    isDrwaingControl={this.state.isDrwaingControl}
                                />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(Zone);
