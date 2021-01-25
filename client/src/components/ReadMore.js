import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Popover } from 'antd';

const propTypes = {
    tag: PropTypes.node,
    inline: PropTypes.bool,
    className: PropTypes.string,
    trigger: PropTypes.string,
    truncate: PropTypes.number,
    maxHeight: PropTypes.number
};

const defaultProps = {
    tag: 'pre',
    truncate: 100,
    inline: true,
    trigger: 'click'
};

class ReadMore extends React.Component {
    constructor(props) {
        super(props);

        this.state = { showMore: false };
    }

    showMore = () => {
        this.setState(prevState => ({ showMore: !prevState.showMore }));
    };

    render() {
        const {
            tag: Tag, title, data, truncate, inline, trigger, maxHeight
        } = this.props;
        const { showMore } = this.state;
        let str = data.slice(0, truncate);

        return (
            data.length <= truncate || showMore ? (
                <div style={{ maxHeight: maxHeight + 'px', overflow: 'auto' }}>
                    <Tag className="">
                        {data}
                    </Tag>
                </div>
            ) : (
                    inline ? (
                        <Tag className="">
                            {str}...
                        <a href="/#" onClick={(e) => {
                                e.preventDefault();
                                this.showMore();
                            }}
                                className="gx-text-primary"
                            >
                                <Icon type="plus-square" /> More
                        </a>
                        </Tag>
                    ) : (
                            <Popover
                                content={data}
                                title={title || null}
                                trigger={trigger}>
                                <Tag className="" id="test">
                                    {str}...
                            <a href="/#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                        }} className="gx-text-primary">
                                        <Icon type="plus-square" /> More
                            </a>
                                </Tag>
                            </Popover>
                        )
                )
        );
    }
}

ReadMore.propTypes = propTypes;
ReadMore.defaultProps = defaultProps;

export default ReadMore;