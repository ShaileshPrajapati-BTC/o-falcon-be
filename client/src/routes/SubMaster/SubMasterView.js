import {
    Avatar, Col, Modal, Row, Tag
} from 'antd';
import React, { Component } from 'react';
import axios from 'util/Api';
import IntlMessages from '../../util/IntlMessages';

class SubMasterView extends Component {
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
            let response = await axios.get(`admin/master/${id}`);
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
                    title=""
                    footer=""
                    onCancel={onCancel}
                    width={600}
                >
                    <Row>
                        <Col span={6}>
                            <Avatar className="bg-primary"
                                size={120} alt={record.name}
                                src={record.icon}>
                                {record.name}
                            </Avatar>
                        </Col>
                        <Col style={{ maxHeight: 450, overflow: 'auto' }} span={18}>
                            <h2 className="gx-d-block">
                                <strong>{record.masterName}</strong>
                            </h2>
                            <Row className="gx-mb-3" type="flex" align="middle">
                                <h3>
                                    <strong>{record.name} ({record.code})</strong>
                                    <Tag className="gx-ml-2"
                                        color={record.isActive ? 'black' : 'red'}>
                                        {record.isActive ? <IntlMessages id="app.active" defaultMessage="Active"/> : <IntlMessages id="app.deactive" defaultMessage="Deactive"/>}
                                    </Tag>

                                </h3>
                            </Row>

                            <Row className="gx-mb-3" type="flex" align="middle">
                                <Col className="gx-p-0">
                                    <div className="custom-header-title"><IntlMessages id="app.description" defaultMessage="Description"/></div>
                                    <p className="preText">
                                        {record.description}
                                    </p>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Modal> :
                null
        );
    }
}

export default SubMasterView;
