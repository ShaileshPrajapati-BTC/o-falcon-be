import React, { Component } from 'react';
import { Button, Empty, Card, Row, Col, Tag, message } from 'antd';
import { ReactComponent as AddButton } from '../../assets/svg/addButton.svg';
import ESBankUpsertForm from './upsert';
import axios from "util/Api";
import ActionButtons from '../ActionButtons';
import IntlMessages from '../../util/IntlMessages';

class ESBankDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            editdata: null,
            loading: false,
            data: [],
            id: '',
            filter: { userId: this.props.id }
        };
    }

    componentDidMount() {
        this.fetch();
    }
    fetch = async () => {
        this.setState({ loading: true });
        try {
            let response = await axios.post('admin/payment/user-bank-account', this.state.filter);
            if (response.code === 'OK') {
                response.data.list.sort((a, b) => b.isPrimary - a.isPrimary) // isPrimary true willbe first
                this.setState({ data: response.data.list, loading: false });
            }
            else {
                this.setState({ data: [], loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }
    deleteData = async (options) => {
        let obj = { bankAccountId: options.documentId, userId: this.props.id }
        this.setState({ loading: true });
        try {
            let response = await axios.post('/admin/payment/remove-bank-account', obj);
            if (response.code === 'OK') {
                this.setState({
                    loading: false,
                });
                this.fetch();
                message.success(response.message)
            }
        } catch (error) {
            this.setState({ loading: false });
            message.success(error.message)
        }
    }

    handleModal = (data) => {
        this.setState(preState => ({
            isModalVisible: !preState.isModalVisible, editdata: data ? data : null
        }))
        this.fetch()
    }
    handleCancel = () => this.setState({ isModalVisible: false })

    handelPrimary = async (id) => {
        let obj = { bankAccountId: id, userId: this.props.id }
        try {
            let response = await axios.post('/admin/payment/default-bank-account', obj);
            if (response.code === 'OK') {
                message.success(response.message)
                this.fetch();
            }
        } catch (error) {
            this.setState({ loading: false });
            message.error(error.message)
        }
    }
    render() {
        let { data } = this.state;
        return (
            <>
                <div className="topbarCommonBtn" style={{ float: 'right' }}>
                    <Button type="primary" onClick={() => this.handleModal(null)}>
                        <span>
                            <AddButton />
                        </span>
                        <span> <IntlMessages id="app.add" defaultMessage="Add" /></span>
                    </Button>
                </div>
                {data &&
                    <Row style={{ marginTop: '40px' }}>
                        {data.length ? data.map((record) => {

                            return <Col lg={12} md={12} sm={24} xs={24} style={{ marginBottom: '8px' }}>
                                <Card className="vehicleListing bankcard"
                                    key={record.id}
                                    title={record.bankId.name}
                                    size="small"
                                    extra={record.isPrimary === true ?
                                        <Tag color="green">primary</Tag> :
                                        <>
                                            <Tag color="red" onClick={() => this.handelPrimary(record.id)} className="gx-pointer">
                                                <IntlMessages id="app.partner.setPrimary" defaultMessage="set primary" />
                                            </Tag>
                                            <ActionButtons
                                                edit={() => {
                                                    return this.handleModal(record);
                                                }}
                                                deleteMsg="Sure to delete this Bank Details?"
                                                deleteObj={{
                                                    documentId: record.id,
                                                    page: 'bankdetail',
                                                    isSoftDelete: false
                                                }}
                                                deleteFn={res => { this.deleteData(res); }}
                                            />
                                        </>}
                                >
                                    <div className="scooterID" style={{ justifyContent: 'flex-start' }}>
                                        <div className="lbl" style={{ marginLeft: '0px' }}><IntlMessages id="app.partner.accountHolderName" defaultMessage="Account Holder Name" />:</div>
                                        <div className="ids" >
                                            {record.accountHolderName}
                                        </div>
                                    </div>
                                    <div className="scooterID" style={{ justifyContent: 'flex-start' }}>
                                        <div className="lbl" style={{ marginLeft: '0px' }}><IntlMessages id="app.partner.accountNumber" defaultMessage="Account Number" />:</div>
                                        <div className="ids" >
                                            {record.accountNumber}
                                        </div>
                                    </div>
                                    <div className="scooterID" style={{ justifyContent: 'flex-start' }}>
                                        <div className="lbl" style={{ marginLeft: '0px' }}><IntlMessages id="app.partner.routingNumber" defaultMessage="Routing Number" />:</div>
                                        <div className="ids" >
                                            {record.routingNumber}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        }) :
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 'auto' }} />}
                    </Row>}

                {this.state.isModalVisible && (
                    <ESBankUpsertForm
                        data={this.state.editdata}
                        handleSubmit={this.handleModal}
                        onCancel={this.handleCancel}
                        id={this.props.id}
                    />
                )}
            </>
        );
    }
}
export default ESBankDetail;