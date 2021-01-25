import { Modal, Row, Col, Empty } from 'antd';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';

const _ = require("lodash");
class ActivityTrack extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        console.log('data : ', this.props.data);
    }

    render() {
        const { data, onCancel } = this.props;

        return (
            <Modal
                visible={true}
                title={<IntlMessages id="app.dispute.activityTrack" />}
                footer=""
                onCancel={onCancel}
                width={680}
            >
                <div style={{ maxHeight: 330, overflow: 'auto', paddingBottom: '30px' }}>
                    <Row>
                        <Col span={8}><b><IntlMessages id="app.name" /></b></Col>
                        <Col span={8}><b><IntlMessages id="app.update" /></b></Col>
                        {/* <Col span={4}><b>Before</b></Col>
                        <Col span={4}><b>After</b></Col> */}
                        <Col span={8}><b><IntlMessages id="app.time" /></b></Col>
                    </Row>
                    {data ? _.map(data, (item, index) => {
                        return (
                            <>
                                <Row>
                                    <Col span={8}>
                                        {item.userId ? item.userId.name : '-'}
                                    </Col>
                                    <Col span={8}>
                                        {item.keyName ? item.keyName : '-'}
                                    </Col>
                                    {/* <Col span={4}>
                                        {item.oldValues ? item.oldValues : '-'}
                                    </Col>
                                    <Col span={4}>
                                        {item.newValues ? item.newValues : '-'}
                                    </Col> */}
                                    <Col span={8}>
                                        {item.dateTime ? UtilService.displayDate(item.dateTime) : '-'}
                                    </Col>
                                </Row>
                            </>
                        );
                    }) :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}

                </div>

            </Modal>
        );
    }
}

export default ActivityTrack;