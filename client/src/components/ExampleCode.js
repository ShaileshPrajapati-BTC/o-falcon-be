import React     from 'react';
import CopyBtn   from './CopyBtn';
import PropTypes from 'prop-types';

/**
 * Created by BHARGAV on 17/6/19 11:20 AM.
 */

const propTypes = {
    codeString: PropTypes.string.isRequired,
    maxHeight : PropTypes.string
};

const defaultProps = {
    maxHeight: '300px'
};

const ExampleCode = ({codeString, maxHeight}) => {
    return (
        <React.Fragment>
            <div className="styleCode gx-clearfix"
                 style={{maxHeight: maxHeight, overflow: 'auto'}}>
                <span style={{position: 'absolute', top: 3, right: 3}}>
                    <CopyBtn data={codeString} />
                </span>
                <pre className="gx-mb-0">{codeString}</pre>
            </div>
        </React.Fragment>
    );
};

ExampleCode.propTypes    = propTypes;
ExampleCode.defaultProps = defaultProps;

export default ExampleCode;