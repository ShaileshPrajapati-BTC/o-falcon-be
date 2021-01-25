/**
 * Created by BHARGAV on 17/6/19 11:30 AM.
 */

import React                     from 'react';
import { Row, Tabs, Typography } from 'antd';
import ExampleCode               from '../../components/ExampleCode';
import ReadMore                  from '../../components/ReadMore';
import ActionButtons             from '../../components/ActionButtons';
import ContentLoader             from '../../components/ContentLoader';
import PasswordForm              from '../../components/PasswordForm';
import RadioGroup                from '../../components/RadioGroup';
import { USER_TYPES }            from '../../constants/Common';
import UserSelect                from '../../components/UserSelect';
import NumberRange               from '../../components/NumberRange';
import CaratRateAmount           from '../../components/CaratRateAmount';
import CustomSelect              from '../../components/CustomSelect';
import CustomCheckBox            from '../../components/CustomCheckBox';
import CustomRadioBox            from '../../components/CustomRadioBox';
import UrlBinder                 from '../../components/UrlBinder';
import ActiveDeactive from '../../components/custom/ActiveDeactive';

const {Title} = Typography;
const TabPane = Tabs.TabPane;

const DummyData = 'Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.\n' +
    '\n' +
    'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.';

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

const Beautify = ({title, options, component, codeString}) => {
    let htmlString = '';

    options.map(v => htmlString += `<icon class="icon icon-arrow-right"></icon> ${v}<br/>`);

    return (
        <div>
            <Title level={4} className="gx-mb-0">{title}</Title>

            <hr className="gx-mt-0" />

            <Tabs
                defaultActiveKey="1"
                tabPosition="left"
                size="small"
            >
                <TabPane tab="Description" key="1">
                    <div dangerouslySetInnerHTML={{__html: htmlString}}></div>
                </TabPane>
                <TabPane tab="Example" key="2">
                    {component ? <div className="exampleCodeArea"> {component} </div> : null}
                </TabPane>
                <TabPane tab="Source Code" key="3">
                    <ExampleCode codeString={codeString} />
                </TabPane>
            </Tabs>
        </div>
    );
};

//-------------------------------------- Read More --------------------------------------//
export const ReadMoreComp = ({title}) => {
    const options = [
        `<b>tag: </b> Any HTML tag, defaults to 'pre'`,
        `<b>title: </b> Title to be given to a modal`,
        `<b>data: </b> Required.`,
        `<b>truncate: </b> Max char. Defaults to 100 char.`,
        `<b>trigger: </b> Defaults to 'click'`,
        `Refer <a target="_blank" href="https://ant.design/components/popover/#header">Popover Options</a>`
    ];

    const component = <ReadMore tag="span" data={DummyData} />;

    const codeString = '<ReadMore tag="span" data={DummyData} />';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Action Buttons --------------------------------------//
export const ActionButtonsComp = ({title}) => {
    const options = [
        `<b>add|view|edit: </b> Any URL or a function to be passed.`,
        `<b>add|view|edit|delete: </b> Suffixed with 'Title' provides tooltip to each.`,
        `<b>viewTarget: </b> Optional. For e.g. "_blank"`,
        `<b>deleteObj: </b> Object: Must have documentId, model as param, isSoftDelete(optional, false).`
    ];

    const component = <ActionButtons add={() => {}}
                                     addTitle="Add New"
                                     view={() => `/styleGuide`}
                                     viewTarget="_blank"
                                     edit={() => {}}
                                     deleteObj={{
                                         documentId: 123,
                                         model     : 'test'
                                     }}
                                     deleteFn={res => { console.log('Delete response: ', res); }} />;

    const codeString = '<ActionButtons\n' +
        '  add={() => {}}\n' +
        '  addTitle="Add New"\n' +
        '  view={"/styleGuide"}\n' +
        '  viewTarget="_blank"\n' +
        '  edit={() => {}}\n' +
        '  deleteObj={{\n' +
        '    documentId: 123,\n' +
        '    model: "test"\n' +
        '  }}\n' +
        '  deleteFn={res => {\n' +
        '    console.log("Delete response: ", res);\n' +
        '  }}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Active Deactive --------------------------------------//
export const ActiveDeactiveComp = ({title}) => {
    const options = [
        `<b>documentId: </b> Record id to be 'Active/Deactive'.`,
        `<b>model: </b> Table name.`
    ];

    const component = <ActiveDeactive
        documentId={'1234'}
        model="user"
    />;

    const codeString = '<ActiveDeactive documentId={"1234"} model="user" />';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Content Loader --------------------------------------//
export const ContentLoaderComp = ({title}) => {
    const options = [
        `<b>contentLength: </b> List length.`,
        `<b>shown: </b> T|F.`,
        `<b>loaderText: </b> Defaults to 'Loading...'`,
        `<b>message: </b> Shows message if no records found. ('No Records Found!')`
    ];

    const component = <ContentLoader contentLength={[]} shown={true} />;

    const codeString = '<ContentLoader contentLength={list.length} shown={initLoading} />';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Copy Btn --------------------------------------//
export const CopyBtnComp = ({title}) => {
    const options = [
        `<b>data: </b> Pass data to be copied over.`
    ];

    const codeString = '<CopyBtn data="Text to be copied" />';

    return (
        <Beautify title={title}
                  options={options}
                  codeString={codeString} />
    );
};

//-------------------------------------- Header Title --------------------------------------//
export const HeaderTitleComp = ({title}) => {
    const options = [
        `<b>total: </b> Total to be displayed as badge.`,
        `<b>title: </b> Custom title.`
    ];

    const codeString = `<HeaderTitle total={10} />`;

    return (
        <Beautify title={title}
                  options={options}
                  codeString={codeString} />
    );
};

//-------------------------------------- Password orm -------------------------------------//
export const PasswordFormComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>layout: </b> 'default|horizontal. Defaults to 'default'`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 8, 8, 12, 24 respectively.`,
        `<b>updatePassword: </b> If true, shows current password field.`,
        `<b>currentPassword|password|confirm: </b>
        <ul class="gx-mb-0" style="margin-bottom: -18px !important;">
            <li>Suffixed with 'Label' changes label for each. Otherwise defaults.</li>
            <li>Suffixed with 'Field' changes field for each. Otherwise defaults.</li>
            <li>Suffixed with 'Placeholder' changes placeholder for each. Otherwise defaults.</li>
            <li>Suffixed with 'ErrMsg' changes error message for each. Otherwise defaults.</li>
            <li>Suffixed with 'Placeholder' changes placeholder for each. Otherwise defaults.</li>
        </ul>`,
        `<b>confirmErrReqMsg: </b> Confirm password field required message otherwise default.`
    ];

    const component = <PasswordForm baseForm={form} updatePassword={true} />;

    const codeString = '<PasswordForm baseForm={form} updatePassword={true} />';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Radio Group --------------------------------------//
export const RadioGroupComp = ({title}) => {
    const options = [
        `<b>list: </b> [{}]`,
        `<b>listKey: </b> Unique 'key' param.`,
        `<b>defaultVal: </b> Default value to be selected.`,
        `<b>label: </b> Label text.'`,
        `<b>val: </b> Value for selected radio.`,
        `<b>onChange: </b> On radio selection call this function, selected value is given as event target.`
    ];

    const filter = [
        {name: 'Vendor', val: 1},
        {name: 'Home', val: 2}
    ];

    const component = <RadioGroup defaultVal={1}
                                  list={filter}
                                  listKey="val" val="val" label="name"
                                  onChange={(event) => {console.log('Selected Radio Value: ', event.target.value);}}
    />;

    const codeString = '<RadioGroup\n' +
        '  defaultVal={1}\n' +
        '  list={[{ name: "Vendor", val: 1 }, { name: "Home", val: 2 }]}\n' +
        '  listKey="val"\n' +
        '  val="val"\n' +
        '  label="name"\n' +
        '  onChange={(event) => {console.log("Selected Radio Value: ", event.target.value);}}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- User Select --------------------------------------//
export const UserSelectComp = ({title}) => {
    const options = [
        `<b>width: </b> Width of the control. Defaults to '100%'.`,
        `<b>showLabel: </b> T|F.`,
        `<b>multiple: </b> T|F. If true allow multi-selection.`,
        `<b>userType: </b> Required. Give one of User Type constant.`,
        `<b>selected: </b> Values for pre-selection.`,
        `<b>reset: </b> T|F. Resets the component.`,
        `<b>onSelect: </b> Callback function on selection.`
    ];

    const component = <UserSelect
        userType={USER_TYPES.VENDOR}
        multiple={true}
        width="250px"
        onSelect={(value) => {console.log('Selected User Value: ', value); }}
    />;

    const codeString = '<UserSelect\n' +
        '  userType={USER_TYPES.VENDOR}\n' +
        '  multiple={true}\n' +
        '  width="250px"\n' +
        '  onSelect={value => {\n' +
        '    console.log("Selected User Value: ", value);\n' +
        '  }}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Number Range --------------------------------------//
export const NumberRangeComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>label: </b> Label for it.`,
        `<b>showLabel: </b> T|F. Defaults to true.`,
        `<b>from|to: </b>
        <ul class="gx-mb-0" style="margin-bottom: -18px !important;">
            <li>Suffixed with 'Field' attaches field otherwise defaults.</li>
            <li>Suffixed with 'ErrMsg' attaches error message otherwise defaults.</li>
            <li>Suffixed with 'Placeholder' attaches placeholders to each or set to defaults.</li>
        </ul>`,
        `<b>min: </b> Defaults to -Infinity.`,
        `<b>max: </b> Defaults to Infinity.`,
        `<b>step: </b> Defaults to 1.`,
        `<b>precision: </b> Defaults to 0.`,
        `<b>percentage: </b> T|F. Defaults to true. Auto percentage formatter & parse applied.`,
        `<b>isRequired: </b> T|F. Defaults to false.`,
        `<b>formatter: </b> Callback formatter function. Overrides percentage formatter.`,
        `<b>parser: </b> Callback parser function. Overrides percentage parser.`,
        `<b>handleChange: </b> Callback function on change. Returns as {}.`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 6, 6, 8, 24 respectively.`
    ];

    const component = <NumberRange baseForm={form}
                                   lg={8}
                                   initVal={{noFrom: 5, noTo: 15}}
                                   percentage={true}
                                   fromField={'noFrom'}
                                   toField={'noTo'}
                                   precision={2}
                                   step={0.5}
                                   isRequired={true}
                                   handleChange={value => { console.log(value); }} />;

    const codeString = '<NumberRange\n' +
        '  baseForm={form}\n' +
        '  lg={8}\n' +
        '  initVal={{ noFrom: 5, noTo: 15 }}\n' +
        '  percentage={true}\n' +
        '  fromField={"noFrom"}\n' +
        '  toField={"noTo"}\n' +
        '  precision={2}\n' +
        '  step={0.5}\n' +
        '  isRequired={true}\n' +
        '  handleChange={value => {\n' +
        '    console.log(value);\n' +
        '  }}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Carat Rate Amount --------------------------------------//
export const CaratRateAmountComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>operator: </b> Supports '+', '-', '*', '/'. Defaults to '*'.`,
        `<b>carat|rate|amount: </b>
        <ul class="gx-mb-0" style="margin-bottom: -18px !important;">
            <li>Suffixed with 'Label' attaches label otherwise defaults.</li>
            <li>Suffixed with 'Field' attaches field otherwise defaults.</li>
            <li>Suffixed with 'Decimal' attaches no. of decimal otherwise defaults to '2'.</li>
            <li>Suffixed with 'Placeholder' attaches placeholders to each or set to defaults.</li>
        </ul>`,
        `<b>showLabel: </b> T|F. Defaults to true.`,
        `<b>isRequired: </b> T|F. Defaults to false.`,
        `<b>inputWidth: </b> Defaults to '100%'.`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 6, 6, 8, 24 respectively.`
    ];

    const component = <Row type="flex" justify="start">
        <CaratRateAmount baseForm={form} isRequired={true} rateDecimal={3} amountDecimal={4} />
    </Row>;

    const codeString = '<CaratRateAmount\n' +
        '  baseForm={form}\n' +
        '  isRequired={true}\n' +
        '  rateDecimal={3}\n' +
        '  amountDecimal={4}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Custom Select --------------------------------------//
export const CustomSelectComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>list: </b> [{}]`,
        `<b>label: </b> Label for it.`,
        `<b>showLabel: </b> T|F. Defaults to true.`,
        `<b>fieldName: </b> Form field name to access for the field.`,
        `<b>optionKey: </b> Required. Key for each options.`,
        `<b>optionValue: </b> Required. Value key for each options.`,
        `<b>optionLabel: </b> Required. Label key for each options.`,
        `<b>width: </b> Defaults to '100%'.`,
        `<b>showSearch: </b> T|F. Defaults to true.`,
        `<b>multiple: </b> T|F. Defaults to false.`,
        `<b>showActions: </b> T|F. Defaults to true. Only if <code>multiple</code> is true.`,
        `<b>isRequired: </b> T|F. Defaults to false.`,
        `<b>errMsg: </b> Provide error message.`,
        `<b>placeholder: </b> Provide placeholder.`,
        `<b>handleChange: </b> Callback function on change.`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 6, 6, 8, 24 respectively.`
    ];

    const component = <CustomSelect baseForm={form}
                                    lg={12}
                                    list={SHAPE_LIST}
                                    fieldName="shape"
                                    optionKey="id"
                                    optionValue="id"
                                    optionLabel="name"
                                    isRequired={true}
                                    multiple={true}
                                    defaultKey={'isDefault'}
                                    handleChange={values => {console.log('Selected Values: ', values);}} />;

    const codeString = '<CustomSelect\n' +
        '  baseForm={form}\n' +
        '  lg={12}\n' +
        '  list={SHAPE_LIST}\n' +
        '  fieldName="shape"\n' +
        '  optionKey="id"\n' +
        '  optionValue="id"\n' +
        '  optionLabel="name"\n' +
        '  isRequired={true}\n' +
        '  multiple={true}\n' +
        '  defaultKey={"isDefault"}\n' +
        '  handleChange={values => {\n' +
        '    console.log("Selected Values: ", values);\n' +
        '  }}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Custom Checkbox --------------------------------------//
export const CustomCheckboxComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>list: </b> [{}]`,
        `<b>label: </b> Label for it.`,
        `<b>showLabel: </b> T|F. Defaults to true.`,
        `<b>fieldName: </b> Form field name to access for the field.`,
        `<b>optionKey: </b> Required. Key for each options.`,
        `<b>optionValue: </b> Required. Value key for each options.`,
        `<b>optionLabel: </b> Required. Label key for each options.`,
        `<b>width: </b> Defaults to '100%'.`,
        `<b>showActions: </b> T|F.`,
        `<b>isRequired: </b> T|F. Defaults to false.`,
        `<b>errMsg: </b> Provide error message.`,
        `<b>handleChange: </b> Callback function on change.`,
        `<b>rowType: </b> Row type for inner. Defaults to 'flex'.`,
        `<b>colSpan: </b> Col for each option. Defaults to '4'.`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 6, 6, 8, 24 respectively.`
    ];

    const component = <CustomCheckBox baseForm={form}
                                      list={SHAPE_LIST}
                                      lg={24}
                                      colSpan={6}
                                      selected={['be3f59a9-95e6-4174-aa9b-4607280a6d4c']}
                                      fieldName="shapeCb"
                                      optionKey="id"
                                      optionValue="id"
                                      optionLabel="name"
                                      isRequired={true}
                                      handleChange={values => {console.log('Selected Values: ', values);}} />;

    const codeString = '<CustomCheckBox\n' +
        '  baseForm={form}\n' +
        '  list={SHAPE_LIST}\n' +
        '  lg={24}\n' +
        '  colSpan={4}\n' +
        '  selected={["be3f59a9-95e6-4174-aa9b-4607280a6d4c"]}\n' +
        '  fieldName="shapeCb"\n' +
        '  optionKey="id"\n' +
        '  optionValue="id"\n' +
        '  optionLabel="name"\n' +
        '  isRequired={true}\n' +
        '  handleChange={values => {\n' +
        '    console.log("Selected Values: ", values);\n' +
        '  }}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- Custom Radio --------------------------------------//
export const CustomRadioComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>list: </b> [{}]`,
        `<b>label: </b> Label for it.`,
        `<b>showLabel: </b> T|F. Defaults to true.`,
        `<b>fieldName: </b> Form field name to access for the field.`,
        `<b>optionKey: </b> Required. Key for each options.`,
        `<b>optionValue: </b> Required. Value key for each options.`,
        `<b>optionLabel: </b> Required. Label key for each options.`,
        `<b>disableKey: </b> Disable radio of this key.`,
        `<b>btnStyle: </b> T|F. Change radio to button style radio. Defaults to false.`,
        `<b>width: </b> Defaults to '100%'.`,
        `<b>showActions: </b> T|F.`,
        `<b>isRequired: </b> T|F. Defaults to false.`,
        `<b>errMsg: </b> Provide error message.`,
        `<b>handleChange: </b> Callback function on change.`,
        `<b>rowType: </b> Row type for inner. Defaults to 'flex'.`,
        `<b>colSpan: </b> Col for each option. Defaults to '4'.`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 6, 6, 8, 24 respectively.`
    ];

    const component = <CustomRadioBox baseForm={form}
                                      list={SHAPE_LIST}
                                      lg={24}
                                      colSpan={4}
                                      label={'Shapes: '}
                                      fieldName="shapeRb"
                                      optionKey="id"
                                      optionValue="id"
                                      optionLabel="name"
                                      isRequired={true}
                                      btnStyle={!true}
                                      disableKey={'isDefault'}
                                      handleChange={value => { console.log('Selected: ', value); }} />;

    const codeString = '<CustomRadioBox\n' +
        '  baseForm={form}\n' +
        '  list={SHAPE_LIST}\n' +
        '  lg={24}\n' +
        '  colSpan={4}\n' +
        '  label={"Shapes: "}\n' +
        '  fieldName="shapeRb"\n' +
        '  optionKey="id"\n' +
        '  optionValue="id"\n' +
        '  optionLabel="name"\n' +
        '  isRequired={true}\n' +
        '  btnStyle={true}\n' +
        '  disableKey={"isDefault"}\n' +
        '  handleChange={value => {\n' +
        '    console.log("Selected: ", value);\n' +
        '  }}\n' +
        '/>;\n';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};

//-------------------------------------- URL Binder --------------------------------------//
export const UrlBinderComp = ({title, form}) => {
    const options = [
        `<b>baseForm: </b> Pass 'form' props for validation.`,
        `<b>label: </b> Label for it.`,
        `<b>showLabel: </b> T|F. Defaults to true.`,
        `<b>fieldName: </b> Form field name to access for the field.`,
        `<b>initUrl: </b> Initialize url with given value.`,
        `<b>inputWidth: </b> Defaults to '100%'.`,
        `<b>isRequired: </b> T|F. Defaults to false.`,
        `<b>reqErrMsg: </b> Provide error message for required.`,
        `<b>errMsg: </b> Provide error message for pattern.`,
        `<b>placeholder: </b> Give placeholder value.`,
        `<b>handleChange: </b> Required. Callback function on change.`,
        `<b>lg|md|sm|xs: </b> Specify columns. Defaults to 6, 6, 8, 24 respectively.`
    ];

    const component = <UrlBinder baseForm={form}
                                 lg={10}
                                 label="URL"
                                 fieldName="url"
                                 initUrl={'test.com'}
                                 handleChange={value => { console.log('URL: ', value); }} />;

    const codeString = '<UrlBinder\n' +
        '  baseForm={form}\n' +
        '  label="URL"\n' +
        '  fieldName="url"\n' +
        '  initUrl={"test.com"}\n' +
        '  handleChange={value => {\n' +
        '    console.log("URL: ", value);\n' +
        '  }}\n' +
        '/>';

    return (
        <Beautify title={title}
                  options={options}
                  component={component}
                  codeString={codeString} />
    );
};