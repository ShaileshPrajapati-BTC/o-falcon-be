import React, { Component } from 'react';
import { Button, Row, Col, Card, Empty, Icon, message } from 'antd';
import { ReactComponent as AddButton } from '../../assets/svg/addButton.svg';
import ESDocumentUpsert from './upsert';
import { MASTER_CODES, BASE_URL } from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import axios from "util/Api";
import { Link } from 'react-router-dom';
import UtilService from '../../services/util';
// import FileViewer from 'react-file-viewer';
import FilterDropdown from '../../components/FilterDropdown';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');
class ESDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            loading: false,
            editdata: null,
            data: [],
            previewVisible: false,
            previewDocument: '',
            path: '',
            filter: {
                filter: {
                    isDeleted: false,
                    referenceId: props.id
                }
            },
            documents: []
        }
        this.type = 0;
        this.visible = this.state.documents.length > 1
    }
    componentDidMount = async () => {
        await this.getDocument();
        this.fetch();
    }
    getDocument = async () => {
        let obj = {
            masters: [MASTER_CODES.DOCUMENT],
            include: ['subMasters'],
        };
        try {
            let data = await axios.post('admin/master/list-by-code', obj);
            if (data.code === 'OK') {
                let brands = data.data;
                if (brands && brands[MASTER_CODES.DOCUMENT] && brands[MASTER_CODES.DOCUMENT].subMasters) {
                    let documents = [{ label: 'All', value: 0 }];

                    _.each(brands[MASTER_CODES.DOCUMENT].subMasters, (value, index) => {
                        documents.push({ label: value.name, value: index + 1, type: value.id });
                    });
                    this.setState({
                        documents: documents
                    });
                    this.visible = this.state.documents.length > 1
                }
            }
        } catch (error) {
            console.log('Error****:', error.message);
        }
    }
    fetch = async () => {
        try {
            this.setState({ loading: true });
            let response = await axios.post(`/admin/document/paginate`, this.state.filter);
            if (response.code === 'OK' && response.data.list) {
                this.setState({ data: response.data.list, loading: false });
            }
            else {
                this.setState({ data: [], loading: false });
            }

        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    };
    handleSelection = (selectedVal, isAscending, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState((state) => {
            if (data !== 'error') {
                state.filter.filter[key] = data.type;
            } else {
                delete state.filter.filter[key];
            }
        });
        self.fetch();
    };
    handelclick = () => {
        this.setState({
            modalVisible: true,
        });
    }
    handleSubmit = () => {
        this.handleCancel();
        this.fetch();
    };
    handleCancel = () => {
        this.setState({
            // id: null,
            modalVisible: false
        });
    };
    handelPreview = (path) => {
        if (path) {
            this.setState({
                previewVisible: true,
                previewDocument: path
            })
        }
    }
    handlePreviewCancel = () => {
        this.setState({
            previewVisible: false,
            previewDocument: ''
        });
    }
    deleteData = async (options) => {
        try {
            this.setState({ loading: true });
            let response = await axios.delete(`/admin/document/${options.documentId}`);
            if (response.code === 'OK') {
                message.success(`${response.message}`);
                this.setState({
                    loading: false,
                });
                this.fetch();
            } else {
                message.error(`${response.message}`);
                this.setState({ loading: false });
            }
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    render() {
        const { data } = this.state;
        let FilterArray = [
            {
                title: <IntlMessages id="app.partner.documentType" defaultMessage="Document Type" />,
                list: this.state.documents,
                defaultSelected: this.type,
                key: 'type',
                visible: this.visible
            }
        ];
        return (
            <>
                <Row style={{ float: 'right', marginRight: '1px' }}>
                    <div className="SearchBarwithBtn" >
                        <div className="topbarCommonBtn" >
                            <Button type="primary" onClick={this.handelclick}>
                                <span>
                                    <AddButton />
                                </span>
                                <span><IntlMessages id="app.add" defaultMessage="Add" /></span>
                            </Button>
                        </div>
                    </div>
                </Row>
                <Row
                    type="flex"
                    align="middle"
                    justify="space-between"
                    style={{ marginTop: 10 }}
                >
                    <div className="DropdownWidth vehicleDropdownWidth">
                        {FilterArray.map((filter) => {
                            return (filter.visible && <FilterDropdown
                                title1={filter.title}
                                list={filter.list}
                                sorter={filter && filter.sorter}
                                isDesc={filter && filter.isDesc}
                                defaultSelected={
                                    filter.defaultSelected
                                }
                                handleSelection={(
                                    val,
                                    isAscending
                                ) => {
                                    this.handleSelection(
                                        val,
                                        isAscending,
                                        filter.key,
                                        filter.list
                                    );
                                }}
                            />
                            );
                        })}
                    </div>
                </Row>
                {data &&
                    <Row style={{ marginTop: '30px' }}>
                        {data.length ? data.map((record) => {
                            return <Col lg={8} md={12} sm={24} xs={24} style={{ marginBottom: '8px' }}>
                                <Card className="vehicleListing bankcard"
                                    key={record.id}
                                    title={record.type && record.type.name ? record.type.name : ''}
                                    size="small"
                                    extra={<div style={{ marginRight: '14px' }}>
                                        <ActionButtons
                                            // pageId={PAGE_PERMISSION.FRANCHISEE}
                                            deleteMsg="Sure to delete this Document?"
                                            deleteObj={{
                                                documentId: record.id,
                                                page: 'bankdetail',
                                                isSoftDelete: true
                                            }}
                                            deleteFn={res => { this.deleteData(res); }}
                                        />
                                        <div className="scooterIC" style={{ float: 'right', marginLeft: '8px' }}>
                                            <Link to={{ pathname: `${BASE_URL}${record.path}` }} download target="_blank">
                                                <Icon type="download" />
                                            </Link>
                                        </div>
                                        <div className="scooterIC" style={{ float: 'right' }}>
                                            <Link to={{ pathname: `${BASE_URL}${record.path}` }} target="_blank">
                                                <Icon type="eye" />
                                            </Link>
                                        </div>
                                    </div>}
                                >
                                    {record.name !== '' &&
                                        <div className="scooterID" style={{ justifyContent: 'flex-start' }}>
                                            <div className="lbl" style={{ marginLeft: '0px' }}><IntlMessages id="app.partner.routingNumberLabel" defaultMessage="Routing Number" />Doc Name:</div>
                                            <div className="ids" >
                                                {record.name}
                                            </div>
                                        </div>}
                                    {/* <img src={record.path ? record.path : null} alt="" style={{
                                        maxWidth: '100 %',
                                        height: 'auto'
                                    }} /> */}
                                    <div className="scooterID" style={{ justifyContent: 'flex-start' }}>
                                        <div className="lbl" style={{ marginLeft: '0px' }}><IntlMessages id="app.partner.uploadedAt" defaultMessage="Uploaded At" />:</div>
                                        <div className="ids" >
                                            {UtilService.displayDate(record.createdAt)}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        }) :
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: 'auto' }} />}
                    </Row>
                }
                {this.state.modalVisible && (
                    <ESDocumentUpsert
                        id={this.props.id}
                        handleSubmit={this.handleSubmit}
                        onCancel={this.handleCancel}
                    />
                )}
            </>
        );
    }
}
export default ESDocument;