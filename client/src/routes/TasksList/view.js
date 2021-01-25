import { Modal, message, Spin, Row, Col, Tag, Card, } from "antd";
import React, { Component } from "react";
import axios from "util/Api";
import { DEFAULT_API_ERROR, TASK_LEVEL, FILTER_BY_WORK_FLOW, NEST_LABEL, FILTER_BY_TASK_TYPE, TASK_TIME_LIMIT_TYPE, WORK_FLOW, BASE_URL, TASK_TIME_LIMIT_TYPE_FILTER, FILTER_BY_TASK_LEVEL } from "../../constants/Common";
import UtilService from "../../services/util";
import NoImage from '../../assets/images/no-image.png';
const _ = require("lodash");

class ViewTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            previewImage: '',
            previewVisible: false
        };
    }
    componentDidMount = () => {
        if (this.props.viewId) {
            this.fetch(this.props.viewId);
        }
    }

    fetch = async (id) => {
        this.setState({ loading: true })
        try {
            let response = await axios.get(`/admin/task/${id}`);
            if (response.code === 'OK') {
                let recordData = response.data;
                this.setState({ data: recordData, loading: false });
            } else {
                this.setState({ loading: false })
                message.error(response.message)
            }
        } catch (error) {
            let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
            message.error(errorMsg);
            this.setState({ loading: false })
        }
    }
    handlePreview = async (image) => {
        if (image) {
            this.setState({
                previewImage: `${BASE_URL}/${image}`,
                previewVisible: true
            });
        }
    };
    handleCancel = () => {
        return this.setState({ previewVisible: false, previewImage: '' });
    };
    render() {
        const { onCancel, visible } = this.props;
        const { data, loading } = this.state;
        let workflow = _.filter(FILTER_BY_WORK_FLOW, (flow) => { return data.taskWorkFlow === flow.type })[0]
        const title = <div style={{ display: 'flex' }}>Task   {data.isOverDue &&
            <div style={{ paddingLeft: 15 }}>
                <Tag color='red'>Over Due</Tag>
            </div>
        }</div>;
        let taskType = FILTER_BY_TASK_TYPE.filter((e) => e.type === data.taskType);
        let timeLimitType = TASK_TIME_LIMIT_TYPE_FILTER.find((el) => { return el.type === data.timeLimitType; })
        let level = FILTER_BY_TASK_LEVEL.find((el) => { return el.type === data.level })
        return (
            <Modal
                title={title}
                footer=""
                width={600}
                visible={visible}
                onCancel={onCancel}
            >
                <Spin spinning={loading} delay={100}>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Task Id :</b></Col>
                        <Col span={12}>{data.taskNumber ? data.taskNumber : '-'}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Created On :</b></Col>
                        <Col span={12}>{UtilService.displayDate(data.createdAt)}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Created By :</b></Col>
                        <Col span={12}>{data.addedBy && data.addedBy.name ? data.addedBy.name : '-'}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Task Heading :</b></Col>
                        <Col span={12}>{data.taskHeading}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Level :</b></Col>
                        <Col span={12}>{level && level.label}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Type :</b></Col>
                        <Col span={12}>{taskType[0].label}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Work Flow :</b></Col>
                        <Col span={12}>{workflow ? workflow.label : '-'}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Assign To :</b></Col>
                        <Col span={12}>
                            {data.assignedTo && data.assignedTo.name
                                ?
                                <Row>
                                    <Col span={24}>{data.assignedTo.name}</Col>
                                </Row>
                                : '-'}
                        </Col>
                    </Row>
                    {data.snoozerTime !== 0 && <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Snoozer Time :</b></Col>
                        <Col span={12}>{data.snoozerTime} min</Col>
                    </Row>}
                    {data.incentiveAmount && <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Incentive Amount :</b></Col>
                        <Col span={12}>{UtilService.displayPrice(data.incentiveAmount)}</Col>
                    </Row>}
                    {data.nest && <Row style={{ padding: 5 }}>
                        <Col span={12}><b>{NEST_LABEL} :</b></Col>
                        <Col span={12}><span style={{ textTransform: "capitalize" }}>{data.nest.name ? data.nest.name : '-'}</span></Col>
                    </Row>}
                    {data.note && <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Note :</b></Col>
                        <Col span={12}><span style={{ textTransform: "capitalize" }}>{data.note}</span></Col>
                    </Row>}
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Vehicle :</b></Col>
                        <Col span={12}>{data.referenceId && data.referenceId.name ? data.referenceId.name : '-'}</Col>
                    </Row>
                    {(data.taskWorkFlow === WORK_FLOW.IN_PROGRESS) &&
                        <>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>TaskLimit :</b></Col>
                                <Col span={12}>{data.timeLimitValue}{'  '}{timeLimitType && timeLimitType.label}</Col>
                            </Row>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>Task Started On :</b></Col>
                                <Col span={12}>{data.taskStartDateTime ? UtilService.displayDate(data.taskStartDateTime) : '-'}</Col>
                            </Row>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>Task Should Completed On :</b></Col>
                                <Col span={12}>{data.taskEndDateTime ? UtilService.displayDate(data.taskEndDateTime) : '-'}</Col>
                            </Row>
                        </>
                    }
                    {data.taskWorkFlow === WORK_FLOW.COMPLETE &&
                        <>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>Completed On :</b></Col>
                                <Col span={12}>{data.completedAt ? UtilService.displayDate(data.completedAt) : '-'}</Col>
                            </Row>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>Completed By :</b></Col>
                                <Col span={12}>{data.completedBy && data.completedBy.name ? data.completedBy.name : '-'}</Col>
                            </Row>
                        </>
                    }
                    {data.taskWorkFlow === WORK_FLOW.CANCELLED &&
                        <>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>Canceled On :</b></Col>
                                <Col span={12}>{data.canceledAt ? UtilService.displayDate(data.canceledAt) : '-'}</Col>
                            </Row>
                            <Row style={{ padding: 5 }}>
                                <Col span={12}><b>Canceled By :</b></Col>
                                <Col span={12}>
                                    {data.canceledBy &&
                                        data.canceledBy.map((user) => {
                                            return <div>
                                                {user.userId && user.userId.name ?
                                                    user.userId.name + ' At ' + UtilService.displayDate(user.datetime)
                                                    : '-'}
                                            </div>
                                        })
                                    }</Col>
                            </Row>
                        </>
                    }
                    {data.taskWorkFlow === WORK_FLOW.COMPLETE && data.images &&
                        <Row style={{ padding: 5 }}>
                            <Col span={12}><b>Image :</b></Col>
                            <Col span={12} style={{ display: 'flex' }}>
                                {data.images.map((img) => {
                                    return (
                                        <div className="parkedImage" style={{ marginRight: 5, width: 40 }}>
                                            <Card
                                                style={{ width: 40, height: 40 }}
                                                className="parkedImageCard gx-pointer"
                                                cover={
                                                    <img
                                                        src={img ? `${img}` : NoImage}
                                                        alt=""
                                                        onClick={img ? () => this.handlePreview(`${img}`) : ''}
                                                        className="parkedVehicleCover"
                                                    />}
                                            />
                                        </div>
                                    )
                                })}
                            </Col>
                        </Row>
                    }
                    {data.description && <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Description :</b></Col>
                        <Col span={12}>{data.description}</Col>
                    </Row>}
                </Spin>
                <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </Modal >
        );
    }
}
export default ViewTask;
