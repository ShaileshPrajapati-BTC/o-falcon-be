import { Icon, Row, Tooltip, message, Empty, Affix } from "antd";
import React, { Component } from "react";
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove
} from "react-sortable-hoc";
import ActionButtons from "../../components/ActionButtons";
import AddButton from "../../components/ESAddButton";
import ESPagination from "../../components/ESPagination";
import UpsertForm from "./upsert";
import Search from "../../components/ESSearch";
import axios from "util/Api";
import {
    PAGE_PERMISSION, BASE_URL
} from "../../constants/Common";
import IntlMessages from "../../util/IntlMessages";


const DragHandle = SortableHandle(() => {
    return (
        <Tooltip
            title={<IntlMessages id="app.procedure.dragToChangeSequence" />}
            placement="topLeft"
            arrowPointAtCenter={true}
        >
            <span
                className="gx-draggable-icon gx-text-dark"
                style={{ marginTop: 12 }}
            >
                <Icon type="drag" />
            </span>
        </Tooltip>
    );
});

const SortableItem = SortableElement(({ parent, indexNo, value }) => {
    return (
        <tr key={indexNo} className="ant-table-row ant-table-row-level-0">
            <td>{indexNo + 1}</td>
            <td>{value.name}</td>
            <td>{value.description}</td>
            <td>
                <Icon type="file-pdf" onClick={parent.handelViewPdf.bind(parent, value.path)} />
            </td>
            <td>
                <div className="scooterActionItem">
                    {parent.state.data.length > 1 && <DragHandle />}
                    <ActionButtons
                        pageId={PAGE_PERMISSION.PROCEDURE}
                        edit={parent.handleEdit.bind(parent, value)}
                        deleteObj={{
                            documentId: value.id,
                            model: "procedure"
                        }}
                        deleteFn={res => {
                            if (res.toString() === "success") {
                                parent.setState(state => {
                                    state.filter.page = 1;
                                    state.paginate = false;
                                });
                                parent.fetch();
                            }
                        }}
                    />
                </div>
            </td>
        </tr>
    );
});

const SortableList = SortableContainer(({ items, parent }) => {
    return (
        <div className="RidersList RiderTableList">
            <table className="gx-w-100">
                <thead className="ant-table-thead">
                    <tr>
                        <th className="ant-table-header-column"><IntlMessages id="app.no" /></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.name" /></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.description" /></th>
                        <th className="ant-table-header-column"><IntlMessages id="app.path" /></th>
                        <th className="scooterActionItem"><IntlMessages id="app.action" /></th>
                    </tr>
                </thead>
                <tbody className="ant-table-tbody">
                    {items.map((value, index) => {
                        return (
                            <SortableItem
                                key={`item-${index}`}
                                parent={parent}
                                index={index}
                                indexNo={index}
                                value={value}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
});

class Procedure extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false,
            total: 0,
            filter: {
                page: 1,
                limit: 15,
                filter: {
                    // vehicleType: FILTER_BY_VEHICLE_TYPE[DEFAULT_VEHICLE].type
                }
            },
            modalVisible: false,
            loginUser:
                this.props.auth && this.props.auth.authUser
                    ? this.props.auth.authUser
                    : null,
            paginate: false
        };
    }
    componentDidMount() {
        this.fetch();
    }

    fetch = async page => {
        this.setState(state => {
            state.loading = true;
            state.total = 0;
            state.data = [];

            return state;
        });
        if (page) {
            this.setState(state => {
                state.filter.page = page;

                return state;
            });
        }
        try {
            let response = await axios.post(
                "admin/procedure/paginate",
                this.state.filter
            );
            this.setState({
                total: response.data.list.length,
                loading: false,
                data: response.data.list,
                paginate: true
            });
        } catch (error) {
            console.log("Error****:", error.message);
            this.setState({ loading: false });
        }
    };
    handleEdit = record => {
        this.setState({
            modalVisible: true,
            id: record.id
        });
    };
    handelViewPdf = (path) => {
        let path1 = `${BASE_URL}${path}`;
        let win = window.open(path1, '_blank');
        win.focus();
    }
    handleSubmit = () => {
        this.setState(state => {
            state.filter.page = 1;
            state.paginate = false;
        });
        this.fetch();
        this.handleCancel();
    };

    handleCancel = () => {
        this.setState({
            id: null,
            modalVisible: false
        });
    };

    onSearch = newState => {
        this.setState(
            {
                filter: newState,
                paginate: false
            },
            () => {
                this.fetch();
            }
        );
    };

    addData = () => {
        this.setState({
            modalVisible: true
        });
    };

    handleChange = (pagination, filters, sorter) => {
        console.log("Various parameters", pagination, filters, sorter);
        this.setState({
            sortedInfo: sorter
        });
    };

    onSortEnd = ({ oldIndex, newIndex }, e) => {
        e.stopPropagation();
        if (oldIndex === newIndex) {
            return;
        }

        this.setState(
            ({ data }) => {
                return {
                    data: arrayMove(data, oldIndex, newIndex)
                    // updateSequence: true
                };
            },
            () => {
                // let seq = [];

                console.log(this.state.data);
                const seq = this.state.data.map((v, index) => {
                    // seq.push({
                    //     id: v.id,
                    //     sequence: index + 1
                    // });

                    return {
                        id: v.id,
                        sequence: index + 1
                    }
                });

                const obj = { sequences: seq };

                axios
                    .post("admin/procedure/bulk-sequence-update", obj)
                    .then(data => {
                        if (data.code === "OK") {
                            message.success(`${data.message}`);
                        } else {
                            message.error(`${data.message}`);
                        }
                    })
                    .catch(error => {
                        let errMsg = error.message;
                        message.error(`${errMsg}`);
                    });
            }
        );
    };

    render() {
        let { data, loading } = this.state;

        return (
            <div className="gx-module-box gx-mw-100">
                <Affix offsetTop={1}>
                    <div className="gx-module-box-header">
                        <Row type="flex" align="middle" justify="space-between">
                            <h1 className="pageHeading"><IntlMessages id="app.procedure.procedure" /></h1>

                            <div className="SearchBarwithBtn">
                                <Search
                                    handelSearch={this.onSearch}
                                    filter={this.state.filter}
                                    keys={["name"]}
                                    placeholder="Search by Name"
                                />
                                <AddButton
                                    onClick={this.addData.bind(this)}
                                    text={<IntlMessages id="app.add"/>}
                                    pageId={PAGE_PERMISSION.PROCEDURE}
                                />
                            </div>
                        </Row>
                        <Row
                            type="flex"
                            align="middle"
                            justify="space-between"
                            style={{ marginTop: 20 }}
                        >
                            {this.state.paginate ? (
                                <ESPagination
                                    limit={this.state.filter.limit}
                                    total={this.state.total}
                                    fetch={this.fetch.bind(this)}
                                />
                            ) : null}
                        </Row>
                    </div>
                </Affix>
                <div className="gx-module-box-content container">
                    {data.length ? (
                        <SortableList
                            items={data}
                            onSortEnd={this.onSortEnd}
                            useDragHandle={true}
                            lockToContainerEdges={true}
                            parent={this}
                            loading={loading}
                        />
                    ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    {this.state.modalVisible && (
                        <UpsertForm
                            onCancel={this.handleCancel}
                            handleSubmit={this.handleSubmit}
                            id={this.state.id}
                            parentId={this.state.filter.parentId}
                        />
                    )}
                </div>
            </div>
        );
    }
}
export default Procedure;
