import {
    Row, Table, Affix
} from 'antd';
import React, { Component } from 'react';
import { PAGE_PERMISSION, STATIC_PAGE_USER_TYPES, USER_TYPES, DEALER_LABEL } from '../../constants/Common';
import ActionButtons from '../../components/ActionButtons';
import UpsertForm from './upsert';
import axios from 'util/Api';
import { connect } from 'react-redux';
import View from './view';
import FilterDropdown from '../../components/FilterDropdown';
import UtilService from '../../services/util';
import IntlMessages from '../../util/IntlMessages';
const _ = require('lodash');
// import AddButton from '../../components/ESAddButton';



class StaticPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            total: 0,
            filter: { filter: {} },
            loginUser: this.props.auth && this.props.auth.authUser ? this.props.auth.authUser : null,
            modalVisible: false,
            viewId: null,
            showViewModal: false
        };
        this.language = props.settings.language;
        this.userType = STATIC_PAGE_USER_TYPES[0].value;
    }

    componentDidMount() {
        this.fetch();
        this.initializeTableColumns();
    }

    initializeTableColumns = () => {
        this.columns = [
            {
                title: <IntlMessages id="app.srNo" />,
                key: 'index',
                render: (text, record, index) => {
                    return index + 1;
                }
            },
            {
                title: <IntlMessages id="app.user.codeLabel" />,
                dataIndex: 'code'
            },
            {
                title: <IntlMessages id="app.staticpage.userType" />,
                dataIndex: 'userType',
                render: (text, record, index) => {
                    let userType = _.find(STATIC_PAGE_USER_TYPES, f => f.type && f.type === text);
                    let label = userType ? userType.label : '-';
                    if (text === USER_TYPES.FRANCHISEE && (record.code === "ABOUT_US" || record.code === "PRIVACY_POLICY")) {
                        label = <>{label} and {DEALER_LABEL} </>;
                    }
                    return label;

                }
            },
            {
                title: <IntlMessages id="app.staticpage.actions" />,
                align: 'center',
                width: '120px',
                render: (text, record) => {
                    return (
                        <ActionButtons
                            pageId={PAGE_PERMISSION.STATIC_PAGE}
                            view={() => {
                                return this.showViewModal(record.id);

                            }}
                            edit={() => {
                                return this.handleEdit(record.id);
                            }}
                        // deleteObj={{
                        //     documentId: record.id,
                        //     model: 'staticpage'
                        // }}
                        // deleteFn={(res) => {
                        //     if (res === 'success') {
                        //         this.fetch();
                        //     }
                        // }}
                        />
                    );
                }
            }
        ];
        if (this.props.auth.authUser.type === USER_TYPES.FRANCHISEE) {
            this.columns = _.filter(this.columns, e => e.dataIndex !== 'userType');
        }
    };

    fetch = async () => {
        this.setState((state) => {
            state.loading = true;
            state.total = 0;
            state.data = [];

            return state;
        });
        try {
            let response = await axios.post(
                'admin/static-page/paginate',
                this.state.filter
            );
            this.setState({
                total: response.data.list.length,
                loading: false,
                data: response.data.list
            });
        } catch (error) {
            console.log('Error****:', error.message);
            this.setState({ loading: false });
        }
    }

    handleEdit = (id) => {
        this.setState({
            modalVisible: true,
            id: id
        });
    };

    handleSubmit = () => {
        this.fetch();
        this.handleCancel();
    }

    handleCancel = () => {
        this.setState({
            id: null,
            modalVisible: false
        });
    };

    addData = () => {
        this.setState({
            modalVisible: true
        });
    };

    showViewModal(id) {
        this.setState({
            showViewModal: true,
            viewId: id
        });
    }

    hideViewModal() {
        this.setState({
            showViewModal: false
        });
    }
    handleSelection = (selectedVal, key, listData) => {
        let self = this;
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
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
    render() {
        let { data, loading } = this.state;
        let FilterArray = [
            {
                title: <IntlMessages id="app.browse" />,
                list: STATIC_PAGE_USER_TYPES,
                defaultSelected: this.userType,
                key: 'userType',
                visible: this.props.auth.authUser.type !== USER_TYPES.FRANCHISEE
            },
        ];
        return (
            <div className="gx-module-box gx-module-box-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.staticpage.staticPage" /></h1>
                            {/* <Row type="flex" justify="space-between">
                                <AddButton onClick={this.addData.bind(this)} text="Add" pageId={PAGE_PERMISSION.STATIC_PAGE} />
                            </Row> */}
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            <div className="DropdownWidth">
                                {
                                    FilterArray.map((filter) => {
                                        return (filter.visible &&
                                            <FilterDropdown
                                                title1={filter.title}
                                                list={filter.list}
                                                defaultSelected={
                                                    filter.defaultSelected
                                                }
                                                handleSelection={(val) => {
                                                    this.handleSelection(val, filter.key, filter.list);
                                                }}
                                            />
                                        );
                                    })
                                }
                            </div>
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content container">
                    <div className="RidersList RiderTableList">
                        <Table className="gx-table-responsive"
                            columns={this.columns} loading={loading}
                            dataSource={data}
                            rowKey="id"
                            onChange={this.handleChange}
                            pagination={false} />
                    </div>
                    {this.state.modalVisible &&
                        <UpsertForm
                            onCancel={this.handleCancel}
                            handleSubmit={this.handleSubmit}
                            id={this.state.id}
                            parentId={this.state.filter.parentId}
                        />
                    }
                    {
                        this.state.showViewModal && <View
                            id={this.state.viewId}
                            onCancel={this.hideViewModal.bind(this)}
                            language={this.language}
                        />
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(StaticPage);
