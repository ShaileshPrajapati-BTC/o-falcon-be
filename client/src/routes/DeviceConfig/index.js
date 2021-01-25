import React, { Component } from "react";
import {
    Button,
    Form,
    Input,
    Row,
    Typography,
    Col,
    message,
    Tabs
} from "antd";
import { connect } from "react-redux";
import axios from "util/Api";
import {
    DEFAULT_API_ERROR
} from "../../constants/Common";
const { Title } = Typography;
const TabPane = Tabs.TabPane;

class DeviceSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: false
        };
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = async () => {
        const { form } = this.props;

        this.setState({ loading: true });
        try {
            let response = await axios.get(`/admin/config/device`);
            if (response.code === "OK") {
                this.setState({
                    loading: false,
                    data: response.data,
                    isEdit: response.data ? true : false
                });
                let data = response.data;
                let formVal = data;
                form.setFieldsValue(formVal);
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false, isEdit: false });
            console.log("ERROR   ", error);
        }
    };

    handleSubmit = async e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            let obj = values;

            let url = `/admin/config/device`;
            let method = `put`;

            try {
                let data = await axios[method](url, obj);
                if (data.code === "OK") {
                    message.success(`${data.message}`);
                    this.fetch();
                } else {
                    message.error(`${data.message}`);
                }
            } catch (error) {
                console.log("error", error);
                let errorMsg = (error && error.message) || DEFAULT_API_ERROR;
                message.error(errorMsg);
            }
        });
    };

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const { isEdit } = this.state;
        return (
            <>
                <div className="gx-module-box gx-module-box-100">
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <div>
                                <Title
                                    level={4}
                                    className="gx-mb-0 gx-d-inline-block"
                                >
                                    Device Config
                                </Title>
                            </div>
                        </Row>
                    </div>

                    <div className="gx-module-box-content">
                        <div className="gx-mt-3 project-config-tab">
                            <Form layout="vertical">
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="General Setting" key="1">
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Powered By">
                                                    {getFieldDecorator(
                                                        "poweredBy"
                                                    )(
                                                        <Input placeholder="Powered By" />
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col
                                                span={24}
                                                className="gx-text-right"
                                            >
                                                <span className="topbarCommonBtn">
                                                    <Button
                                                        style={{
                                                            display:
                                                                "inline-flex"
                                                        }}
                                                        type="primary"
                                                        htmlType="submit"
                                                        onClick={this.handleSubmit.bind(
                                                            this
                                                        )}
                                                    >
                                                        {isEdit
                                                            ? "Update"
                                                            : "Save"}
                                                    </Button>
                                                </span>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                </Tabs>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
const WrappedDeviceSetting = Form.create({ name: "DeviceSetting" })(
    DeviceSetting
);

const mapStateToProps = function(props) {
    return props;
};

export default connect(mapStateToProps)(WrappedDeviceSetting);
