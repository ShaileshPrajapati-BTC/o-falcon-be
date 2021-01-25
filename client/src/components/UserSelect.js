import React from 'react';
import axios from 'util/Api';
import { Select } from 'antd';
import { USER_TYPES } from '../constants/Common';
import PropTypes from 'prop-types';

const propTypes = {
    width: PropTypes.string,
    showLabel: PropTypes.bool,
    multiple: PropTypes.bool,
    userType: PropTypes.string.isRequired,
    selected: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array
    ]),
    reset: PropTypes.bool,
    onSelect: PropTypes.func
};

const defaultProps = {
    width: '100%',
    showLabel: true,
    multiple: false,
    reset: false
};

class UserSelect extends React.Component {
    constructor(props) {
        super(props);

        let label = null, placeholder = null;
        switch (props.userType) {
            case USER_TYPES.ADMIN:
                label = 'Admin';
                placeholder = 'Admin';
                break;
            case USER_TYPES.VENDOR:
                label = 'Vendors';
                placeholder = 'Vendor(s)';
                break;
            case USER_TYPES.VENDOR_USER:
                label = 'Home Users';
                placeholder = 'Home User(s)';
                break;
            case USER_TYPES.CUSTOMER:
                label = 'Customers';
                placeholder = 'Customer(s)';
                break;
            default:
                label = null; placeholder = null;
        }

        this.state = {
            isLoading: false,
            data: [],
            multiMode: !!props.multiple,
            userType: props.userType,
            label: label,
            placeholder: placeholder,
            selected: props.selected,
            reset: props.reset
        };
    }

    componentDidMount() { this.fetch(); }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.reset && !this.props.reset) {
            this.setState({ selected: undefined, reset: false });
        }

        if (nextProps.selected) {
            this.setState({ selected: nextProps.selected });
        }
    }

    handleChange = selected => {
        this.setState({ selected });
        this.props.onSelect(selected);
    };

    fetch = () => {
        this.setState({ loading: true });

        let self = this;

        axios.post('admin/user/paginate', { filter: { type: self.state.userType, isDeleted: false } }
        ).then((data) => {
            if (data.code === 'OK') {
                self.setState(prevState => {
                    prevState.data = data.data.list;
                });
            }

            self.setState({ isLoading: false });
        }).catch(function (error) {
            console.log('Error****:', error.message);
            self.setState({ isLoading: false });
        });
    };

    render() {
        const { width, showLabel } = this.props;
        const {
            data, multiMode, selected, label, placeholder
        } = this.state;

        return (
            <React.Fragment>
                {showLabel ?
                    <label className="gx-d-block">{label}</label> : null}

                <Select
                    mode={multiMode ? 'multiple' : null}
                    value={selected}
                    style={{ width: width }}
                    placeholder={`Select ${placeholder}`}
                    onChange={this.handleChange}>
                    {
                        data.map(val => {
                            return <Select.Option key={val.id}
                                value={val.id}>
                                {val.name}
                            </Select.Option>;
                        })
                    }
                </Select>
            </React.Fragment>
        );
    }
}

UserSelect.propTypes = propTypes;
UserSelect.defaultProps = defaultProps;

export default UserSelect;
