import React, { useState, useEffect } from 'react';
import 'rc-pagination/assets/index.css';
import { Form, Button, Col, Row, Table } from "react-bootstrap";
import 'bootstrap-daterangepicker/daterangepicker.css';
import Select from 'react-select';
import { currencyFormat } from '../../../src/utils/functions'
import imagePlaceholder from '../../assets/img/imagePlaceholder.jpg';

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
 *          key,
 *          currency:{
 *              code, 
 *              symbol
 *          } 
 *        } props 
 * @returns 
 */
const ProductRow = (props) => {


    const bodyParts = [
        {
            value: 1,
            label: "Left Arm",
        },
        {
            value: 2,
            label: "Right Arm",
        },
        {
            value: 3,
            label: "Chest",
        },
        {
            value: 4,
            label: "Neck",
        },
        {
            value: 5,
            label: "Back",
        },
        {
            value: 6,
            label: "Left Leg",
        },
        {
            value: 7,
            label: "Right Leg",
        },
        {
            value: 9,
            label: "Wrist"
        }
    ]
    const color = [
        {
            value: 1,
            label: "Black & White",
        },
        {
            value: 2,
            label: "Colored",
        },
        {
            value: 3,
            label: "Mixed",
        },
    ]
    const [lightbox, setLightBox] = useState(false)
    const [lightboxImageIsDownloadAllow, setLightboxImageIsDownloadAllow] = useState(false)
    const [lightboxImage, setLightBoxImage] = useState("")

    const products = props.products
    const [product, setProduct] = useState(props.product_)

    useEffect(() => {
        props.changeOrderRow(props.index, product)
    }, [product])


    return (
        <>
            {
                <>
                    {
                        lightbox &&
                        <div style={{
                            position: "fixed",
                            top: "0px",
                            right: "0px",
                            width: "100%",
                            zIndex: "9999",
                            height: "100vh",
                            textAlign: "center",
                            background: "#00000047"
                        }}>
                            <p onClick={() => setLightBox(false)}
                                style={{
                                    color: "#fff",
                                    fontSize: "30px",
                                    position: "fixed",
                                    top: "40px",
                                    right: "40px",
                                    background: "#F8940E",
                                    height: "45px",
                                    width: "45px",
                                    cursor: "pointer"
                                }}>X</p>
                            <img src={lightboxImage} style={{
                                width: "35%",
                                margin: "auto",
                                paddingTop: "4%"
                            }} />
                             {
                        lightboxImageIsDownloadAllow &&
                            <a className="btn btn-success" style={{
                                position: "fixed",
                                top: "40px",
                                right: "100px",
                                height: "45px",
                                fontSize: "25px",
                                margin: "auto",
                                lineHeight: "30px"
                            }} target="_black" href={lightboxImage}>Download</a>
                        }
                        </div>
                    }
                    <tr>
                        <td>
                            <p>
                                {products.map((item, index) => {
                                    if (item.value === props.product_?.productId) {
                                        return item.label
                                    }
                                })}
                            </p>
                            <p>
                                {
                                    props.productVariations.map(variation => {
                                        if (variation._id == props.product_?.variationId) {
                                            return variation.details.map(d => {
                                                return d.isColor == "true" ? `Color: ${d.colorCode}` : `   Size: ${d.value}`
                                            })

                                        }
                                    })
                                }
                            </p>
                            <br />

                            Prompt: {props?.product_?.designs[0]?.prompt}
                            {
                                props.product_?.productImage ?
                                    <img style={{ height: "50px" }} src={props.product_?.productImage} onClick={() => {
                                        setLightBox(true)
                                        setLightboxImageIsDownloadAllow(false)
                                        setLightBoxImage(props.product_?.productImage)
                                    }} />
                                    : ""
                            }
                        </td>
                        <td>
                            <Col md="12">
                                <Form.Group>
                                    <div id="productsDiv">
                                        <Row>
                                            <Table bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Design</th>
                                                        <th>Quantity</th>
                                                        <th>Size</th>
                                                        <th>Desire Text</th>
                                                        <th>Unit Price</th>

                                                    </tr>
                                                </thead>
                                                <tbody>

                                                    {props.product_.designs.map((design, index) => {
                                                        return (
                                                            <tr>
                                                                <td>
                                                                    <img style={{ height: "50px", width: "50px" }} src={design.image ? design.image : imagePlaceholder} onClick={() => {
                                                                        setLightBox(true)
                                                                        setLightboxImageIsDownloadAllow(true)
                                                                        setLightBoxImage(design.image ? design.image : imagePlaceholder)
                                                                    }} />
                                                                </td>
                                                                <td>
                                                                    {props.product_?.productId ? "-" :
                                                                        <Form.Control
                                                                            readOnly={props.paidAmount > 0 ? true : false}
                                                                            style={{ "height": "37px" }}
                                                                            onChange={(event) => {
                                                                                let temp = { ...product }
                                                                                temp.designs[index].quantity = event.target.value ? event.target.value : 1
                                                                                setProduct(temp)

                                                                            }}
                                                                            value={design.quantity}
                                                                            type="Number"
                                                                            min={1}
                                                                        ></Form.Control>
                                                                    }

                                                                </td>
                                                                <td>
                                                                    {design.sizeDetail}
                                                                </td>
                                                                <td>
                                                                    {
                                                                        design.desireText ?
                                                                            <>
                                                                                {design.desireText} <hr />
                                                                                {design.desireTextSizeGroupDetail} <hr />
                                                                                {design.desireTextColorCode}
                                                                            </>
                                                                            : "-"
                                                                    }


                                                                </td>
                                                                <td>  {currencyFormat(design.price)}  </td>
                                                            </tr>

                                                        )
                                                    })}
                                                </tbody>
                                            </Table>
                                        </Row>
                                    </div>
                                </Form.Group>
                            </Col>
                        </td>
                        <td>
                            <Select className='searchBlock productSelection' options={props.designImprintsOptions}
                                isDisabled={props.paidAmount > 0 ? true : false}
                                onChange={(event) => {
                                    setProduct({ ...product, designImprintId: event.value, designImprintPrice: event.price })
                                }}
                                value={props.designImprintsOptions.find(item => {
                                    return item.value === props.product_?.designImprintId
                                })} />
                            <p className="text-center">{currencyFormat(props.product_.designImprintPrice)}</p>
                        </td>
                        <td>
                            {!props.product_?.productId ? '-' :
                                <Form.Control
                                    readOnly={props.paidAmount > 0 ? true : false}
                                    style={{ "height": "37px" }}
                                    onChange={(event) => {
                                        if (event.target.value > 0) {
                                            let temp = { ...product }
                                            temp.quantity = event.target.value
                                            setProduct(temp)
                                        } else {
                                            setProduct({ ...product, quantity: 1 })
                                        }

                                    }}
                                    value={props.product_?.quantity}
                                    type="Number"
                                    min={1}
                                ></Form.Control>
                            }
                        </td>

                        <td>  {currencyFormat(props.product_?.price)}  </td>

                        <td>
                            {bodyParts.map((item, index) => {
                                if (item.value === props.product_?.bodyPart) {
                                    return item.label
                                }
                            })
                            }
                        </td>

                        <td>
                            {color.map((item, index) => {
                                if (item.value === props.product_?.color) {
                                    return item.label
                                }
                            })
                            }
                        </td>
                        <td> {currencyFormat(props.product_.subTotal)} </td>

                    </tr>
                </>

            }
        </>
    )
}

export default React.memo(ProductRow);