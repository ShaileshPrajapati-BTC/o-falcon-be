/**
 * Created by BHARGAV on 18/6/19 9:32 AM.
 */

import React            from 'react';
import { connect }      from 'react-redux';
import CustomScrollbars from '../../util/CustomScrollbars';
import HeaderTitle      from '../../components/HeaderTitle';
import { Form, Row }    from 'antd';
import CaratRateAmount  from '../../components/CaratRateAmount';
import CustomSelect     from '../../components/CustomSelect';
import CustomCheckBox   from '../../components/CustomCheckBox';
import CustomRadioBox   from '../../components/CustomRadioBox';
import UrlBinder        from '../../components/UrlBinder';
import NumberRange      from '../../components/NumberRange';

const SHAPE_LIST = [
    {
        id      : '409c6876-34fd-4e99-bada-12081813304a',
        name    : 'SQ.EMERALD',
        code    : 'SQ.EMERALD',
        sequence: 7
    },
    {
        id       : 'be3f59a9-95e6-4174-aa9b-4607280a6d4c',
        name     : 'PRINCESS',
        code     : 'PRINCESS',
        sequence : 8,
        isDefault: true
    },
    {
        id      : '6e9f49a9-9576-4474-a59b-48904876d85',
        name    : 'HIRA',
        code    : 'HIRa',
        sequence: 9
    }
];

class Temp extends React.Component {
    
    change = (value) => {
        console.log('---', value);
    };

    render() {
        const {form} = this.props;

        return (
            <div className="gx-module-box gx-mw-100">
                <div className="gx-module-box-header">
                    <HeaderTitle />
                </div>

                <div className="gx-module-box-content">
                    <CustomScrollbars className="gx-module-content-scroll">
                        <div className="gx-mt-3">
                            <Form layout="vertical">
                                <Row>
                                    <NumberRange baseForm={form}
                                                 initVal={{noFrom: 5, noTo: 15}}
                                                 percentage={!true}
                                                 precision={2}
                                                 step={0.5}
                                                 fromField={'noFrom'}
                                                 toField={'noTo'}
                                                 isRequired={true}
                                                 handleChange={this.change}
                                    />
                                </Row>

                                <Row>
                                    <UrlBinder baseForm={form}
                                               label="URL"
                                               fieldName="url"
                                               initUrl={'test.com'}
                                               handleChange={this.change}
                                    />
                                </Row>

                                <Row>
                                    <CustomRadioBox baseForm={form}
                                                    list={SHAPE_LIST}
                                                    lg={24}
                                                    colSpan={4}
                                                    label={'Shapes: '}
                                                    fieldName="shapeRb"
                                                    optionKey="id"
                                                    optionValue="id"
                                                    optionLabel="name"
                                                    isRequired={true}
                                                    btnStyle={true}
                                                    disableKey={'isDefault'}
                                                    handleChange={value => { console.log('Selected: ', value); }}
                                    />
                                </Row>

                                <Row>
                                    <CustomCheckBox baseForm={form}
                                                    list={SHAPE_LIST}
                                                    lg={24}
                                                    colSpan={4}
                                                    label={'Shapes: '}
                                                    fieldName="shapeCb"
                                                    optionKey="id"
                                                    optionValue="id"
                                                    optionLabel="name"
                                                    isRequired={true}
                                                    handleChange={this.change}
                                    />
                                </Row>

                                <br />
                                <Row type="flex" justify="start">
                                    <CustomSelect baseForm={form}
                                                  list={SHAPE_LIST}
                                                  label={'Shapes: '}
                                                  fieldName="shape"
                                                  optionKey="id"
                                                  optionValue="id"
                                                  optionLabel="name"
                                                  isRequired={true}
                                                  multiple={true}
                                                  handleChange={this.change}
                                    />
                                </Row>

                                <br />
                                <Row type="flex" justify="start">
                                    <CaratRateAmount baseForm={form}
                                                     isRequired={true}
                                                     lg={3} md={3} sm={6} xs={8}
                                    />
                                </Row>
                            </Form>
                        </div>
                    </CustomScrollbars>
                </div>
            </div>
        );
    }
}

const WrappedForm = Form.create({name: 'tempForm'})(Temp);

const mapStateToProps = function (props) {
    return props;
};

export default connect(mapStateToProps)(WrappedForm);
