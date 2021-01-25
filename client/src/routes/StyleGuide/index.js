import {
    ActionButtonsComp,
    ActiveDeactiveComp,
    CaratRateAmountComp,
    ContentLoaderComp,
    CopyBtnComp,
    CustomCheckboxComp,
    CustomRadioComp,
    CustomSelectComp,
    HeaderTitleComp,
    NumberRangeComp,
    PasswordFormComp,
    RadioGroupComp,
    ReadMoreComp,
    UrlBinderComp,
    UserSelectComp
} from './ExampleComponents';
import { Col, Form, List, Row } from 'antd';
import CustomScrollbars from '../../util/CustomScrollbars';
import React from 'react';
import { connect } from 'react-redux';

const ITEMS = [
    { id: 1, name: 'Read More', item: <ReadMoreComp title="Read More" /> },
    { id: 2, name: 'Action Buttons', item: <ActionButtonsComp title="Action Buttons" /> },
    { id: 3, name: 'Active Deactive', item: <ActiveDeactiveComp title="Active Deactive" /> },
    { id: 4, name: 'Content Loader', item: <ContentLoaderComp title="Content Loader" /> },
    { id: 5, name: 'Copy Button', item: <CopyBtnComp title="Copy Button" /> },
    { id: 6, name: 'Header Title', item: <HeaderTitleComp title="Header Title" /> },
    { id: 7, name: 'Password Form', type: 'password' },
    { id: 8, name: 'Radio Group (Use custom radio instead)', item: <RadioGroupComp title="Radio Group" /> },
    { id: 9, name: 'User Select', item: <UserSelectComp title="User Select" /> },
    { id: 10, name: 'Number Range', type: 'numberRange' },
    { id: 11, name: 'Carat-Rate-Amount', type: 'caratRateAmount' },
    { id: 12, name: 'Custom Select', type: 'customSelect' },
    { id: 13, name: 'Custom Checkbox', type: 'customCheckbox' },
    { id: 14, name: 'Custom Radio', type: 'customRadio' },
    { id: 15, name: 'URL Binder', type: 'urlBinder' }
];

const FormComp = ({ type, form }) => {
    let comp = null;

    switch (type) {
        case 'password':
            comp = <PasswordFormComp title="Password Form" form={form} />;
            break;
        case 'numberRange':
            comp = <NumberRangeComp title="Number Range" form={form} />;
            break;
        case 'caratRateAmount':
            comp = <CaratRateAmountComp title="Carat Rate Amount" form={form} />;
            break;
        case 'customSelect':
            comp = <CustomSelectComp title="Custom Select" form={form} />;
            break;
        case 'customCheckbox':
            comp = <CustomCheckboxComp title="Custom Checkbox" form={form} />;
            break;
        case 'customRadio':
            comp = <CustomRadioComp title="Custom Radio" form={form} />;
            break;
        case 'urlBinder':
            comp = <UrlBinderComp title="URL Binder" form={form} />;
            break;
        default:
            comp = null;
    }

    return comp;
};

class StyleGuide extends React.Component {
    constructor(props) {
        super(props);

        const selected = 1;

        this.state = {
            loading: false,
            data: ITEMS,
            dispData: ITEMS[selected - 1],
            selectedId: selected
        };
    }

    onChange = (item) => {
        this.setState({
            selectedId: item.id,
            dispData: item
        });
    };

    render() {
        const { data, selectedId, dispData } = this.state;
        const { form } = this.props;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <h1 className="pageHeading">Style Guide</h1>
                </div>

                <div className="gx-module-box-content">
                    <Row type="flex" className="no-gutter">
                        <Col span={6}>
                            <CustomScrollbars className="gx-module-content-scroll">
                                <List bordered
                                    itemLayout="horizontal"
                                    dataSource={data}
                                    renderItem={item => (
                                        <List.Item
                                            className={'gx-pointer gx-text-capitalize ' +
                                                (item.id === selectedId ? 'gx-bg-primary' : '')}
                                            onClick={this.onChange.bind(this, item)}>
                                            {item.name}
                                        </List.Item>
                                    )}
                                />
                            </CustomScrollbars>
                        </Col>

                        <Col span={18}>
                            <CustomScrollbars className="gx-module-content-scroll">
                                <div className="gx-p-1">
                                    {
                                        dispData.type ? (
                                            <Form layout='vertical'>
                                                <FormComp type={dispData.type} form={form} />
                                            </Form>
                                        ) : (dispData.item)
                                    }
                                </div>
                            </CustomScrollbars>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const WrappedExampleForm = Form.create({ name: 'exampleForm' })(StyleGuide);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedExampleForm);
