import { Modal, message, Spin, Row, Col, Tag, Card, } from "antd";
import React, { Component } from "react";
import axios from "util/Api";
import { DEFAULT_API_ERROR, TASK_LEVEL, FILTER_BY_WORK_FLOW, NEST_LABEL, FILTER_BY_TASK_TYPE, TASK_TIME_LIMIT_TYPE, WORK_FLOW } from "../../constants/Common";
import UtilService from "../../services/util";
const _ = require("lodash");

class ViewReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
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
            let response = await axios.get(`/admin/report/${id}`);
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

    render() {
        const { onCancel, visible } = this.props;
        const { data, loading } = this.state;

        return (
            <Modal
                title={'Vehicle Report'}
                footer=""
                width={600}
                visible={visible}
                onCancel={onCancel}
            >
                <Spin spinning={loading} delay={100}>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Report Id :</b></Col>
                        <Col span={12}>{data.reportNumber ? data.reportNumber : '-'}</Col>
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
                        <Col span={12}><b>Vehicle :</b></Col>
                        <Col span={12}>{data.vehicleId && data.vehicleId.name ? data.vehicleId.name : '-'}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Category :</b></Col>
                        <Col span={12}>{data.categoryId && data.categoryId.name ? data.categoryId.name : '-'}</Col>
                    </Row>
                    <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Subcategory :</b></Col>
                        <Col span={12}>{data.vehicleIssue ?
                            data.vehicleIssue.map((element, i) => {
                                return i !== 0 ? ',  ' + element : element
                            })
                            : '-'}</Col>
                    </Row>
                    {data.comment && <Row style={{ padding: 5 }}>
                        <Col span={12}><b>Comment :</b></Col>
                        <Col span={12}>{data.comment}</Col>
                    </Row>}
                </Spin>
            </Modal >
        );
    }
}
export default ViewReport;
