import { Col, Modal, Row } from 'antd';
import { BOOK_PLAN_LIMIT_TYPES, BOOK_PLAN_LIMIT_FILTER } from '../../constants/Common';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';

class BookingPlanView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            record: {}
        };
    }
    componentDidMount() {
        this.fetch(this.props.id);
    }
    fetch = async (id) => {
        try {
            let response = await axios.get(`admin/book-plan/${id}`);
            if (response.code === 'OK') {
                this.setState({
                    record: response.data
                });
            } else {
                console.log(' ELSE ERROR ');
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    render() {
        const { onCancel } = this.props;
        let { record } = this.state;
        let limitType = BOOK_PLAN_LIMIT_FILTER.find((el) => { return el.type === record.limitType; })

        return (
            record ?
                <Modal
                    visible={true}
                    title={<h3><b>{record.name}</b></h3>}
                    footer=""
                    onCancel={onCancel}
                    width={600}
                >
                    <Row className="viewplanrow">
                        <Col span={12}>
                            <b>Valid After :&nbsp;&nbsp;</b> {record.startDateTimeToBuy ? UtilService.displayDate(record.startDateTimeToBuy) : '-'}
                        </Col>
                        <Col span={12}>
                            <b>Valid Before :&nbsp;&nbsp;</b> {record.endDateTimeToBuy ? UtilService.displayDate(record.endDateTimeToBuy) : '-'}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Usage Limit :</b>
                        </Col>
                        <Col span={18}>
                            {record.limitValue + '   ' + limitType && limitType.label}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Price :</b>
                        </Col>
                        <Col span={18}>
                            {record.price}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Renewable :</b>
                        </Col>
                        <Col span={18}>
                            {record.isRenewable ? 'Yes' : 'No'}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b> Trial Plan :</b>
                        </Col>
                        <Col span={18}>
                            {record.isTrialPlan ? 'Yes' : 'No'}
                        </Col>
                    </Row>
                    <Row className="viewplanrow">
                        <Col span={6}>
                            <b>Description : </b>
                        </Col>
                        <Col span={18}>
                            {record.description ? record.description : '-'}
                        </Col>
                    </Row>
                </Modal > :
                null
        );
    }
}

export default BookingPlanView;
