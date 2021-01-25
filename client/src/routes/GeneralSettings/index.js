import {
    Layout, Row, Col
} from 'antd';
import React from 'react';
import GeneralSettingSidebar from "./GeneralSettingSidebar";
import { connect } from "react-redux";
import Customizer from "containers/Customizer";
import GeneralSettingRoutes from "../GeneralSettingRoutes";
class GeneralSettings extends React.Component {   //componentName
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render() {
        const { match } = this.props;
        return (
            <Layout className="gx-app-layout">
                <Row>
                    <Col span={4} style={{ position: 'fixed' }}>
                        <GeneralSettingSidebar />
                    </Col>
                    <Col span={20} style={{ marginLeft: '17%' }} >
                        <Layout>
                            <GeneralSettingRoutes match={match} />
                        </Layout>
                    </Col>
                    <Customizer />
                </Row>
            </Layout>
        );
    }
}

const mapStateToProps = ({ settings }) => {
    const { width, navStyle } = settings;
    return { width, navStyle };
};
export default connect(mapStateToProps)(GeneralSettings);
