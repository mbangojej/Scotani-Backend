import React, { useState, useEffect } from 'react';
import 'rc-pagination/assets/index.css';
import { Form, Button, Table } from "react-bootstrap";
import 'bootstrap-daterangepicker/daterangepicker.css';
import { ENV } from '../../config/config';
import Select from 'react-select'
import userDefaultImg from '../../assets/img/imagePlaceholder.jpg';
/**
 * 
 * @param { index, type, removeValue, addValue, updateValues, isLast  }
 * @returns 
 */
const ValueRow = (props) => {

    const [rowIndex, setRowIndex] = useState(props.index)
    const [type, setType] = useState(props.type)


    const sizeOptions = [
        {
            value: "XS",
            label: "XS"
        },
        {
            value: "S",
            label: "S"
        },
        {
            value: "M",
            label: "M"
        },
        {
            value: "L",
            label: "L"
        },
        {
            value: "XL",
            label: "XL"
        },
        {
            value: "XXL",
            label: "XXL"
        },
    ]


    const [value, setValue] = useState(props.value)

    const updateValue = (name, value_) => {
        setValue({
            ...value,
            [name]: value_
        })
    }
    useEffect(() => {
        props.updateValues(value, rowIndex)
    }, [value])
    const fileSelectHandler = (e) => {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            updateValue('image', reader.result);
        };
        reader.readAsDataURL(files[0]);
    };

    const [msg, setMsg] = useState({
        image: "",
    })

    const submitPic = async (e) => {


        const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
        const selectedFile = e.target.files[0];

        if (allowedFormats.includes(selectedFile.type)) {
            try {
                const res = await ENV.uploadImage(e);
                updateValue('image', res ? ENV.uploadedImgPath + res : '')

                // Clear the image validation error if it was previously set
                setMsg({ ...msg, image: '' });
            } catch (error) {
                // Handle the error, if necessary
            }
        } else {

            setMsg({ ...msg, image: 'Invalid file format. Only PNG and JPG images are allowed.' });
            updateValue('image', '')
        }
    };
    return (
        <tr key={`value${rowIndex}`}>
            {props.attribute.title === 'Color' &&
                <td className='config-product-table'>
                    <div className='mb-2'>
                        <img className="img-thumbnail" src={value.image ? value.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = value.image }} style={{ width: '100px' }} />
                    </div>

                    <Form.Control
                        className='text-white mb-2'
                        onChange={async (e) => {
                            submitPic(e)
                        }}
                        type="file"
                        accept=".png, .jpg, .jpeg"
                    ></Form.Control>

                    <span className={msg.image ? `` : `d-none`}>
                        {<label className="pl-1 text-danger">{msg.image}</label>}
                    </span>
                    <span>
                    <label className="pl-1 text-success">Recommended Image Size: 500px x 500px</label>
                    </span>
                </td>
            }

            {props.attribute.title === 'Color' &&
                <td>
                    <Form.Control
                        style={{ "height": "37px" }}
                        onChange={(event) => { updateValue('title', event.target.value) }}
                        value={value.title}
                        type="text"
                    ></Form.Control>
                </td>}

            {props.attribute.title === 'Size' &&
                <td>
                    <Form.Group>
                        <Select styles={{ menu: provided => ({ ...provided, zIndex: 999999 }) }} options={sizeOptions}
                            onChange={(event) => { updateValue('title', event.value) }}
                            value={sizeOptions.filter(option => option.value === value.title)}
                        />
                    </Form.Group>
                </td>
            }
            <td>
                {
                    props.type == 'isMeasurement' &&
                    <Form.Control
                        style={{ "height": "37px" }}
                        onChange={(event) => { updateValue('measurementScale', event.target.value) }}
                        value={value.measurementScale}
                        type="text"
                    ></Form.Control>
                }
                {
                    props.type == 'isColor' &&
                    <Form.Control
                        style={{ "height": "37px" }}
                        onChange={(event) => { updateValue('colorCode', event.target.value) }}
                        value={value.colorCode}
                        type="color"
                    ></Form.Control>
                }

                {
                    props.type == 'isImage' &&
                    <>
                        {value.image && <img src={value.image} style={{ height: "30px", width: "30px" }} />}
                        <Form.Group>
                            <Form.Control
                                className='text-white'
                                onChange={async (e) => {
                                    fileSelectHandler(e);
                                    const res = await ENV.uploadImage(e);
                                    updateValue('image', res ? ENV.uploadedImgPath + res : '');
                                }}
                                type="file"
                                accept=".png, .jpg, .jpeg"
                            ></Form.Control>
                        </Form.Group>
                    </>
                }
            </td>
            <td>
                <ul className="d-inline-block list-unstyled mb-0">
                    {props.count > 1 &&
                        <li className="d-inline-block align-top">
                            <Button
                                className="btn-action btn-danger"
                                type="button"
                                variant="danger" title="Delete Value"
                                onClick={() => props.removeValue(rowIndex)}
                            >
                                <i className="fas fa-trash"></i>
                            </Button>
                        </li>
                    }
                    {props.isLast &&
                        <li className="d-inline-block align-top">
                            <Button
                                className="btn-action btn-success"
                                type="button"
                                variant="success" title="Add Value"
                                onClick={() => props.addValue()}
                            >
                                <i className="fas fa-plus"></i>
                            </Button>
                        </li>
                    }
                </ul>
            </td>
        </tr>

    )
}

export default React.memo(ValueRow);