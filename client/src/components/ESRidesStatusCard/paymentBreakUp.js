import React, { Component } from 'react';
import { Col, Divider, Modal, Row } from 'antd';
import UtilService from "../../services/util";
import IntlMessages from '../../util/IntlMessages';
class PaymentView extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render() {
        const { onCancel, fareSummary } = this.props;

        return (
            <Modal
                visible={true}
                title={<IntlMessages id="app.payment.paymentBreakups" />}
                footer=""
                onCancel={onCancel}
                width={500}
            >
                <Row className="m-2">
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.rideFare" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(fareSummary.distance + fareSummary.time)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.pauseFare" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(fareSummary.paused)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.reserveFare" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(fareSummary.reserved)}
                    </Col>
                    <Divider type="horizontal" />
                    <Col span={12}>
                        <h5><b> <IntlMessages id="app.payment.subTotal" /> :</b></h5>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(fareSummary.subTotal)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.promoCode" /> :</b>
                    </Col>
                    <Col span={12} style={{ marginLeft: fareSummary.promoCodeAmount ? '-5px' : '' }}>
                        {fareSummary.promoCodeAmount ? `-${UtilService.displayPrice(fareSummary.promoCodeAmount)}` : '-'}
                    </Col>
                    <Col span={12}>
                        <b> <IntlMessages id="app.payment.tax" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(fareSummary.tax)}
                    </Col>
                    <Divider type="horizontal" />
                    <Col span={12}>
                        <h5><b><IntlMessages id="app.total" />Total :</b></h5>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(fareSummary.total)}
                    </Col>
                </Row>
            </Modal>
        );
    }
}
export default PaymentView;
