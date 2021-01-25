import { Modal, Row, Col } from 'antd';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');

class SeeConversation extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { onCancel, conversationTrack } = this.props;

        return (
            <Modal
                visible={true}
                title={<IntlMessages id="app.dispute.conversation" />}
                footer=""
                onCancel={onCancel}
                width={700}
            >
                <div style={{ maxHeight: 330 }}>
                    {
                        _.map(conversationTrack, (data) => {

                            return (<Row >
                                <Col span={17}>
                                    <b>{data.userId ? `${data.userId.name} : ` : ''}</b>
                                    {/* </Col>
                                <Col > */}
                                    {data.remark ? data.remark : ''}
                                </Col>
                                <Col span={7}>
                                    {data.dateTime ? UtilService.displayDate(data.dateTime ? data.dateTime : '') : ''}
                                </Col>
                            </Row>);
                        })
                    }
                </div>
            </Modal>
        );
    }
}

export default SeeConversation;