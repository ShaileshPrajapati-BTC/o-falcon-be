/**
 * Created by BHARGAV on 19/1/19 12:59 PM.
 */

import { Radio } from 'antd';
import React from 'react';

const RadioGroup = (props) => {
    const { defaultVal, list, listKey, val, label, onChange } = props;

    return (
        <div className="CustomRadio">
            <Radio.Group defaultValue={defaultVal}
                buttonStyle= "solid"
                onChange={onChange}>
                {
                    list.map((data) =>
                        <Radio.Button
                            key={data[listKey]}
                            className="gx-mb-0"
                            value={data[val]}>
                            {data[label]}
                        </Radio.Button>
                    )
                }
            </Radio.Group>
        </div>
    );
};

export default RadioGroup;
