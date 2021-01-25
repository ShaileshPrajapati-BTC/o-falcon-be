/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Col, Form, Select } from 'antd';

const { Option } = Select;
const _ = require('lodash');

const propTypes = {
    baseForm: PropTypes.any.isRequired,
    list: PropTypes.array.isRequired,
    label: PropTypes.string,
    showLabel: PropTypes.bool,
    fieldName: PropTypes.string,
    optionKey: PropTypes.string.isRequired,
    optionValue: PropTypes.string.isRequired,
    optionLabel: PropTypes.string.isRequired,
    width: PropTypes.string,
    showSearch: PropTypes.bool,
    multiple: PropTypes.bool,
    showActions: PropTypes.bool,
    isRequired: PropTypes.bool,
    errMsg: PropTypes.string,
    placeholder: PropTypes.string,
    handleChange: PropTypes.func,
    lg: PropTypes.number,
    md: PropTypes.number,
    sm: PropTypes.number,
    xs: PropTypes.number
};

const defaultProps = {
    list: [],
    label: 'Default',
    fieldName: 'select',
    showLabel: true,
    width: '100%',
    showSearch: true,
    multiple: false,
    isRequired: false,
    showActions: true,
    errMsg: 'Please select value!',
    lg: 6,
    md: 6,
    sm: 8,
    xs: 24
};

const CustomLabel = ({ label, actions, parent }) => {
    return (
        <React.Fragment>
            <span>{label}</span>
            {
                actions ? (
                    <span className="gx-float-right">
                        <Checkbox
                            indeterminate={parent.state.indeterminate}
                            onChange={parent.onCheckAllChange}
                            checked={parent.state.checkAll}
                            disabled={parent.state.checkAll}
                        >
                            <span className="gx-link">All</span>
                        </Checkbox>|&nbsp;
                        <a
                            href="/#" onClick={(e) => {
                                e.preventDefault();
                                parent.handleClick('clear');
                            }}>Clear</a>
                    </span>
                ) : null
            }
        </React.Fragment>
    );
};

class CustomSelect extends React.Component {
    constructor(props) {
        super(props);

        const {
            baseForm, optionLabel, list
        } = this.props;
        const sortedList = _.sortBy(list, optionLabel);

        this.state = {
            checkedList: [],
            sortedList: sortedList,
            indeterminate: false,
            checkAll: false
        };

        this.form = baseForm;
    }

    componentDidMount() {
        const {
            list, fieldName, selected, multiple, defaultKey, optionValue
        } = this.props;
        let selectedValues = selected;

        if (!selectedValues && defaultKey) {
            let defaultObj = list.find(v => v[defaultKey] === true);

            if (!defaultObj) defaultObj = list[0];
            selectedValues = defaultObj[optionValue];
        }

        if (selectedValues && multiple) {
            selectedValues = _.flatten([selectedValues]);

            const { sortedList } = this.state;
            this.setState({
                checkedList: selectedValues.slice(),
                indeterminate: !!selectedValues.length && selectedValues.length < sortedList.length,
                checkAll: selectedValues.length === sortedList.length
            });
        }

        this.form.setFieldsValue({ [fieldName]: selectedValues });
    }

    onCheckAllChange = e => {
        const { sortedList } = this.state;
        const { optionValue } = this.props;

        this.setState({
            checkedList: e.target.checked ? _.map(sortedList, optionValue) : [],
            indeterminate: false,
            checkAll: e.target.checked
        }, () => {
            this.handleClick('all');
        });
    };

    onChange = values => {
        const { sortedList } = this.state;

        this.setState({
            values,
            indeterminate: !!values.length && values.length < sortedList.length,
            checkAll: values.length === sortedList.length
        }, () => {
            this.props.handleChange(values);
        });
    };

    handleClick = (type = 'all') => {
        let { fieldName, list, optionValue } = this.props;

        let values = [];
        if (type === 'clear') {
            this.form.setFieldsValue({ [fieldName]: values });
            this.props.handleChange(values);

            this.setState({
                indeterminate: false,
                checkAll: false
            });
            return;
        }

        values = _.map(list, optionValue);
        this.form.setFieldsValue({ [fieldName]: values });
        this.props.handleChange(values);
    };

    render() {
        const {
            baseForm, showSearch, lg, md, sm, xs, showLabel, label, fieldName, isRequired, errMsg, width,
            multiple, showActions, optionKey, optionValue, optionLabel, placeholder
        } = this.props;
        const { getFieldDecorator } = baseForm;
        const { sortedList } = this.state;

        return (
            <Col lg={lg} md={md} sm={sm} xs={xs}>
                <Form.Item label={
                    showLabel &&
                    ((multiple &&
                        showActions && <CustomLabel label={label} actions={showActions} parent={this} />) || label)
                }>
                    {getFieldDecorator(fieldName, {
                        rules: [{ required: isRequired, message: errMsg }]
                    })(
                        <Select
                            showSearch={showSearch}
                            mode={multiple ? 'multiple' : null}
                            style={{ width: width }}
                            placeholder={`Select ${showSearch ? '/Search' : ''} ${placeholder || label || ''}`}
                            onChange={this.onChange}
                        >
                            {
                                sortedList.map(v => {
                                    return <Option key={v[optionKey]}
                                        value={v[optionValue]}>
                                        {v[optionLabel]}
                                    </Option>;
                                })
                            }
                        </Select>
                    )}
                </Form.Item>
            </Col>
        );
    }
}

CustomSelect.propTypes = propTypes;
CustomSelect.defaultProps = defaultProps;

export default CustomSelect;