import { Col, Modal, Row } from 'antd';
import { UNIT_TYPE_ARRAY, DISCOUNT_TYPE } from '../../constants/Common';
import React, { Component } from 'react';
import UtilService from '../../services/util';
import axios from 'util/Api';
import IntlMessages from '../../util/IntlMessages';

class PromoCodeView extends Component {
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
            let response = await axios.get(`admin/promo-code/${id}`);
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

        return (
            record ?
                <Modal
                    visible={true}
                    title={<h3><b>{record.name}</b></h3>}
                    footer=""
                    onCancel={onCancel}
                    width={600}
                >
                    <Row>
                        <Col span={12}>
                            <b><IntlMessages id="app.feedback.validAfter" />  :</b> {UtilService.displayDate(record.startDateTime)}
                        </Col>
                        <Col span={12}>
                            <b><IntlMessages id="app.feedback.validBefore" /> :</b> {UtilService.displayDate(record.endDateTime)}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <b> <IntlMessages id="app.user.codeLabel" /> :</b>
                        </Col>
                        <Col span={18}>
                            {record.code}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <b> <IntlMessages id="app.promocode.discount" /> :</b>
                        </Col>
                        <Col span={18}>
                            {record.type === DISCOUNT_TYPE.GENERAL || record.type === DISCOUNT_TYPE.WALLET_BALANCE ?
                                <>
                                    {!record.maximumDiscountLimit ? record.flatDiscountAmount : record.percentage}
                                    {record.discountType === UNIT_TYPE_ARRAY[0].value ?
                                        UNIT_TYPE_ARRAY[0].label :
                                        UNIT_TYPE_ARRAY[1].label}
                                    {record.maximumDiscountLimit ? 
                                    <><IntlMessages id="app.feedback.upto" /> {UtilService.displayPrice(record.maximumDiscountLimit)} </>
                                       : null }
                                </> :
                                <><IntlMessages id="app.feedback.firstRideFree" /></>
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <b><IntlMessages id="app.description" /> : </b>
                        </Col>
                        <Col span={18}>
                            {record.description ? record.description : '-'}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <b><IntlMessages id="app.promocode.notes" /> : </b>
                        </Col>
                        <Col span={18}>
                            {record.notes ? record.notes : '-'}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <b><IntlMessages id="app.feedback.t&C" /> : </b>
                        </Col>
                        <Col span={18}>
                            {record.tnc ? record.tnc : '-'}
                        </Col>
                    </Row>

                </Modal > :
                null
        );
    }
}

export default PromoCodeView;
