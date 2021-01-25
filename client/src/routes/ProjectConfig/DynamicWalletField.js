import React from 'react';
import { Form, Button, Icon, Input, Row, Col, InputNumber } from 'antd';


const RowForm = (props) => {
  return (
    <Row type="flex" justify="start">
      <Col lg={7}>
        <Form.Item label={"Title"}>
          {props.form.getFieldDecorator(`title[${props.id.id}]`, {
            rules: [{ required: true, message: 'Please add title' }]
          })(<Input placeholder="Title" />)}
        </Form.Item>
      </Col>

      <Col lg={7}>
        <Form.Item label="Amount">
          {props.form.getFieldDecorator(`amount[${props.id.id}]`, {
            rules: [
              { required: true, message: 'Please add amount' },
              { pattern: /^[0-9]*$/, message: 'Please Enter Number!' }
            ]
          })(<InputNumber min={0} placeholder="Amount" />)}
        </Form.Item>
      </Col>

      <Col lg={7}>
        <Form.Item label="Bonus Amount">
          {props.form.getFieldDecorator(`bonusAmount[${props.id.id}]`, {
            rules: [
              { required: true, message: 'Please add bonus amount' },
              { pattern: /^[0-9]*$/, message: 'Please Enter Number!' }
            ]
          })(<InputNumber min={0} placeholder="Bonus Amount" />)}
        </Form.Item>

        <Form.Item style={{ display: 'none' }}>
          {props.form.getFieldDecorator(`id[${props.id.id}]`, {
            initialValue: props.id.id
          })(<Input />)}
        </Form.Item>
      </Col>
      <Icon type="delete" theme="twoTone" onClick={() => props.onDelete(props.id.id)} style={{ marginTop: 32, fontSize: 18 }} />
    </Row>

  )
}

const DynamicWalletTopUpsField = (props) => {

  let walletTopUpsData = props.form.getFieldValue('walletTopUps')

  const handleDelete = (rowIndex) => {
    const title = props.form.getFieldValue('title')
    const amount = props.form.getFieldValue('amount')
    const bonusAmount = props.form.getFieldValue('bonusAmount')
    const id = props.form.getFieldValue('id')

    const updatedData = title.map((el, i) => {
      return {
        title: el,
        amount: amount[i],
        bonusAmount: bonusAmount[i],
        id: id[i]
      }
    })
    const nonEmptyData = updatedData.filter(el => el.id !== undefined)

    const remainData = nonEmptyData.filter(el => el.id !== rowIndex)
    if (nonEmptyData.length > 0) {
      let id = 0;
      let data = { title: [], amount: [], bonusAmount: [], id: [], updatedWallTopUps: [] }
      for (let value of remainData) {
        let IncrementId = id++
        data.updatedWallTopUps.push({ ...value, id: IncrementId })
        data.title.push(...[value.title])
        data.amount.push(...[value.amount])
        data.bonusAmount.push(...[value.bonusAmount])
        data.id.push(...[IncrementId])
      }
      props.form.setFieldsValue({ walletTopUps: data.updatedWallTopUps })
      props.form.setFieldsValue({ title: data.title, amount: data.amount, bonusAmount: data.bonusAmount, id: data.id })
    }
  }

  const handleAdd = () => {
    let walletTopUpsData = props.form.getFieldValue('walletTopUps')
    let walletKeysLastId
    if (walletTopUpsData.length > 0) {
      walletKeysLastId = walletTopUpsData[walletTopUpsData.length - 1].id
      walletKeysLastId++
    }
    const nextKeys = [...walletTopUpsData, { title: '', amount: null, bonusAmount: null, id: walletKeysLastId ? walletKeysLastId : 0 }]
    props.form.setFieldsValue({ walletTopUps: nextKeys })
  }
  return (
    <React.Fragment>
      <Form.Item>
        {
          props.form.getFieldDecorator('walletTopUps',
            { initialValue: [], rules: [{ required: false }] }
          )(
            <React.Fragment>
              <span style={{ marginRight: 5 }}>Wallet TopUps</span>
              <Button type="dashed" onClick={handleAdd} style={{ marginTop: 15 }}>
                <Icon type="plus" /> Add</Button>
            </React.Fragment>
          )
        }
      </Form.Item>

      {
        (walletTopUpsData && walletTopUpsData.length > 0) &&
        walletTopUpsData.map((key, i) => <RowForm form={props.form} id={key} onDelete={handleDelete} />)
      }
    </React.Fragment>
  )
}



export default DynamicWalletTopUpsField
