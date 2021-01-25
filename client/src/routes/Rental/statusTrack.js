import { Collapse, Modal, Row, Col, Empty } from 'antd';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import {
    COMMISSION_TYPE, DEFAULT_BASE_CURRENCY
} from '../../constants/Common';
import IntlMessages from '../../util/IntlMessages';

const { Panel } = Collapse;
const _ = require('lodash');


class StatusTrack extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
    }
    componentDidMount() {
        console.log('data : ', this.props.data);
    }
    onChange = () => {

    }
    render() {
        let { data, onCancel, visible } = this.props;
        data = data.reverse();
        return (
            data ?
                <Modal
                    visible={visible}
                    title={<IntlMessages id="app.statusTrack" />}
                    footer=""
                    width={600}
                    onCancel={onCancel}>
                    <div style={{ maxHeight: 330, overflow: 'auto' }}>
                        {/* <CustomScrollbars className="gx-module-content-scroll" style={{ maxHeight: 330 }}> */}
                        {
                            (data.length === 0 || (data.length === 1 && data[0].data.length === 0)) &&
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 'auto' }} />
                        }
                        <Collapse
                            defaultActiveKey={['0']}
                            onChange={this.onChange.bind(this)}>
                            {_.map(data, (item, index) => {
                                return (
                                    item.data.length !== 0 &&
                                    <Panel
                                        header={item.user.name}
                                        key={index}
                                        extra={UtilService.displayDate(item.dateTime)}
                                    >
                                        <Row>
                                            <Col span={16}><b><IntlMessages id="app.fieldName" /></b></Col>
                                            <Col span={4}><b><IntlMessages id="app.before" /></b></Col>
                                            <Col span={4}><b><IntlMessages id="app.after" /></b></Col>
                                        </Row>
                                        {_.map(item.data, (record) => {
                                            return <Row>
                                                <Col span={16}>
                                                    {record.key ? record.key : '0'}
                                                </Col>
                                                <Col span={4}>
                                                    {record.key === 'type' ?
                                                        record.before && record.before === COMMISSION_TYPE.PERCENTAGE
                                                            ? "%" : DEFAULT_BASE_CURRENCY
                                                        : record.before ? record.before : '0'
                                                    }
                                                    {/* {record.key !== 'type' && } */}
                                                </Col>
                                                <Col span={4}>
                                                    {record.key === 'type' ?
                                                        record.after && record.after === COMMISSION_TYPE.PERCENTAGE
                                                            ? "%" : DEFAULT_BASE_CURRENCY
                                                        : record.after ? record.after : '0'
                                                    }
                                                    {/* {record.key !== 'type' && } */}
                                                </Col>
                                            </Row>;
                                        })}
                                    </Panel>
                                );
                            })}
                        </Collapse>
                    </div>
                    {/* </CustomScrollbars> */}
                </Modal > :
                null
        );
    }

}
export default StatusTrack;
