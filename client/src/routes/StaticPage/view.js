import {
    Col, Modal, Row
} from 'antd';
import React, { Component } from 'react';
import axios from 'util/Api';
import { RTL_LANGUAGE } from '../../constants/Common';

class View extends Component {
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
            let response = await axios.get(`admin/static-page/${id}`);
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
        const { onCancel, language } = this.props;
        let { record } = this.state;
        let textDir = RTL_LANGUAGE.indexOf(language) > -1 ? 'rtl' : 'ltr';

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
                        <Col span={24}>
                            <div dir={textDir} lang={language} dangerouslySetInnerHTML={{ __html: record.description }} />
                        </Col>
                    </Row>
                </Modal> :
                null
        );
    }
}

export default View;
