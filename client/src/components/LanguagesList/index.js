import { LOCALIZATION_LANGUAGES } from "../../constants/Common";
import PropTypes from "prop-types";
import React from "react";
import { Select } from "antd";

const propTypes = {
    disabled: PropTypes.bool,
    selected: PropTypes.string,
    onSelect: PropTypes.func
};

class LanguagesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            data: [],
            selected: props.selected
        };
    }

    componentDidMount() {}
    componentWillReceiveProps(nextProps) {
        if (nextProps.selected !== this.state.selected) {
            this.setState({ selected: nextProps.selected });
        }
    }
    handleChange = selected => {
        this.setState({ selected });
        this.props.onSelect(selected);
    };

    render() {
        let { selected } = this.state;
        const { disabled } = this.props;

        return (
            <React.Fragment>
                <Select
                    value={selected}
                    disabled={disabled}
                    // style={{ width: '100%' }}
                    placeholder={`Select Language`}
                    onChange={this.handleChange}
                >
                    {LOCALIZATION_LANGUAGES.map(val => {
                        return (
                            <Select.Option key={val.id} value={val.id}>
                                {val.name}
                            </Select.Option>
                        );
                    })}
                </Select>
            </React.Fragment>
        );
    }
}

LanguagesList.propTypes = propTypes;

export default LanguagesList;
