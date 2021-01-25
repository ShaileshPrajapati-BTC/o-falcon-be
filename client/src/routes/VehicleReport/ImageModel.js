import { Modal, Row, Col, } from "antd";
import React, { Component } from "react";
import NoImage from '../../assets/images/no-image.png';
import { BASE_URL } from "../../constants/Setup";
const _ = require("lodash");

class ImageModel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportImage: props.reportImage
        };
    }

    render() {
        const { onCancel, visible } = this.props;
        const { reportImage } = this.state;
        return (
            <Modal
                title={'Vehicle Images'}
                footer=""
                width={600}
                visible={visible}
                onCancel={onCancel}
            >
                <Row style={{ padding: 5 }}>
                    {
                        reportImage.map(img => {
                            console.log("reportImage", img)
                            return <Col span={12}>
                                <img
                                    src={img ? `${BASE_URL}/${img}` : NoImage}
                                    alt=""
                                    className="parkedVehicleCover"
                                />
                            </Col>
                        })
                    }
                </Row>
            </Modal >
        );
    }
}
export default ImageModel;
