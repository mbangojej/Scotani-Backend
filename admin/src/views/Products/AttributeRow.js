import React, { useState, useEffect } from 'react';
import 'rc-pagination/assets/index.css';
import { Form, Button, Table } from "react-bootstrap";
import 'bootstrap-daterangepicker/daterangepicker.css';
import Select from 'react-select';
import ValueRow from './ValueRow';
import { ENV } from '../../config/config';
/**
 * 
 * @param { index, addAttribute, removeAttribute, updateAttributes  }
 * @returns 
 */
const AttributeRow = (props) => {
    const [rowIndex, setRowIndex] = useState(props.index)
    const [attribute, setAttribute] = useState(props.attribute)
    const [values, setValues] = useState(props.attribute.values)
    const [typeOptions, setTypeOptions] = useState([
        {
            value:"isSimple",
            label:"Simple"
        },
        {
            value:"isColor",
            label:"Color"
        },
        {
            value:"isImage",
            label:"Image"
        },
        {
            value:"isMeasurement",
            label:"Measurement"
        }
    ])


    const [type, setType] = useState('')
    useEffect(()=>{
        if(attribute.isColor) setType('isColor')
        else if(attribute.isImage) setType('isImage')
        else if(attribute.isMeasurement) setType('isMeasurement')
        else setType('isSimple')
    },[])
    const updateAttribute = (name, value) => {
        if(name != 'type'){
            setAttribute({
                ...attribute,
                [name]: value
            })
        }else{
            setType(value)
            let isColor = false;
            let isMeasurement = false;
            let isImage = false;
            switch(value){
                case 'isSimple':
                    isColor = false
                    isImage = false
                    isMeasurement = false
                    break
                case 'isColor':
                    isColor = true
                    isImage = false
                    isMeasurement = false
                    break
                case 'isImage':
                    isColor = false
                    isImage = true
                    isMeasurement = false
                    break
                case 'isMeasurement':
                    isColor = false
                    isImage = false
                    isMeasurement = true
                    break
            }
            setAttribute({
                ...attribute,
                isColor: isColor,
                isMeasurement: isMeasurement,
                isImage: isImage, 
            })
        }
    }

    const addValue = () => {
        setValues([...values, {
            title: '',
            image: '',
            colorCode: '',
            measurementScale: ''
        }])
    }
    const removeValue = (index) => {
        let values_ = [...values];
        values_.splice(index, 1); // 2nd parameter means remove one item only
        setValues(values_)
    }
    const updateValues = (value, index) => {
        let values_ = [...values];
        values_[index] = value
        setValues(values_)
    }

     useEffect(()=>{
        let attribute_ = {...attribute, values: values}
        props.updateAttributes(attribute_, rowIndex)
    },[attribute, values])


    return (
        <>
            {
                <tr key={`attribute${rowIndex}`}>
                    <td>
                        <p>{attribute.title}</p>
                    </td>

                
                    <td>
                        <p>
                            {attribute.isColor ? "Color" : ( attribute.isMeasurement ? "Measurment" : (attribute.isImage ? "Image" : "Simple" )  )}
                        
                        </p>
                    </td>
                    <td className="valuesTable">
                        <Table bordered size="sm" >
                            <thead>
                                <tr>
                                {attribute.title === 'Color' &&
                                    <th style={{ "width": "30%" }}>Image</th>}
                                    <th style={{ "width": "30%" }}>Title</th>
                                    <th style={{ "width": "20%" }}>Extras</th>
                                    <th style={{ "width": "5%" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    values.map((value, index)=>{
                                        return ( 
                                            <ValueRow 
                                                attribute={attribute}
                                                rowIndex={rowIndex}
                                                value={value} 
                                                index={index} 
                                                type={type}
                                                addValue={addValue}
                                                removeValue={removeValue}
                                                updateValues={updateValues}
                                                isLast={index == (values.length - 1)}
                                                count={values.length}
                                            />
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </td>
                </tr>
                   
            }
        </>
    )
}

export default AttributeRow;