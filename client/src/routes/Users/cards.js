import { Card, Col, Empty, Row } from 'antd';
import React, { Component } from 'react';
import IntlMessages from '../../util/IntlMessages';

const _ = require('lodash');

class Cards extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
    }
    render() {
        const { data } = this.props;

        return (
            <>
                {data ?
                    <div style={{ background: '#ECECEC', padding: '30px' }}>
                        <Row gutter={16}>
                            {_.map(data, (item) => {
                                return (
                                    <Col span={8}>
                                        <Card bodyStyle={{ paddingLeft: 30 }}>
                                            <div className="cardInnerHead" style={{ marginTop: 20 }}>
                                                <h3 className="dashboardCardTitle">
                                                    {item.brand}
                                                    {/* Name of Card Holder */}
                                                </h3>
                                            </div>
                                            <div className="cardSummeryInsightInsight">
                                                <h4 style={{ paddingTop: 10 }}>XXXX XXXX XXXX {item.last4}</h4>
                                                {/* <b>Card Type : </b> {item.brand} <br /> */}
                                                <b><IntlMessages id="app.user.cardValid" /> : </b>{`${item.expMonth}/${item.expYear}`}
                                            </div>
                                        </Card>
                                    </Col>);
                            })}
                        </Row>
                    </div> :
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </>
        );
    }
}
export default Cards;
