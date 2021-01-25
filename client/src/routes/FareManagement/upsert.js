import { Button, Form, Row, Typography, Tabs } from "antd";
import { VEHICLE_TYPE_FILTER, VEHICLE_TYPES } from "../../constants/Common";
import { Link } from "react-router-dom";
import React from "react";

import axios from "util/Api";
import { connect } from "react-redux";
import FareUpsertTable from "./FareUpsertTable";

const { Title } = Typography;
const { TabPane } = Tabs;
const _ = require("lodash");

class FareManagementUpsert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: props.match.params.id,
            record: [],
            fares: [],
            vehicleType: VEHICLE_TYPES.SCOOTER.toString()
        };
    }
    componentDidMount() {
        if (this.state.id) {
            this.fetch(this.state.id);
            return;
        }
    }
    fetch = id => {
        let self = this;
        self.setState({ loading: true });

        axios
            .get(`/admin/fare-management/${id}`)
            .then(data => {
                if (data.code === "OK") {
                    let record = data.data;
                    let fares = record.fares;
                    let currentRecord = _.find(
                        fares,
                        record => this.state.id === record.id
                    );
                    self.setState(prevState => {
                        prevState.record = record;
                        prevState.fares = fares;
                    });
                    self.setState({ vehicleType: currentRecord.vehicleType.toString() });
                }
                self.setState({ loading: false });
            })
            .catch(error => {
                console.log("Error****:", error.message);
                self.setState({ loading: false });
            });
    };
    getVehicleTypeName = vehicleType => {
        let resultObj = VEHICLE_TYPE_FILTER.find(e => {
            return e.type === vehicleType;
        });
        let typeLabel = resultObj ? resultObj.label : "";
        return typeLabel;
    };
    callback = key => {
        this.setState({ vehicleType: key });
    };
    sendFareListingPage = () => {
        this.props.history.push({
            pathname: `/e-scooter/general-settings/fare-management`,
            filter: this.props.location.filter
        });
    };
    // eslint-disable-next-line max-lines-per-function
    render() {
        const { record, loading, fares, vehicleType } = this.state;
        let zoneName = record && record.name ? `For ${record.name}` : "";        
        return (
            <div className="gx-module-box gx-module-box-100">
                <div className="gx-module-box-header">
                    <Row type="flex" align="middle" justify="space-between">
                        <div>
                            <Title
                                level={4}
                                className="gx-mb-0 gx-d-inline-block"
                            >
                                Update Fare {zoneName}
                            </Title>
                        </div>

                        <Link
                            to={{
                                pathname: `/e-scooter/general-settings/fare-management`,
                                filter: this.props.location.filter
                            }}
                            className="topbarCommonBtn"
                        >
                            <Button className="gx-mb-0">List</Button>
                        </Link>
                    </Row>
                </div>

                <Tabs
                    activeKey={this.state.vehicleType}
                    onChange={this.callback}
                    className="project-config-tab"
                >
                    {fares.map(fareObj => {
                        let vehicleType = fareObj.vehicleType.toString();
                        return (
                            <TabPane
                                tab={this.getVehicleTypeName(
                                    fareObj.vehicleType
                                )}
                                key={vehicleType}
                            >
                                <FareUpsertTable
                                    data={fareObj}
                                    fetch={this.fetch}
                                    loading={loading}
                                    id={fareObj.id}
                                    sendFareListingPage={
                                        this.sendFareListingPage
                                    }
                                />
                            </TabPane>
                        );
                    })}
                </Tabs>
            </div>
        );
    }
}

const WrappedFareManagementUpsert = Form.create({
    name: "fareManementUpsertForm"
})(FareManagementUpsert);

const mapStateToProps = function(props) {
    return props;
};

export default connect(mapStateToProps)(WrappedFareManagementUpsert);
