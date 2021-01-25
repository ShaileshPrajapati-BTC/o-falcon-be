import {
    NEST_TYPE, NEST_LABEL, ONLY_NUMBER_REQ_EXP, DEFAULT_DISTANCE_UNIT, FILE_TYPES, FILTER_BY_NEST_TYPE
} from "../../constants/Common";
import {
    Button, Col, Form, Input, Row, Select, InputNumber, Upload, Icon, message
} from "antd";
import React, { Component } from "react";
import axios from "util/Api";
import TextArea from "antd/lib/input/TextArea";
import CrudService from "../../services/api";
import CustomScrollbars from "../../util/CustomScrollbars";
const _ = require("lodash");

class NestUpsert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            radius: props.radius,
            nestType: NEST_TYPE.NEST_RIDER,
            imageUploadprops: {
                name: 'file',
                listType: 'picture',
                className: 'upload-list-inline',
                action: `/upload-file`,
                fileList: [],
                headers: {
                    destination: 'master'
                },
                beforeUpload: (file) => {
                    return this.validateFile(file, { type: 'image' });
                },
                onChange: (info) => {
                    return this.onFileChange(info, { fieldName: 'image', stateKeyName: 'imageUploadprops' });
                },
                onRemove: (info) => {
                    return CrudService.removeFile(info);
                }
            }
        }
        this.nestType = FILTER_BY_NEST_TYPE.filter((ele) => { return ele.value !== 1; })
    }
    componentDidMount = () => {
        const { form } = this.props;
        if (this.props.editId) {
            this.fetch(this.props.editId);
            return;
        }
        form.setFieldsValue({ type: this.state.nestType, capacity: 100 });
    }
    fetch = async (id) => {
        const { form } = this.props;
        axios
            .get(`admin/nest/${id}`)
            .then(data => {
                if (data.code === "OK") {
                    let userData = data.data;
                    let formVal = _.pick(userData, [
                        "type",
                        "name",
                        "capacity",
                        "maxCapacity",
                        "speedLimit",
                        "address",
                        "note",
                        "image"
                    ]);
                    this.setState({ nestType: userData.type })
                    form.setFieldsValue(formVal);

                    this.setState({ nestType: formVal.type })
                    let image = form.getFieldValue('image');
                    if (image && typeof image === 'string') {
                        this.setState((state) => {
                            state.imageUploadprops.fileList = [{
                                uid: 'uid',
                                name: 'Image',
                                status: 'done',
                                url: image
                            }];

                            return state;
                        });
                    } else {
                        this.setState((state) => {
                            state.imageUploadprops.fileList = [];

                            return state;
                        });
                    }
                }
            })
            .catch(error => {
                console.log("Error****:", error.message);
            });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.radius && nextProps.radius !== this.state.radius) {
            this.setState({ radius: nextProps.radius });
        }
    }

    handleRadiusChange = (radius) => {
        this.setState({ radius: radius });
        this.props.handleRadiusChange(radius);
    }

    clearFormFn = () => {
        const { form } = this.props;
        form.resetFields();
        this.props.clearFormFn();
    }
    handleSubmit = (e) => {
        e.preventDefault();
        const isDrwaingNestIsCircle = this.props.isDrwaingNestIsCircle;
        this.props.form.validateFields((err, values) => {
            if (err) {
                return false;
            }
            if (isDrwaingNestIsCircle && this.state.radius === 0) {
                message.error("Radius can't be zero!");
                return false;
            }
            this.props.handleSubmit(values);
        })
    }
    changeOnNestType = (e) => {
        this.setState({ nestType: e })
    }
    validateFile = function (file, as) {
        file.isValid = FILE_TYPES[as.type].indexOf(file.type) > -1;
        if (!file.isValid) {
            message.error('Invalid file type');
        }

        return file.isValid;
    };

    onFileChange(info, option) {
        if (info.file.status === 'removed') {
            let obj = {};
            obj[option.fieldName] = '';
            this.props.form.setFieldsValue(obj);
        }
        this.setState((state) => {
            state[option.stateKeyName].fileList = _.filter(info.fileList, { isValid: true });

            return state;
        });
    }
    getSingleFilePath = (e) => {
        if (e.file && e.file.status === 'removed') {
            return '';
        }

        if (e.file && e.file.status === 'done') {
            if (e && e.file.response && e.file.response.data &&
                _.size(e.file.response.data.files) > 0 &&
                e.file.response.data.files[0].absolutePath) {
                return e.file.response.data.files[0].absolutePath;
            }
        }

        return '';
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <CustomScrollbars>
                <div style={{ paddingTop: 15 }}>
                    <Form layout="vertical" onSubmit={this.handleSubmit}>
                        <Row type="flex" justify="start"  >
                            <Col span={24} >
                                <Form.Item label="Name" hasFeedback >
                                    {getFieldDecorator("name", {
                                        rules: [{
                                            transform: value => { return (value && value.trim()); }
                                        },
                                        { required: true, message: "Please add name." },
                                        // { max: 20, message: 'Name cannot be larger than 20 character!' },
                                        // { min: 5, message: 'Name cannot be smaller than 5 character!' },
                                        { pattern: /^[a-z\d\-_\s]+$/i, message: 'Please enter name include alphanumeric,space,-,_!' }
                                        ]
                                    }
                                    )(
                                        <Input placeholder="Name" />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" justify="start" className={!this.props.isDrwaingNestIsCircle ? "displayNone" : ""}>
                            <Col span={24} >
                                <Form.Item label="Radius" hasFeedback >
                                    <InputNumber value={this.state.radius} onChange={this.handleRadiusChange.bind(this)} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row type="flex" justify="start"  >
                            <Col span={24} >
                                <Form.Item label={<>{NEST_LABEL} Type</>} hasFeedback >
                                    {getFieldDecorator("type", {
                                        rules: [{
                                            required: true, message: `Please select ${NEST_LABEL} Type!`
                                        }]
                                    }
                                    )(
                                        <Select placeholder="Select type" onChange={this.changeOnNestType}>
                                            {this.nestType.map(val => {
                                                return (
                                                    <Select.Option
                                                        key={val.value}
                                                        value={val.type}
                                                    >
                                                        {val.label}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        {(this.state.nestType === NEST_TYPE.NEST_RIDER || this.state.nestType === NEST_TYPE.NEST_REPAIR || this.state.nestType === NEST_TYPE.NEST_DOCKING_STATION) &&
                            <Row type="flex" justify="start"  >
                                <Col span={24} >
                                    <Form.Item label="Max Capacity" hasFeedback>
                                        {getFieldDecorator("capacity", {
                                            initialValue: 100,
                                            rules: [{
                                                required: true, message: "Please add Max Capacity!"
                                            }, {
                                                pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                message: 'Please add only digit!'
                                            }, {
                                                pattern: new RegExp('^[1-9][0-9]*$'),
                                                message: `Capacity cannot be zero! `
                                            },]
                                        }
                                        )(
                                            <InputNumber placeholder="Enter Max Capacity" />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        }
                        {(this.state.nestType === NEST_TYPE.SLOW_SPEED) &&
                            <Row type="flex" justify="start"  >
                                <Col span={24} >
                                    <Form.Item label={`Speed limit ${DEFAULT_DISTANCE_UNIT}/hr`} hasFeedback>
                                        {getFieldDecorator("speedLimit", {
                                            rules: [{
                                                required: true, message: "Please add Speed limit !"
                                            }, {
                                                pattern: new RegExp(ONLY_NUMBER_REQ_EXP),
                                                message: 'Please add only digit!'
                                            }, {
                                                pattern: new RegExp('^[1-9][0-9]*$'),
                                                message: `Speed cannot be zero! `
                                            },]
                                        }
                                        )(
                                            <InputNumber min={1} placeholder="Enter Speed limit " />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        }
                        {(this.state.nestType === NEST_TYPE.RIDER || this.state.nestType === NEST_TYPE.REPAIR) &&
                            <>
                                <Row type="flex" justify="start"  >
                                    <Col span={24} >
                                        <Form.Item label="Address" hasFeedback>
                                            {getFieldDecorator("address", {}
                                            )(
                                                <TextArea multiline="true"
                                                    rows={3}
                                                    placeholder="Address"
                                                    margin="none" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row type="flex" justify="start"  >
                                    <Col span={24} >
                                        <Form.Item label="Note" hasFeedback>
                                            {getFieldDecorator("note", {}
                                            )(
                                                <TextArea multiline="true"
                                                    rows={3}
                                                    placeholder="Note"
                                                    margin="none" />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row type="flex" justify="start"  >
                                    <Col span={24} >
                                        <Form.Item label="Note" hasFeedback>
                                            {getFieldDecorator('image', {
                                                required: false,
                                                getValueFromEvent: this.getSingleFilePath
                                            })(
                                                <Upload key="image" {...this.state.imageUploadprops}>
                                                    <Button disabled={this.state.imageUploadprops.fileList.length > 0}>
                                                        <Icon type="upload" /> Upload Image
                                        </Button>
                                                </Upload>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        }
                        <Row type="flex" justify="start">
                            <Col span={24} className="gx-text-right" >
                                <Button style={{ marginLeft: 8, marginTop: 15 }}
                                    onClick={() => { return this.props.handleReset(); }}
                                > Change Shape
                            </Button>
                                <Button style={{ marginLeft: 8, marginTop: 15 }}
                                    onClick={() => { return this.clearFormFn(); }}
                                > Cancel
                            </Button>
                                <span className="topbarCommonBtn">
                                    <Button style={{ display: "inline-flex" }} type="primary" htmlType="submit" >
                                        Save
                                </Button>
                                </span>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </CustomScrollbars>
        );
    }
}


const WrappedNest = Form.create({ name: "nestUpsertForm" })(NestUpsert);

export default WrappedNest;