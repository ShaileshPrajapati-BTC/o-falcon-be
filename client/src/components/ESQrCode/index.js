import { Button, Col, Modal, Row } from 'antd';
import React, { Component } from 'react';
import IntlMessages from '../../util/IntlMessages';
let QRCode = require('qrcode.react');

class ESQrCode extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    downloadQrCode = (elementId) => {
        const canvas = document.getElementById(`${elementId}-view`);
        const pngUrl = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${elementId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    render() {
        const { qrNumber, onCancel } = this.props;

        return (
            <Modal
                title={<IntlMessages id="app.vehicle.qrCode" defaultMessage="QR Code" />}
                footer=""
                width={600}
                visible={true}
                onCancel={onCancel}
            >
                <div className="gx-module-box gx-mw-100 gx-text-center">
                    <Row type="flex" className="" align="middle" justify="space-between">
                        <Col span={24}>
                            <QRCode
                                id={`${qrNumber}-view`} value={qrNumber} size={350}
                                level={'H'}
                                includeMargin={true}
                            />
                        </Col>
                        <Col span={24}>
                            {qrNumber}
                        </Col>
                    </Row>
                    <Row type="flex" className="gx-mt-4" align="middle" justify="space-between">
                        <Col span={24}>
                            <Button type="primary" className="m-l-5"
                                onClick={this.downloadQrCode.bind(this, qrNumber)}
                            >
                                <IntlMessages id="app.vehicle.downloadQR" defaultMessage="Download QR" />
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    }
}
export default ESQrCode;
