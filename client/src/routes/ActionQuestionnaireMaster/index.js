import { Collapse, Empty, Row, Spin, Affix } from "antd";
import React, { Component } from "react";
import ActionButtons from "../../components/ActionButtons";
import ActiveDeactive from "../../components/custom/ActiveDeactive";
import CustomScrollbars from "../../util/CustomScrollbars";
import FilterDropdown from "../../components/FilterDropdown";
import Search from "../../components/ESSearch";
import { STATUS_TYPES, FILTER_BY_ACTIVE, PAGE_PERMISSION, FILTER_BY_QUESTION_TYPES, USER_TYPES, QUESTION_TYPE } from "../../constants/Common";

import axios from "util/Api";
import AddButton from "../../components/ESAddButton";
import ESTag from "../../components/ESTag";
import { connect } from "react-redux";
import UtilService from "../../services/util";
import IntlMessages from "../../util/IntlMessages";

const { Panel } = Collapse;
const _ = require("lodash");
class ActionQuestionnaireMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            total: 0,
            filter: {
                isDeleted: false,
                filter: {
                    addedBy: null
                }
            }
        };
        this.questionTypeFilter = FILTER_BY_QUESTION_TYPES;
        if (this.props.auth.authUser.type === USER_TYPES.DEALER) {
            this.questionTypeFilter = _.filter(this.questionTypeFilter, f => f.type !== QUESTION_TYPE.SERVICE_REQUEST)
        }
        this.filterByAQStatus = [
            { label: <IntlMessages id="app.all" />, value: 1 },
            { label: <IntlMessages id="app.active" />, value: 2, isActive: STATUS_TYPES.ACTIVE },
            { label: <IntlMessages id="app.deactive" />, value: 3, isActive: STATUS_TYPES.DEACTIVE }
        ];
        let redirectFilter = this.props.location.filter;
        this.isActive = redirectFilter && redirectFilter.filter && redirectFilter.filter.isActive
            ? _.find(FILTER_BY_ACTIVE, f => f.type === redirectFilter.filter.isActive).value
            : 1;
        this.type = redirectFilter && redirectFilter.filter && redirectFilter.filter.type
            ? _.find(this.questionTypeFilter, f => f.type === redirectFilter.filter.type).value
            : 1;
    }
    componentDidMount() {
        let self = this;
        if (this.props.auth.authUser.type === USER_TYPES.FRANCHISEE || this.props.auth.authUser.type === USER_TYPES.DEALER) {
            this.setState((state) => {
                state.filter.filter.addedBy = this.props.auth.authUser.id;
            })
        }
        let filter = this.props.location.filter;
        if (filter) {
            this.setState({ filter: filter, paginate: false }, () => {
                self.fetch();
            });
        } else {
            this.fetch();
        }
    }

    fetch = async () => {
        this.setState({
            loading: true,
            data: [],
            count: 0
        });
        try {
            let response = await axios.post(
                "admin/actionquestionnaire/paginate",
                this.state.filter
            );
            this.setState({
                data: response.data,
                total: response.data.length,
                loading: false
            });
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };

    handleChange = (pagination, filters, sorter) => {
        console.log("Various parameters", pagination, filters, sorter);
        this.setState({
            sortedInfo: sorter
        });
    };
    handleDelete = async record => {
    };
    onSearch = newState => {
        this.setState(
            {
                filter: newState
            },
            () => {
                this.fetch();
            }
        );
    };
    handleSelection = (selectedVal, key, listData) => {
        let obj = {
            selectedVal: selectedVal,
            key: key,
            listData: listData
        };
        let self = this;
        let data = UtilService.commonFilter(obj);
        self[key] = selectedVal;
        self.setState(
            state => {
                if (data !== "error") {
                    state.filter.filter[key] = data.type;
                } else {
                    delete state.filter.filter[key];
                }
            },
            () => self.fetch()
        );
    };

    render() {
        const { data, loading } = this.state;

        let FilterArray = [
            {
                title: <IntlMessages id="app.type" />,
                list: this.questionTypeFilter,
                defaultSelected: this.type,
                key: "type",
                visible: true,
            },
            {
                title: <IntlMessages id="app.status" />,
                list: FILTER_BY_ACTIVE,
                defaultSelected: this.isActive,
                key: "isActive",
                visible: true,
            }
        ];

        return (
            <div className="gx-module-box gx-mw-100 gx-mr-3">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.sidebar.actionQuestionnaire" /></h1>
                            <Row>
                                <div className="SearchBarwithBtn">
                                    <Search
                                        handelSearch={this.onSearch}
                                        filter={this.state.filter}
                                        keys={["question"]}
                                        placeholder="Search by question"
                                    />
                                </div>
                                <AddButton
                                    link="/e-scooter/general-settings/actionquestionnairemaster/upsert"
                                    text={<IntlMessages id="app.add"/>}
                                    pageId={PAGE_PERMISSION.ACTION_QUESTIONNAIRE}
                                    filter={this.state.filter}
                                />
                            </Row>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            <div className="DropdownWidth">
                                {FilterArray.length > 0 && FilterArray.map(filter => {
                                    console.log('filter :>> ', filter);
                                    return (filter.visible &&
                                        <FilterDropdown
                                            title1={filter.title}
                                            list={filter.list}
                                            key={filter.key}
                                            defaultSelected={filter.defaultSelected}
                                            handleSelection={(val) => {
                                                this.handleSelection(val, filter.key, filter.list);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content">
                    <Spin spinning={loading} delay={100}>
                        {data && data.length ? (
                            <CustomScrollbars className="gx-module-content-scroll">
                                <Collapse
                                    bordered={false}
                                    defaultActiveKey={["1"]}
                                    loading={loading}
                                >
                                    {data.map((record, index) => {
                                        return (
                                            <Panel
                                                header={`${`Q:${index + 1}` +
                                                    " "}${record.question}`}
                                                extra={
                                                    <div className="zoneList" style={{ display: 'flex' }}>
                                                        {record.type && <ESTag
                                                            status={record.type}
                                                            filterArray={this.questionTypeFilter}
                                                        />}
                                                        <div className="action-btnsWithSignupDate">
                                                            <div className="ActionNotification zoneActionButton">
                                                                <ActiveDeactive
                                                                    documentId={
                                                                        record.id
                                                                    }
                                                                    isActive={
                                                                        record.isActive
                                                                    }
                                                                    onSuccess={this.fetch.bind(
                                                                        this
                                                                    )}
                                                                    model="actionquestionnairemaster"
                                                                />

                                                                <ActionButtons
                                                                    pageId={
                                                                        PAGE_PERMISSION.ACTION_QUESTIONNAIRE
                                                                    }
                                                                    edit={`/e-scooter/general-settings/actionquestionnairemaster/upsert/${record.id}`}
                                                                    deleteObj={{
                                                                        documentId:
                                                                            record.id,
                                                                        model:
                                                                            "actionquestionnairemaster",
                                                                        isDelete: true
                                                                    }}
                                                                    deleteFn={res => {
                                                                        if (
                                                                            res ===
                                                                            "success"
                                                                        ) {
                                                                            this.fetch();
                                                                        }
                                                                    }}
                                                                    filter={this.state.filter}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                key={index + 1}
                                            >
                                                <p>
                                                    <IntlMessages id="app.textBoxThisIsSimple"/>
                                                </p>
                                            </Panel>
                                        );
                                    })}
                                </Collapse>
                            </CustomScrollbars>
                        ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                    </Spin>
                </div>
            </div>
        );
    }
}

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(ActionQuestionnaireMaster);
