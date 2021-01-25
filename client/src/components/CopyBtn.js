/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React            from 'react';
import PropTypes        from 'prop-types';
import { Button, Icon } from 'antd';
import UtilService      from '../services/util';

const propTypes = {
    data: PropTypes.string.isRequired
};

const defaultProps = {};

class CopyBtn extends React.Component {
    state = {
        isCopied: false
    };

    checkCopied = () => {
        this.setState(prevState => ({isCopied: !prevState.isCopied}));
    };

    handleClick = (event, data) => {
        UtilService.copyToClipboardFn(event, data);

        this.checkCopied();
        setTimeout(() => {
            this.checkCopied();
        }, 1000);
    };

    render() {
        const {data}     = this.props;
        const {isCopied} = this.state;

        return (
            <Button size="small"
                    type={isCopied ? 'primary' : null}
                    className="gx-mb-0"
                    onClick={event => { this.handleClick(event, data); }}>
                <Icon type="copy" />
                {isCopied ? 'Copied...' : 'Copy'}
            </Button>
        );
    }
}

CopyBtn.propTypes    = propTypes;
CopyBtn.defaultProps = defaultProps;

export default CopyBtn;