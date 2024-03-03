import React, { useState, useEffect } from 'react';
import 'rc-pagination/assets/index.css';
import { Form, Button } from "react-bootstrap";
import Select from 'react-select';
import 'bootstrap-daterangepicker/daterangepicker.css';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import validator from 'validator';

/**
 * 
 * @param {
 *      index
 *      categories
 *      products
 *      updateRule
 *      deleteRule
 *      rule
 * } props 
 * @returns 
 */
const PromotionRuleTableRow = (props) => {
    const [loader, setLoader] = useState(true)
    const [rule, setRule] = useState(props.rule)
    const [products, setProducts] = useState([])
    const categories = props.categories
    
    useEffect(() => {
        setLoader(false)
       
        if (rule.type==3) {
            for (let i = 0; i < categories.length; i++) {
            
                 if (categories[i].value == props.rule.categoryId) {
                    setProducts(categories[i].products)
                }
            }
        }
    }, [])


    useEffect(() => {
        props.updateRule(rule, props.index)
    }, [rule])

    const handleKeyDown = (e) => {
        // Prevent the input if the key pressed is a decimal point
        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' ) {
          e.preventDefault();
        }
      };



      const isDateDisabled = () => {
        return new Date();
      };

      const isEndDateDisabled = () => {
        return props.rule.startDate ? props.rule.startDate : new Date();
      };


    return (
        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <>
                        <tr>
                            <td style={{ verticalAlign: "top" }}>
                                <Form.Group>
                                    <label>Min Qty</label>  <br></br>
                                    <Form.Control
                                        value={props.rule.minQty}
                                        onChange={(e) => {
                                            if (e.target.value > 0) {
                                                setRule({ ...rule, minQty: e.target.value.replace(/[^0-9]/g, '') })
                                            } else {
                                                setRule({ ...rule, minQty: '' })
                                            }
                                        }}
                                       
                                        placeholder="Value"
                                        min={1}
                                        type="Number"
                                        onKeyDown={handleKeyDown}
                                    ></Form.Control>
                                </Form.Group>
                            </td>
                            <td style={{ verticalAlign: "top" }}>
                                <div className='d-flex justify-content-between price-list'>
                                    <Form.Group>
                                        <label>Start Date</label>  <br></br>
                                        <DatePicker className='form-control'
                                            selected={props.rule.startDate ? new Date(props.rule.startDate) : ''}
                                            onChange={(date) => {
                                                // Check if endDate is less than startDate
                                                if (props.rule.endDate && date && date > new Date(props.rule.endDate)) {
                                                  setRule({ ...rule, startDate: date, endDate: '' });
                                                } else {
                                                  setRule({ ...rule, startDate: date });
                                                }
                                              }}
                                            minDate={new Date()} // Set the minimum date to the current date
                                            filterDate={isDateDisabled} // Function to disable dates
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <label>End Date</label>  <br></br>
                                        <DatePicker className='form-control'
                                            selected={props.rule.endDate ? new Date(props.rule.endDate) : ''}
                                            onChange={(date) => setRule({ ...rule, endDate: date })}
                                            minDate={props.rule.startDate ? props.rule.startDate : new Date()} // Set the minimum date to the current date
                                            filterDate={isEndDateDisabled} // Function to disable dates
                                        >
                                        </DatePicker>
                                    </Form.Group>
                                </div>

                            </td>
                            <td style={{ verticalAlign: "top" }}>
                                <Form.Group>
                                    <label className='mr-2'>Amount<span className="text-danger"></span></label>
                                    <Form.Control
                                        value={props.rule.discountAmount}
                                        onChange={(e) => setRule({ ...rule, discountAmount: e.target.value })}
                                        placeholder="Value"
                                        type="number"
                                        min={1}
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <label className='mr-2'>Compute Price<span className="text-danger"></span></label>
                                    <label className="right-label-radio mb-2 mr-2">
                                        <div className='d-flex align-items-center'>
                                            <input name={`discountfixed${props.index}`} type="radio" checked={props.rule.discountType == 1 || props.rule.discountType == "1"} value="1" onChange={(e) => setRule({ ...rule, discountType: 1 })} />

                                            <span className="checkmark black-checkmark"></span>
                                            <span className='ml-1' onChange={(e) => setRule({ ...rule, discountType: 1 })} ><i />Fixed Amount</span>
                                        </div>
                                    </label>
                                    <label className="right-label-radio mr-3 mb-2">
                                        <div className='d-flex align-items-center'>
                                            <input name={`discountpercentage${props.index}`} type="radio" checked={props.rule.discountType == 0 || props.rule.discountType == "0"} value="0" onChange={(e) => setRule({ ...rule, discountType: 0 })} />
                                            <span className="checkmark black-checkmark"></span>
                                            <span className='ml-1' onChange={(e) => setRule({ ...rule, discountType: 1 })}  ><i />Percentage</span>
                                        </div>
                                    </label>
                                </Form.Group>
                            </td>
                            <td className="td-actions text-center">
                                <ul className="list-unstyled mb-0">
                                    <li className="d-inline-block align-top">
                                        <Button
                                            className="btn-action btn-danger"
                                            type="button"
                                            variant="danger" title="Delete"
                                            onClick={() => props.deleteRule(props.index)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <Form.Group>
                                    <label className='mr-2'>Apply On<span className="text-danger"> *</span></label>
                                    <label className="right-label-radio mb-2 mr-2">
                                        <input name={props.index} type="radio" checked={props.rule.type == 1} value="1" onChange={(e) => { setRule({ ...rule, type: e.target.value }) }} />
                                        <span className="checkmark black-checkmark"></span>
                                        <span className='ml-1'><i />All Products</span>
                                    </label>
                                    <label className="right-label-radio mr-3 mb-2">
                                        <input name={props.index} type="radio" checked={props.rule.type == 2} value="2" onChange={(e) => { setRule({ ...rule, type: e.target.value }) }} />
                                        <span className="checkmark black-checkmark"></span>
                                        <span className='ml-1'><i />Specific Category</span>
                                    </label>
                                    <label className="right-label-radio mr-3 mb-2">
                                        <input name={props.index} type="radio" checked={props.rule.type == 3} value="3" onChange={(e) => { setRule({ ...rule, type: e.target.value }) }} />
                                        <span className="checkmark black-checkmark"></span>
                                        <span className='ml-1'><i />Specific Product</span>
                                    </label>
                                    <label className="right-label-radio mr-3 mb-2">
                                        <input name={props.index} type="radio" checked={props.rule.type == 4} value="4" onChange={(e) => { setRule({ ...rule, type: e.target.value }) }} />
                                        <span className="checkmark black-checkmark"></span>
                                        <span className='ml-1'><i />Tattoos</span>
                                    </label>
                                </Form.Group>
                            </td >
                            <td>
                                {props.rule.type == 2 || props.rule.type == 3 ?
                                    <Form.Group>
                                        <label>Select Category<span className="text-danger"> *</span></label>
                                        <Select classNamePrefix='custom'
                                            placeholder="Select Category"
                                            options={categories}
                                            onChange={(option) => {
                                                setRule({ ...rule, categoryId: option.value })
                                                setProducts(option.products)
                                            }}
                                            value={categories?.filter(option => option.value === props.rule.categoryId)}
                                        />
                                    </Form.Group>
                                    : ""
                                }
                            </td>
                            <td colSpan={2}>
                                {props.rule.type == 3 ?
                                    <Form.Group>
                                        <label>Select Product<span className="text-danger"> *</span></label>
                                        <Select classNamePrefix='custom'
                                            placeholder="Select Product"
                                            options={products}
                                            onChange={(option) => setRule({ ...rule, productId: option.value })}
                                            value={products?.filter(option => option.value === props.rule.productId)}
                                        />
                                    </Form.Group>
                                    : ""
                                }
                            </td>
                        </tr>
                    </>

            }
        </>
    )
}

export default React.memo(PromotionRuleTableRow);