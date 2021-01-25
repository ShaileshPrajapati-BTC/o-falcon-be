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
        const {
            onCancel, invoice
        } = this.props;

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
                        {UtilService.displayPrice(invoice.fareSummary.distance + invoice.fareSummary.time)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.pauseFare" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.paused)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.reserveFare" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.reserved)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.unlockFree" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.unlockFees)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.cancelled" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.cancelled)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.faremanagement.parkingFine" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.parkingFine)}
                    </Col>
                    {/* <Col span={12}>
                        <b><IntlMessages id="app.rideDeposit" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.rideDeposit)}
                    </Col> */}
                    <Divider type="horizontal" />
                    <Col span={12}>
                        <h5><b> <IntlMessages id="app.payment.subTotal" /> :</b></h5>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.subTotal)}
                    </Col>
                    <Col span={12}>
                        <b><IntlMessages id="app.payment.promoCode" /> :</b>
                    </Col>
                    <Col span={12} style={{ marginLeft: invoice.fareSummary.promoCodeAmount ? '-5px' : '' }}>
                        {invoice.fareSummary.promoCodeAmount ? `-${UtilService.displayPrice(invoice.fareSummary.promoCodeAmount)}` : '-'}
                    </Col>
                    <Col span={12}>
                        <b> <IntlMessages id="app.payment.tax" /> :</b>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.tax)}
                    </Col>
                    <Divider type="horizontal" />
                    <Col span={12}>
                        <h5><b><IntlMessages id="app.total" />Total :</b></h5>
                    </Col>
                    <Col span={12}>
                        {UtilService.displayPrice(invoice.fareSummary.total)}
                    </Col>
                </Row>
            </Modal>
        );
    }
}
export default PaymentView;
