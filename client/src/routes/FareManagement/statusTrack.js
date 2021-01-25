import { Collapse, Modal, Row, Col, Empty } from 'antd';
import React, { Component } from 'react';
import UtilService from '../../services/util';

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
    getKeyWithSpace = (recordKey) => {
        let key = recordKey;

        let keyForRefer = recordKey;

        key = key.split("");
        let stringArrayWithSpace = [];
        key.forEach((el, index) => {
            let char = keyForRefer.charCodeAt(index);
            if (char >= 65 && char <= 90) {
                stringArrayWithSpace.splice(index, 0, ` ${el}`);
            } else {
                let item = index === 0 ? el.toUpperCase() : el
                stringArrayWithSpace.splice(index, 0, item);
            }
        });
        let newString = stringArrayWithSpace.join('')
        return newString
    }
    render() {
        const { data, onCancel, visible } = this.props;
        return (
            data ?
                <Modal
                    visible={visible}
                    title="Status Track"
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
                                const filterData = item.data.filter(el => el.key !== 'baseCurrency')
                                return (
                                    item.data.length !== 0 &&
                                    <Panel
                                        header={item.user.name}
                                        key={index}
                                        extra={UtilService.displayDate(item.dateTime)}
                                    >
                                        <Row>
                                            <Col span={16}><b>Field Name</b></Col>
                                            <Col span={4}><b>Before</b></Col>
                                            <Col span={4}><b>After</b></Col>
                                        </Row>
                                        {_.map(filterData, (record) => {

                                            return <Row>

                                                <Col span={16}>
                                                    {record.key ? this.getKeyWithSpace(record.key) : '0'}
                                                </Col>
                                                <Col span={4}>
                                                    {record.before ? record.before : '0'}
                                                </Col>
                                                <Col span={4}>
                                                    {record.after ? record.after : '0'}
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
