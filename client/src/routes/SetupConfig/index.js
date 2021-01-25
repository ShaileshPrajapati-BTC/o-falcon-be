import React, { Component } from "react";
import {
    Button,
    Form,
    Input,
    Row,
    Typography,
    Col,
    message,
    Select,
    Tabs,
    Card
} from "antd";
import { connect } from "react-redux";
import axios from "util/Api";
import {
    DEFAULT_API_ERROR,
    DEFAULT_PAYMENT_METHOD,
    SMS_METHOD
} from "../../constants/Common";
const { Title } = Typography;
const TabPane = Tabs.TabPane;

class SetupConfig extends Component {
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
            let response = await axios.get(`admin/config/setup`);
            if (response.code === "OK") {
                this.setState({
                    loading: false,
                    data: response.data,
                    isEdit: response.data ? true : false
                });
                let data = response.data;

                form.setFieldsValue(data);
            }
            this.setState({ loading: false });
        } catch (error) {
            this.setState({ loading: false, isEdit: false });
            console.log("ERROR   ", error);
        }
    };
    handleEmail = e => {
        let val = e.target.value.split(",");

        this.setState({
            requestEmail: val
        });
    };
    handleSubmit = async e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (err) {
                return false;
            }
            let obj = values;
            Object.keys(obj).map(
                k =>
                    (obj[k] =
                        typeof obj[k] == "string" ? obj[k].trim() : obj[k])
            );
            let url = `admin/config/setup`;
            let method = `put`;

            try {
                let data = await axios[method](url, values);
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

        const cardStyle = [{ marginBottom: 0, borderTop: 0 }, { padding: '0px 0px 0px 25px' }, { borderBottom: 0 }]
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
                                    Setup config
                                </Title>
                            </div>
                        </Row>
                    </div>

                    <div className="gx-module-box-content">
                        <div className="gx-mt-3 setup-tab">
                            <Form layout="vertical">
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="General Setting" key="1">
                                        <Card title={<b>Mail</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Mail Auth User">
                                                        {getFieldDecorator(
                                                            "mailAuthUser"
                                                        )(
                                                            <Input placeholder="Mail Auth User" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Mail Auth Password">
                                                        {getFieldDecorator(
                                                            "mailAuthPass"
                                                        )(
                                                            <Input placeholder="Mail Auth Password" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>


                                        <Card title={<b>One Signal</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="One Signal User AuthKey">
                                                        {getFieldDecorator(
                                                            "oneSignalUserAuthKey"
                                                        )(
                                                            <Input placeholder="One Signal User AuthKey" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="One Signal App Auth Key">
                                                        {getFieldDecorator(
                                                            "oneSignalAppAuthKey"
                                                        )(
                                                            <Input placeholder="One Signal App Auth Key" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="One Signal AppId">
                                                        {getFieldDecorator(
                                                            "oneSignalAppId"
                                                        )(
                                                            <Input placeholder="One Signal AppId" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>
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
                                    <TabPane tab="Payment" key="2">


                                        <Card title={<b>Default</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Default Payment Method">
                                                        {getFieldDecorator(
                                                            "defaultPaymentMethod"
                                                        )(
                                                            <Select placeholder="Select type">
                                                                {DEFAULT_PAYMENT_METHOD.map(
                                                                    val => {
                                                                        return (
                                                                            <Select.Option
                                                                                key={
                                                                                    val
                                                                                }
                                                                                value={
                                                                                    val
                                                                                }
                                                                            >
                                                                                {
                                                                                    val
                                                                                }
                                                                            </Select.Option>
                                                                        );
                                                                    }
                                                                )}
                                                            </Select>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>Stripe</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Stripe SecretKey">
                                                        {getFieldDecorator(
                                                            "stripeSecretKey"
                                                        )(
                                                            <Input placeholder="Stripe SecretKey" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>NoQoodyPay</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start">

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="NoQoodyPay Project Code">
                                                        {getFieldDecorator(
                                                            "noqoodypayProjectCode"
                                                        )(
                                                            <Input placeholder="NoQoodyPay Project Code" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="NoQoodyPay Payment Url">
                                                        {getFieldDecorator(
                                                            "noqoodypayPaymentUrl"
                                                        )(
                                                            <Input placeholder="NoQoodyPay Payment Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="NoQoodyPay Payment Token">
                                                        {getFieldDecorator(
                                                            "noqoodypayPaymentToken"
                                                        )(
                                                            <Input placeholder="NoQoodyPay Payment Token" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="NoQoodyPay Pay Username">
                                                        {getFieldDecorator(
                                                            "noqoodypayUsername"
                                                        )(
                                                            <Input placeholder="NoQoodyPay Username" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="NoQoodyPay Pay Password">
                                                        {getFieldDecorator(
                                                            "noqoodypayPassword"
                                                        )(
                                                            <Input placeholder="NoQoodyPay Password" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="NoQoodyPay Pay GrantType">
                                                        {getFieldDecorator(
                                                            "noqoodypayGrantType"
                                                        )(
                                                            <Input placeholder="NoQoodyPay GrantType" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

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

                                    <TabPane tab="IoT Setting" key="3">

                                        <Card title={<b>Mqtt Manufacurer</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>

                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Mqtt Manufacurer">
                                                        {getFieldDecorator(
                                                            "mqttManufacturer"
                                                        )(
                                                            <Input placeholder="Mqtt Manufacurer" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>Ninebot</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot US Setting URL">
                                                        {getFieldDecorator(
                                                            "nineBotUsSettingUrl"
                                                        )(
                                                            <Input placeholder="Ninebot US Setting URL" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot US Setting ClientId">
                                                        {getFieldDecorator(
                                                            "nineBotUsSettingClientId"
                                                        )(
                                                            <Input placeholder="Ninebot US Setting ClientId" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot US Setting AuthToken">
                                                        {getFieldDecorator(
                                                            "nineBotUsSettingAuthToken"
                                                        )(
                                                            <Input placeholder="Ninebot US Setting AuthToken" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot US Setting ClientSecret">
                                                        {getFieldDecorator(
                                                            "nineBotUsSettingClientSecret"
                                                        )(
                                                            <Input placeholder="Ninebot US Setting ClientSecret" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot EU Setting URL">
                                                        {getFieldDecorator(
                                                            "nineBotEuSettingUrl"
                                                        )(
                                                            <Input placeholder="Ninebot EU Setting URL" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot EU Setting ClientId">
                                                        {getFieldDecorator(
                                                            "nineBotEuSettingClientId"
                                                        )(
                                                            <Input placeholder="Ninebot EU Setting ClientId" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot EU Setting AuthToken">
                                                        {getFieldDecorator(
                                                            "nineBotEuSettingAuthToken"
                                                        )(
                                                            <Input placeholder="Ninebot EU Setting AuthToken" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Ninebot EU Setting ClientSecret">
                                                        {getFieldDecorator(
                                                            "nineBotEuSettingClientSecret"
                                                        )(
                                                            <Input placeholder="Ninebot EU Setting ClientSecret" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>Omni</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Omni Setting SignIn Url">
                                                        {getFieldDecorator(
                                                            "omniSettingSignInUrl"
                                                        )(
                                                            <Input placeholder="Omni Setting SignIn Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Omni Setting Callback Url">
                                                        {getFieldDecorator(
                                                            "omniSettingCallbackUrl"
                                                        )(
                                                            <Input placeholder="Omni Setting Callback Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Omni Setting Email">
                                                        {getFieldDecorator(
                                                            "omniSettingEmail"
                                                        )(
                                                            <Input placeholder="Omni Setting Email" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row type="flex" justify="start"  >

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Omni Setting Password">
                                                        {getFieldDecorator(
                                                            "omniSettingPassword"
                                                        )(
                                                            <Input placeholder="Omni Setting Password" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>Coruscate</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start">
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Coruscate Iot Setting SignIn Url">
                                                        {getFieldDecorator(
                                                            "coruscateIotSettingSignInUrl"
                                                        )(
                                                            <Input placeholder="Coruscate Iot Setting SignIn Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Coruscate Iot Setting Callback Url">
                                                        {getFieldDecorator(
                                                            "coruscateIotSettingCallbackUrl"
                                                        )(
                                                            <Input placeholder="Coruscate Iot Setting Callback Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Coruscate Iot Setting Email">
                                                        {getFieldDecorator(
                                                            "coruscateIotSettingEmail"
                                                        )(
                                                            <Input placeholder="Coruscate Iot Setting Callback Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Row type="flex" justify="start">
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Coruscate Iot Setting Password">
                                                        {getFieldDecorator(
                                                            "coruscateIotSettingPassword"
                                                        )(
                                                            <Input placeholder="Coruscate Iot Setting Password" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Coruscate Iot Setting Username">
                                                        {getFieldDecorator(
                                                            "coruscateIotSettingUsername"
                                                        )(
                                                            <Input placeholder="Coruscate Iot Setting Username" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Coruscate Iot Setting Auth Token">
                                                        {getFieldDecorator(
                                                            "coruscateIotSettingAuthToken"
                                                        )(
                                                            <Input placeholder="Coruscate Iot Setting Auth Token" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

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
                                    <TabPane tab="Google Api" key="4">
                                        <Row type="flex" justify="start">
                                            <Col lg={8} md={12} sm={12} xs={24}>
                                                <Form.Item label="Google Api Key">
                                                    {getFieldDecorator(
                                                        "googleApiKey"
                                                    )(
                                                        <Input placeholder="Google Api Key" />
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

                                    <TabPane tab="SMS Setting" key="5">

                                        <Card title={<b>SMS</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>

                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="SMS Method">
                                                        {getFieldDecorator(
                                                            "defaultSmsMethod"
                                                        )(
                                                            <Select placeholder="Select type">
                                                                {SMS_METHOD.map(
                                                                    val => {
                                                                        return (
                                                                            <Select.Option
                                                                                key={
                                                                                    val
                                                                                }
                                                                                value={
                                                                                    val
                                                                                }
                                                                            >
                                                                                {
                                                                                    val
                                                                                }
                                                                            </Select.Option>
                                                                        );
                                                                    }
                                                                )}
                                                            </Select>
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Auto deduct otp hash code">
                                                        {getFieldDecorator(
                                                            "autoDetectOtpHashCode"
                                                        )(
                                                            <Input placeholder="Enter auto deduct otp hash code" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>Default</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>

                                            <Row type="flex" justify="start"  >

                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="SMS Url">
                                                        {getFieldDecorator(
                                                            "smsUrl"
                                                        )(
                                                            <Input placeholder="SMS Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="SMS LoginId">
                                                        {getFieldDecorator(
                                                            "smsLoginId"
                                                        )(
                                                            <Input placeholder="SMS LoginId" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="SMS Password">
                                                        {getFieldDecorator(
                                                            "smsPassword"
                                                        )(
                                                            <Input placeholder="SMS Password" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="SMS Uniq Code">
                                                        {getFieldDecorator(
                                                            "smsUnicode"
                                                        )(
                                                            <Input placeholder="SMS Uniq Code" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="SMS Sender Name">
                                                        {getFieldDecorator(
                                                            "smsSenderName"
                                                        )(
                                                            <Input placeholder="SMS Sender Name" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>Twilio</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>
                                            <Row type="flex" justify="start"  >
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Twilio Account Id">
                                                        {getFieldDecorator(
                                                            "twilioAccountSid"
                                                        )(
                                                            <Input placeholder="Twilio Account Id" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Twilio Auth Token">
                                                        {getFieldDecorator(
                                                            "twilioAuthToken"
                                                        )(
                                                            <Input placeholder="Twilio Auth Token" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Twilio From Number">
                                                        {getFieldDecorator(
                                                            "twilioFromNumber"
                                                        )(
                                                            <Input placeholder="Twilio Fron Number" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

                                        <Card title={<b>AWS SNS</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>

                                            <Row type="flex" justify="start"  >
                                                <Col lg={4} md={12} sm={12} xs={24}>
                                                    <Form.Item label="AWS SNS Region">
                                                        {getFieldDecorator(
                                                            "awsSnsRegion"
                                                        )(
                                                            <Input placeholder="AWS SNS Region" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="AWS SNS Access key ID">
                                                        {getFieldDecorator(
                                                            "awsSnsAccessKeyId"
                                                        )(
                                                            <Input placeholder="AWS SNS Access key ID" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="AWS SNS Secret Access Key">
                                                        {getFieldDecorator(
                                                            "awsSnsSecretAccessKey"
                                                        )(
                                                            <Input placeholder="AWS SNS Secret Access Key" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="AWS SNS App Id">
                                                        {getFieldDecorator(
                                                            "awsSnsAppId"
                                                        )(
                                                            <Input placeholder="AWS SNS AppId" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>
                                        <Card title={<b>OOREDOO</b>} style={cardStyle[0]} bodyStyle={cardStyle[1]} headStyle={cardStyle[2]}>

                                            <Row type="flex" justify="start"  >
                                                <Col lg={4} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Url">
                                                        {getFieldDecorator(
                                                            "ooredooUrl"
                                                        )(
                                                            <Input placeholder="Url" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Customer Id">
                                                        {getFieldDecorator(
                                                            "ooredooCustomerId"
                                                        )(
                                                            <Input placeholder="Customer Id" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={8} md={12} sm={12} xs={24}>
                                                    <Form.Item label="User Name">
                                                        {getFieldDecorator(
                                                            "ooredooUsername"
                                                        )(
                                                            <Input placeholder="User Name" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="User Password">
                                                        {getFieldDecorator(
                                                            "ooredooUserpassword"
                                                        )(
                                                            <Input placeholder="Password" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Originator">
                                                        {getFieldDecorator(
                                                            "ooredooOriginator"
                                                        )(
                                                            <Input placeholder="Originator" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                                <Col lg={6} md={12} sm={12} xs={24}>
                                                    <Form.Item label="Message Type">
                                                        {getFieldDecorator(
                                                            "ooredooMessageType"
                                                        )(
                                                            <Input placeholder="Message Type" />
                                                        )}
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Card>

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
const WrappedSetupConfig = Form.create({ name: "SetupConfig" })(SetupConfig);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedSetupConfig);
