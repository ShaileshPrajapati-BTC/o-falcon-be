import { Dropdown, Icon, Menu } from "antd";
import React, { Component } from "react";

class FilterDropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ascending: !props.isDesc,
            select: props.defaultSelected
        };

        const { list } = this.props;
        console.log("TCL: FilterDropdown -> constructor -> list", list)
        this.menu = ascending => {
            const activeClass = "active-selectDropdown";

            return (
                <Menu style={{ maxHeight: 400, overflow: 'auto' }}>
                    {list.map((value, index) => {
                        return (
                            <Menu.Item
                                key={index}
                                className={
                                    value.value === this.state.select
                                        ? activeClass
                                        : ""
                                }
                                onClick={this.handleSelection.bind(
                                    this,
                                    value.value
                                )}
                            >
                                <a href="/#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}>{value.label}</a>
                                {value.value === this.state.select ? (
                                    <Icon className="gx-ml-2" type="check" />
                                ) : null}
                            </Menu.Item>
                        );
                    })}
                    {this.props.sorter ? (
                        <Menu.Divider className="ant-dropdown-menu-item-divider" />
                    ) : null}
                    {this.props.sorter ? (
                        <Menu.Item
                            key={list.length + 1}
                            className={ascending ? activeClass : ""}
                            onClick={this.handleOrderSelection.bind(
                                this,
                                "ASC"
                            )}
                        >
                            <a href="/#"
                                onClick={(e) => {
                                    e.preventDefault();
                                }}>Ascending</a>
                            {ascending ? (
                                <Icon className="gx-ml-2" type="check" />
                            ) : null}
                        </Menu.Item>
                    ) : null}
                    {this.props.sorter ? (
                        <Menu.Item
                            key={list.length + 2}
                            className={!ascending ? activeClass : ""}
                            onClick={this.handleOrderSelection.bind(
                                this,
                                "DESC"
                            )}
                        >
                            <a href="/#"
                                onClick={(e) => {
                                    e.preventDefault();
                                }}>Descending</a>
                            {!ascending ? (
                                <Icon className="gx-ml-2" type="check" />
                            ) : null}
                        </Menu.Item>
                    ) : null}
                </Menu>
            );
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            select: this.props !== nextProps && nextProps.defaultSelected
        });
    }

    handleOrderSelection = value => {
        let isAscending = value === "ASC";
        if (this.state.ascending === isAscending) {
            return;
        }
        this.setState({ ascending: isAscending }, () => {
            this.props.handleSelection(this.state.select, isAscending);
        });
    };

    handleSelection = value => {
        if (this.state.select === value) {
            return;
        }
        this.setState({
            select: value
        });

        return this.props.handleSelection(value, this.state.ascending);
    };

    render() {
        const { title1, list, showScroll } = this.props;
        return (
            // list.length > 0 && 
            <div className="dropdownUis">
                {title1}
                <Dropdown
                    overlay={this.menu(this.state.ascending)}
                    trigger={["click"]}
                    overlayClassName={showScroll ? 'filterDropdownScroll' : ''}
                >
                    <a className="ant-dropdown-link" href="/#" onClick={(e) => {
                        e.preventDefault();
                    }}>
                        {list.map(value => (value.value === this.state.select) ? value.label : null)}
                        <Icon type="down" />
                    </a>
                </Dropdown>
            </div>
        );
    }
}

export default FilterDropdown;
