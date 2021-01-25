import { Button, Col, DatePicker, Form, Row, Switch, message, TimePicker } from "antd";
import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "util/Api";
import moment from 'moment';
import IntlMessages from "../../util/IntlMessages";
import UtilService from '../../services/util';
import { func } from "prop-types";
const _ = require("lodash");
const format = 'HH:mm';


let error = false;
class OperationalHours extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: {},
            operationalHoursList: [],
            initialHoursList: []
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        this.setState({ loading: true });

        try {
            let response = await axios.post(
                "/admin/operational-hours/get-all-active-operational-hours",
                this.state.filter
            );
            if (response && response.code === "OK") {
                response.data = _.sortBy(response.data,'day');
                _.each(response.data, function (data) {
                    data.isEdit = true;
                })

                this.setState({
                    total: response.data.length,
                    loading: false,
                    operationalHoursList: response.data,
                    initialHoursList: response.data
                });
            } else {
                this.setState({
                    total: 0,
                    loading: false,
                    operationalHoursList: []
                });
            }

        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };

    handleEditClick = async (e, index) => {
        let operationHours = _.clone(this.state.operationalHoursList);
        let data = _.clone(operationHours[index]);
        data.isEdit = !data.isEdit;
        operationHours[index] = data;
        this.setState({ operationalHoursList: operationHours });
    }

    handleDateChange = async (time, key, index) => {
        let operationHours = _.clone(this.state.operationalHoursList);
        let data = _.clone(operationHours[index]);
        data[key] = UtilService.displayTime(time, true);
        operationHours[index] = data;
        this.setState({ operationalHoursList: operationHours });
    }

    handleChange = async (e, key, index) => {
        let operationHours = _.clone(this.state.operationalHoursList);
        let data = _.clone(operationHours[index]);
        data[key] = e;
        operationHours[index] = data;
        this.setState({ operationalHoursList: operationHours });
    }

    handleSaveEvent = async (e, index, editData) => {
        try {

            // check data change or not 
            let oldData = _.clone(this.state.initialHoursList[index]);

            if (oldData && (oldData.startTime === editData.startTime && oldData.endTime === editData.endTime && oldData.isOn === editData.isOn)) {
                message.error('No data to Save.');
                return;
            }

            let obj = _.clone(editData);

            obj.isDateChanged = true;
            delete obj.id;
            
            let response = await axios.post("/admin/operational-hours/upsert", obj);
            if (response && response.code === "OK") {
                let operationHours = _.clone(this.state.operationalHoursList);
                let data = _.clone(operationHours[index]);
                data.isEdit = !data.isEdit;
                operationHours[index] = data;

                let initialHoursList = _.clone(this.state.initialHoursList);
                initialHoursList[index] = _.clone(editData);

                this.setState({ operationalHoursList: operationHours , initialHoursList :initialHoursList });
                message.success(`${response.message}`);
            } else {
                message.error(`${response.message}`);
            }




        } catch (error) {
            console.log("Error****:", error.message);
        }
    }

    handleCancelEvent = async (e, index) => {
        let operationHours = _.clone(this.state.operationalHoursList);
        let data = _.clone(operationHours[index]);
        data.isEdit = !data.isEdit;
        operationHours[index] = data;
        this.setState({ operationalHoursList: operationHours });
    }

    handleStopOperation = async() => {
        let obj = {};
        obj.isActive = false;
        let self = this;
        let url, reqObj = {};
        url = "/admin/vehicle/all-active-deactive";

         axios
            .put(url, obj)
            .then(data => {
                if (data.code === "OK") {
                    message.success(data.message);
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
            }); 
    }

    handleStartOperation = async() => {
        let obj = {};
        obj.isActive = true;
        let self = this;
        let url, reqObj = {};
        url = "/admin/vehicle/all-active-deactive";
         axios
            .put(url, obj)
            .then(data => {
                if (data.code === "OK") {
                    message.success(data.message);
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
        }); 
    }

    render() {

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <h1 className="pageHeading"><IntlMessages id="app.operationalHours" defaultMessage="Operational Setting" /></h1>
                        {/* <div>
                            <Button type="primary" style={{ marginRight: '10px' }}
                                    onClick={this.handleStopOperation}>
                                {<IntlMessages id="app.stopOperation" defaultMessage="Stop Operation"/> }
                            </Button>

                            <Button type="primary" style={{ marginRight: '10px' }}
                                    onClick={this.handleStartOperation}>
                                {<IntlMessages id="app.startOperation" defaultMessage="Start Operation"/> }
                            </Button>
                        </div> */}
                    </Row>
                </div>
                <div className="gx-module-box-content">
                    <Form layout="vertical">
                        {this.state.operationalHoursList && this.state.operationalHoursList.length ?
                            this.state.operationalHoursList.map((data, index) => {
                                return <Row type="flex" justify="start" key={index}>
                                    <Col lg={2} md={2} sm={12} xs={24}>
                                        <Form.Item
                                            label={data.dayName}
                                        >
                                            <Switch
                                                checked={data.isOn}
                                                onChange={(e) => this.handleChange(e, 'isOn', index)}
                                                disabled={data.isEdit} />
                                        </Form.Item>

                                    </Col>
                                    <Col lg={4} md={4} sm={12} xs={24}>
                                        <Form.Item
                                            label="Start Time"
                                        >
                                            <TimePicker
                                                allowClear={false}
                                                format={'HH:mm'}
                                                value={moment(data.startTime, format)}
                                                disabled={data.isEdit}
                                                onChange={(e) => this.handleDateChange(e, 'startTime', index)}

                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col lg={4} md={4} sm={12} xs={24}>
                                        <Form.Item
                                            label="End Time"
                                        >
                                            <TimePicker
                                                allowClear={false}
                                                format={'HH:mm'}
                                                value={moment(data.endTime, format)}
                                                disabled={data.isEdit}
                                                onChange={(e) => this.handleDateChange(e, 'endTime', index)}
                                            />

                                        </Form.Item>
                                    </Col>
                                    <Col lg={8} md={8} sm={12} xs={24} >
                                        {
                                            data.isEdit ?
                                                <Form.Item
                                                    label="Action"
                                                >
                                                    <Button onClick={(e) => this.handleEditClick(e, index)}>Edit</Button>
                                                </Form.Item> :

                                                <Form.Item label="Action">
                                                    <Button onClick={(e) => this.handleSaveEvent(e, index, data)}>Save</Button>
                                                    <Button onClick={(e) => this.handleCancelEvent(e, index)}>Cancel</Button>
                                                </Form.Item>


                                        }
                                    </Col>
                                </Row>
                            }) :
                            null
                        }
                    </Form>
                </div>
            </div>
        );
    }
}

const WrappedSettingModal = Form.create({ name: 'settingform' })(OperationalHours);
const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedSettingModal);
