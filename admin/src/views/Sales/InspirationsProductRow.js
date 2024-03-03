import React, { useState, useEffect } from 'react';
import 'rc-pagination/assets/index.css';
import { Form, Button, Row, Col } from "react-bootstrap";
import 'bootstrap-daterangepicker/daterangepicker.css';
import Select from 'react-select';
import { currencyFormat } from '../../../src/utils/functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { Link } from "react-router-dom";

/**
 * 
 * @param {
 *          products, 
 *          product:{
 *              productId, 
 *              price, 
 *              quantity
 *              bodyPart, 
 *          },
 *          index,
 *          changeOrderRow, 
 *          removeProduct, 
 *          addProduct, 
 *          key,
 *          currency:{
 *              code, 
 *              symbol
 *          } 
 *        } props 
 * @returns 
 */
const InspirationsProductRow = (props) => {
    const products = props.products
    const [product, setProduct] = useState(props.product_)

    useEffect(() => {
        props.changeOrderRow(props.index, product)
    }, [product])

    const handleKeyDown = (e) => {
        // Prevent the input if the key pressed is a decimal point
        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };

    return (
        <>
            {
                <>
                    <tr>
                        <td>
                            <Row>
                                <Col md={10}>
                                    <Select className='searchBlock productSelection' options={products}
                                        styles={{ menu: provided => ({ ...provided, zIndex: 99999999 }) }}
                                        isDisabled={props.paidAmount > 0 ? true : false}
                                        onChange={(event) => {
                                            setProduct({ ...product, productId: event.value, price: event.price })
                                        }}
                                        value={products.find(item => { return item.value === props.product_?.productId })} />
                                </Col>
                                <Col md={2}>
                                    {props.product_?.productId &&
                                        <Link target="_blank" to={`/edit-product/${props.product_?.productId}`}>
                                            <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: "25px", margin: "auto", marginTop: "5px", color: "#CCC" }} />
                                        </Link>
                                    }
                                </Col>
                            </Row>
                        </td>

                        <td>
                            <Form.Control
                                style={{ "height": "37px" }}
                                readOnly={props.paidAmount > 0 ? true : false}
                                onChange={(event) => {
                                    if (event.target.value > 0) {
                                        const sanitizedValue = event.target.value.replace(/[^0-9]/g, '');
                                        setProduct({ ...product, quantity: sanitizedValue })
                                    } else {
                                        setProduct({ ...product, quantity: 1 })
                                    }
                                }}
                                value={props.product_.quantity}
                                type="Number"
                                min={1}
                                onKeyDown={handleKeyDown}
                            ></Form.Control>
                        </td>
                        <td>

                            {currencyFormat(props.product_.price)}
                        </td>
                        <td>
                            {currencyFormat(props.product_.quantity * props.product_.price)}
                        </td>
                        {(!props.paidAmount || props.paidAmount <= 0) &&
                            <td>
                                <ul className="d-inline-block list-unstyled mb-0">
                                    <li className="d-inline-block align-top">
                                        <Button
                                            className="btn-action btn-danger"
                                            type="button"
                                            variant="danger" title="Delete"
                                            onClick={() => props.removeProduct(props.index)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </li>
                                    {props.isLast &&
                                        <li className="d-inline-block align-top">
                                            <Button
                                                className="btn-action btn-success"
                                                type="button"
                                                variant="success" title="Add Attribute"
                                                onClick={() => props.addProduct()}
                                            >
                                                <i className="fas fa-plus"></i>
                                            </Button>
                                        </li>
                                    }
                                </ul>
                            </td>
                        }
                    </tr>
                </>

            }
        </>
    )
}


export default React.memo(InspirationsProductRow);