/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import React     from 'react';
import PropTypes from 'prop-types';
import { Spin }  from 'antd';

const propTypes = {
    tag    : PropTypes.node,
    message: PropTypes.string
};

const defaultProps = {
    tag       : 'h2',
    loaderText: 'Loading...',
    show      : true,
    message   : 'No Records Found!'
};

const ContentLoader = (props) => {
    const {shown, tag: Tag, contentLength} = props;

    return (
        shown ? (
                <Tag className="gx-text-center gx-mt-5 gx-mb-5">
                    <Spin size="large" tip={props.loaderText} />
                </Tag>
            ) :
            contentLength === 0 ? (
                <Tag className="gx-text-center gx-mt-5 gx-mb-5">
                    {props.message}
                </Tag>
            ) : null
    );
};

ContentLoader.propTypes    = propTypes;
ContentLoader.defaultProps = defaultProps;

export default ContentLoader;