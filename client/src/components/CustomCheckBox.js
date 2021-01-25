/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Col, Form, Row } from 'antd';

const CheckboxGroup = Checkbox.Group;
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
    showActions: PropTypes.bool,
    isRequired: PropTypes.bool,
    errMsg: PropTypes.string,
    handleChange: PropTypes.func,
    rowType: PropTypes.string,
    colSpan: PropTypes.number,
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
    selected: [],
    isRequired: false,
    showActions: true,
    errMsg: 'Please select value!',
    rowType: 'flex',
    colSpan: 4,
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
                    <span className="gx-ml-2">
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
                                parent.handleClick('clear')
                            }}>Clear</a>
                    </span>
                ) : null
            }
        </React.Fragment>
    );
};

class CustomCheckBox extends React.Component {
    constructor(props) {
        super(props);

        const {
            baseForm, list, optionLabel
        } = this.props;
        let sortedList = _.sortBy(list, optionLabel);

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
            fieldName, selected
        } = this.props;
        let selectedValues = selected;

        const { sortedList } = this.state;
        this.setState({
            checkedList: selectedValues.slice(),
            indeterminate: !!selectedValues.length && selectedValues.length < sortedList.length,
            checkAll: selectedValues.length === sortedList.length
        });

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

    onChange = checkedList => {
        const { sortedList } = this.state;

        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && checkedList.length < sortedList.length,
            checkAll: checkedList.length === sortedList.length
        }, () => {
            this.props.handleChange(checkedList);
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

        this.setState({
            indeterminate: false,
            checkAll: true
        }, () => {
            this.props.handleChange(values);
        });
    };

    render() {
        const {
            baseForm, lg, md, sm, xs, showLabel, label, fieldName, optionKey, optionValue, optionLabel,
            isRequired, width, errMsg, showActions, rowType, colSpan
        } = this.props;
        const { getFieldDecorator } = baseForm;
        const { sortedList } = this.state;

        return (
            <Col lg={lg} md={md} sm={sm} xs={xs}>
                <Form.Item label={
                    showLabel &&
                    ((showActions && <CustomLabel label={label} actions={showActions} parent={this} />) || label)
                }>
                    {getFieldDecorator(fieldName, {
                        rules: [{ required: isRequired, message: errMsg }]
                    })(
                        <CheckboxGroup
                            style={{ width: width }}
                            onChange={this.onChange}>
                            <Row type={rowType}>
                                {
                                    sortedList.map(v => {
                                        return <Col span={colSpan}
                                            key={v[optionKey]}>
                                            <Checkbox
                                                value={v[optionValue]}>
                                                {v[optionLabel]}
                                            </Checkbox>
                                        </Col>;
                                    })
                                }
                            </Row>
                        </CheckboxGroup>
                    )}
                </Form.Item>
            </Col>
        );
    }
}

CustomCheckBox.propTypes = propTypes;
CustomCheckBox.defaultProps = defaultProps;

export default CustomCheckBox;