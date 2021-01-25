import { Card, Col, Row } from "antd";
import React, { Component } from 'react';

import DateBasedLine from "./Components/DateBasedLine";

class LineChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        return (
            <div className="gx-main-content">

                <Row>
                    <Col span={23}>
                        <DateBasedLine />
                    </Col>
                </Row>
            </div>
        )
    }
};

export default LineChart;
