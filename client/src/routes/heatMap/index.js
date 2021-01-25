import './index.css';
import {
    Card, Row, Affix
} from 'antd';
import React from 'react';
import UsHeatMap from './Components/UsHeatMap';

class heatMap extends React.Component {

    render() {

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header headerRadius">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading">Heat Map</h1>
                        </Row>
                    </div>
                </Affix>
                <Card className="gx-card">
                    <UsHeatMap />
                </Card>
            </div>
        );
    }
}


export default heatMap;
