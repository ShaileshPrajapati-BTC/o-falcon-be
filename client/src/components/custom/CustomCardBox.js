import React from 'react';
import { Avatar, Card, Col, Icon, Row } from 'antd';
const { Meta } = Card;

class CustomCardBox extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { avatar, title, description, boxValue } = this.props;
        return (
            <Card className="m-b-10" bodyStyle={{ padding: 0 }}>
                <Row className="gx-m-0 gx-p-0">
                    <Col className="gx-m-0 gx-p-0" span={16}>
                        <Meta
                            avatar={avatar}
                            title={title}
                            description={description}
                            className="gx-p-3 gx-m-0"
                        />
                    </Col>
                    <Col className="gx-p-0 gx-m-0 bg-0" span={8}>
                        <div className="card-value-box">{boxValue}</div>
                    </Col>
                </Row>
            </Card>
        );
    }
}
export default CustomCardBox;