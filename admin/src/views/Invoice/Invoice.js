import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
import 'rc-pagination/assets/index.css'
import { Button, Card, Form, Table, Container, Row, Col, Modal } from "react-bootstrap"
import { Link } from 'react-router-dom'
import { beforeSale, getInvoice, refundAmount, registerPayment } from '../Sales/Sale.action'
import { ENV } from '../../config/config';
import { currencyFormat } from '../../../src/utils/functions'
import Select from "react-select";
import { Helmet } from 'react-helmet';

const Invoice = (props) => {
    const [loader, setLoader] = useState(true)
    const [data, setData] = useState([])
    const [refundModal, setRefundModal] = useState(false)
    const [refundAmount, setRefundAmount] = useState(0)
    const [paidStatus, setPaidStatus] = useState(0)
    const [refundPayload, setRefundPayload] = useState([])
    const invoiceStatusOptions = [
        {
            label: 'Paid',
            value: '4',
        },
        {
            label: 'Unpaid',
            value: '2',
        }
    ]
    const [msg, setMsg] = useState({
        refundAmount: ""
    })
    // const [allPrices, setAllPrices] = useState({
    //     systemProducts: [],
    //     nonSystemProducts: []
    // })
    const [allPrices, setAllPrices] = useState([])
    const orderId = window.location.pathname.split('/')[3]
    useEffect(() => {
        window.scroll(0, 0)
        props.getInvoice(window.location.pathname.split('/')[3])
    }, [])
    useEffect(() => {
        if (props.sale.getOrderAuth) {
            setData(props.sale.order)
            setPaidStatus(props.sale.order.paidAmount.toFixed(2) == 0 ? '2' : '4')
            props.beforeSale()

            let allPrices_ = []
            props.sale.order.systemProducts.map(sp => {
                allPrices_.push(sp.subTotal)
            })
            props.sale.order.nonSystemProducts.map(nsp => {
                allPrices_.push(nsp.subTotal)
            })
            setAllPrices(allPrices_)
            setRefundModal(false)
            setLoader(false)
        }
    }, [props.sale.getOrderAuth]);  // Order Fetched
    useEffect(() => {
        if (props.sale.paymentRegisterAuth) {
            setTimeout(() => {
                setLoader(false)
            }, 2000);

            props.getInvoice(window.location.pathname.split('/')[3])
        }
    }, [props.sale.paymentRegisterAuth]);
    useEffect(() => {
        if (props.sale.paymentRefundedAuth) {
            setLoader(true)
            props.getInvoice(window.location.pathname.split('/')[3])
        }
    }, [props.sale.paymentRefundedAuth]);  // Payment Refunded
    //Static Value of Color
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
    //Static Value of Body
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
    const getMatchValue = (value, object) => {
        const matchingObject = object.filter(item => item.value === value);
        const matchingValue = matchingObject.map(item => item.label);
        return matchingValue;
    }
    const refundSubmit = () => {
        let remainingAmount= data.paidAmount - data.refundedAmount
        remainingAmount=  remainingAmount.toFixed()
        
        if (!refundAmount || refundAmount == 0) {
            setMsg({
                refundAmount: "Refund Amount must be greater than 0"
            })
        } else if (refundAmount > remainingAmount) {
            setMsg({
                refundAmount: `Refund Amount must be less than or equal to ${remainingAmount}`
            })
        } else {
            setLoader(true)
            props.refundAmount({
                orderId: window.location.pathname.split('/')[3],
                refundAmount: refundAmount,
                refundPayload: JSON.stringify(refundPayload)
            })
        }
    }
    const registerPayment = () => {
        setLoader(true)
        props.registerPayment({
            _id: orderId,
            paidStatus: paidStatus
        })
    }
    const updateRefundPayload = (productId, type, refundAmount) => {
        let oldRefundPayload = refundPayload
        oldRefundPayload = [...oldRefundPayload, { productId: productId, type: type, refundAmount: refundAmount }]
        let totalRefund = 0
        oldRefundPayload.map((o) => totalRefund = parseFloat(totalRefund) + parseFloat(o.refundAmount))
        setRefundAmount(totalRefund)
        setRefundPayload(oldRefundPayload)
    }
    const removeRefundPayload = (productId) => {
        let oldRefundPayload = refundPayload
        oldRefundPayload = oldRefundPayload.filter(o => o.productId != productId)
        let totalRefund = 0
        oldRefundPayload.map((o) => totalRefund = parseFloat(totalRefund) + parseFloat(o.refundAmount))
        setRefundAmount(totalRefund)
        setRefundPayload(oldRefundPayload)
    }

    const distributePriceToFactors = (price, factor) => {
        let factorsTotal = 0
        allPrices.map((price_) => {
                factorsTotal += parseFloat(price_) ;
        });
        console.log("🚀 ~ file: Invoice.js:167 ~ factorsTotal ~ factorsTotal:", factorsTotal)
        return parseFloat(price / factorsTotal * factor).toFixed(2)
    }
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Invoice</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy">
                                    <Card.Header>
                                        <Row>
                                            <Col md="6">
                                                <Card.Title as="h4">
                                                    Invoice {data.invoice_nr}  {data.refundedAmount > 0 ? <span style={{ color: "red" }}>Refunded</span> : ''}
                                                </Card.Title>
                                                <Row className='padding-row'>
                                                    <Col md={6}>
                                                        <Select options={invoiceStatusOptions}
                                                            onChange={(event) => setPaidStatus(event.value)}
                                                            value={invoiceStatusOptions.filter(option => option.value === paidStatus)}
                                                        />
                                                    </Col>
                                                    <Col md={4}>
                                                        <Button onClick={registerPayment} className="btn-fill pull-right" variant="info">
                                                            Update Invoice
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col md="6">
                                                <ul className="list-unstyled mb-0 float-right">

                                                    <li className="d-inline-block align-top padding-row-button">
                                                        <a href={ENV.invoicePath + data.invoice_nr + ".pdf"} target="_blank" className=" pull-right" >
                                                            <Button className="btn-fill pull-right mt-3" variant="info">
                                                                Download Invoice
                                                            </Button>&nbsp;
                                                        </a>
                                                    </li>
                                                        
                                                    {data.paidAmount > 0 && data.paidAmount.toFixed() != data.refundedAmount.toFixed() ?
                                                        //update 01/11/2023
                                                       // removed 2 inside .toFixed() creating issue with decimal value  in above condition
                                                        <li className="d-inline-block align-top padding-row-button">
                                                            <Button className="btn-fill pull-right mt-3" variant="warning" onClick={() => {
                                                                setRefundModal(!refundModal)
                                                                setRefundAmount(0)
                                                                setRefundPayload([])
                                                            }}>
                                                                Refund Invoice  
                                                            </Button>
                                                        </li>
                                                        : ""}
                                                </ul>
                                            </Col>
                                        </Row>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label>Customer</label>
                                                    <p>{data.shipping.name}</p>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label>Email</label>
                                                    <p>{data.shipping.email}</p>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label>Mobile</label>
                                                    <p>{data.shipping.mobile}</p>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label>Address</label>
                                                    <p>{data.shipping.address}</p>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        {data.systemProducts.length > 0 &&
                                            <Card.Title as="h4" className="mb-2">System Products</Card.Title>
                                        }
                                        <Row>
                                            {data.systemProducts.length > 0 &&
                                                <Col md="12">
                                                    <Form.Group>
                                                        <div id="productsDiv">
                                                            <Row>
                                                                <Table bordered size="sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ "width": "40%" }}>Product</th>
                                                                            <th style={{ "width": "10%" }}>Quantity</th>
                                                                            <th style={{ "width": "15%" }}>Unit Price</th>
                                                                            <th style={{ "width": "15%" }}>Sub Total</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            data.systemProducts.map((item, index) => {
                                                                                return (
                                                                                    <tr key={index}>
                                                                                        <td>{item.item} <span style={{ color: "red" }}> {item.isRefunded ? <span style={{ color: "red" }}>Refunded</span> : ''}</span></td>
                                                                                        <td>{item.quantity}</td>
                                                                                        <td>{currencyFormat(item.price)}</td>
                                                                                        <td>{currencyFormat(item.subTotal)}</td>
                                                                                    </tr>
                                                                                )
                                                                            })

                                                                        }
                                                                    </tbody>
                                                                </Table>
                                                            </Row>
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                            }
                                        </Row>
                                        {data.nonSystemProducts.length > 0 &&
                                            <Card.Title as="h4" className="mb-2">Non System Products</Card.Title>
                                        }
                                        <Row>
                                            {data.nonSystemProducts.length > 0 &&
                                                <Col md="12">
                                                    <Form.Group>
                                                        <div id="productsDiv">
                                                            <Row>
                                                                <Table bordered size="sm">
                                                                    <thead>
                                                                        <tr>
                                                                            <th style={{ "width": "15%" }}>Product</th>
                                                                            <th style={{ "width": "35%" }}>Design</th>
                                                                            <th style={{ "width": "10%" }}>Body Part</th>
                                                                            <th style={{ "width": "10%" }}>Color</th>
                                                                            <th style={{ "width": "10%" }}>Price</th>
                                                                            <th style={{ "width": "10%" }}>Quantity</th>
                                                                            <th style={{ "width": "10%" }}>Sub Total</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {
                                                                            data.nonSystemProducts.map((item, index) => {
                                                                                return (
                                                                                    <tr key={index}>
                                                                                        <td>

                                                                                            <p>{item.item} <span style={{ color: "red" }}>{item.isRefunded ? "Refunded" : ''}</span></p>
                                                                                            {item.subTitle &&

                                                                                                <span>Prompt:{item.subTitle}</span>
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

                                                                                                                        <th style={{ "width": "5%" }}>Design</th>
                                                                                                                        <th style={{ "width": "3%" }}>Quantity</th>
                                                                                                                        <th style={{ "width": "10%" }}>Unit Price</th>

                                                                                                                    </tr>
                                                                                                                </thead>
                                                                                                                <tbody>

                                                                                                                    {item.innerDesign.map((design, index) => {
                                                                                                                        return (
                                                                                                                            <tr>
                                                                                                                                <td>  <img style={{ height: "50px", width: "50px" }} src={design.image ? design.image : imagePlaceholder} /></td>
                                                                                                                                <td>{design.quantity} </td>
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

                                                                                        <td>{getMatchValue(item.bodyPart, bodyParts)} </td>
                                                                                        <td>{getMatchValue(item.color, color)} </td>
                                                                                        <td>{item.price}</td>
                                                                                        <td>{item.quantity}</td>
                                                                                        <td>{currencyFormat(item.subTotal)}</td>

                                                                                    </tr>
                                                                                )
                                                                            })

                                                                        }
                                                                    </tbody>
                                                                </Table>
                                                            </Row>
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                            }
                                            <Col md="6" sm="6"></Col>
                                            <Col md="6" sm="6">
                                                <Table bordered>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                Sub Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(data.subtotal)}
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                Discount
                                                            </td>
                                                            <td>
                                                                {currencyFormat(data.discountTotal)}
                                                            </td>
                                                        </tr>

                                                        {data.taxtTotal > 0 ?
                                                            <tr>
                                                                <td>
                                                                    VAT ({data.vatPercentage} %)
                                                                </td>
                                                                <td>
                                                                    {currencyFormat(data.taxtTotal)}
                                                                </td>
                                                            </tr>
                                                            : ''}
                                                        <tr>
                                                            <td>
                                                                Grand Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(data.grandTotal)}
                                                            </td>
                                                        </tr>
                                                        {data.paidAmount > 0 ?
                                                            <>
                                                                <tr>
                                                                    <td>
                                                                        Amount Paid
                                                                    </td>
                                                                    <td>
                                                                        {currencyFormat(data.paidAmount)}
                                                                    </td>
                                                                </tr>
                                                                {
                                                                    (data.grandTotal - data.paidAmount) > 0 &&
                                                                    <tr>
                                                                        <td>
                                                                            Remaining Amount
                                                                        </td>
                                                                        <td>
                                                                            {currencyFormat(data.grandTotal - data.paidAmount)}
                                                                        </td>
                                                                    </tr>
                                                                }
                                                                {
                                                                    data.refundedAmount > 0 &&
                                                                    <tr>
                                                                        <td>
                                                                            Refunded Amount
                                                                        </td>
                                                                        <td>
                                                                            {currencyFormat(data.refundedAmount.toFixed())}
                                                                        </td>
                                                                    </tr>
                                                                }
                                                            </>
                                                            : ""}
                                                    </tbody>
                                                </Table>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <Link to={'/edit-sale/' + orderId} className=" pull-right" >
                                                    <Button className="btn-fill pull-right mt-3" variant="info">
                                                        Back
                                                    </Button>
                                                </Link>
                                            </Col>
                                        </Row>

                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {
                            refundModal &&
                            <Modal size="lg" className="modal-primary" id="content-Modal" onHide={() => setRefundModal(!refundModal)} show={refundModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                Refund Amount  ( {data.invoice_nr} )
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group>
                                                    {
                                                        data.systemProducts.length > 0 &&
                                                        <>
                                                            <label> System Products </label>
                                                            <ul class="" style={{ listStyle: "none" }}>
                                                                {
                                                                    data.systemProducts.map((systemProduct, index) => {
                                                                        data.couponDiscountAmount = data.couponDiscountAmount ?? 0
                                                                        let refundablePrice = systemProduct.subTotal
                                                                        if (data.discountTotal > 0) {
                                                                            if (data.couponDiscountType == 1) {
                                                                                
                                                                                refundablePrice = systemProduct.subTotal - distributePriceToFactors(data.discountTotal, systemProduct.subTotal)
                                                                            } else if (data.couponDiscountType == 0) {
                                                                                refundablePrice = systemProduct.subTotal - (systemProduct.subTotal * data.couponDiscountAmount / 100)
                                                                            }
                                                                        }
                                                                        return (
                                                                            !systemProduct.isRefunded &&
                                                                            <li>
                                                                                <label for={`systemCheck${index}`} key={index}>
                                                                                    <input type="checkbox" name={`systemCheck${index}`} id={`systemCheck${index}`}
                                                                                        onClick={(e) => {
                                                                                            if (e.target.checked) {
                                                                                                updateRefundPayload(systemProduct._id, 0, refundablePrice)
                                                                                            } else {
                                                                                                removeRefundPayload(systemProduct._id)
                                                                                            }
                                                                                        }} /> {systemProduct.item} Refundable ( ${refundablePrice} )
                                                                                </label>
                                                                            </li>
                                                                        )
                                                                    })
                                                                }
                                                            </ul>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    {
                                                        data.nonSystemProducts.length > 0 &&
                                                        <>
                                                            <label> Non System Products </label>
                                                            <ul class="" style={{ listStyle: "none" }}>
                                                                {
                                                                    data.nonSystemProducts.map((nonSystemProduct, index) => {
                                                                        data.couponDiscountAmount = data.couponDiscountAmount ?? 0
                                                                        let refundablePrice = nonSystemProduct.subTotal
                                                                        if (data.discountTotal > 0) {
                                                                            if (data.couponDiscountType == 1) {
                                                                                refundablePrice = nonSystemProduct.subTotal  - distributePriceToFactors(data.discountTotal, nonSystemProduct.subTotal)
                                                                            } else if (data.couponDiscountType == 0) {
                                                                                refundablePrice = nonSystemProduct.subTotal - (nonSystemProduct.subTotal * data.couponDiscountAmount / 100)
                                                                            }
                                                                        }
                                                                        return (
                                                                            !nonSystemProduct.isRefunded &&
                                                                            <li>
                                                                                <label for={`nonSystemCheck${index}`} key={index}>
                                                                                    <input type="checkbox" name={`nonSystemCheck${index}`} id={`nonSystemCheck${index}`}
                                                                                        onClick={(e) => {
                                                                                            if (e.target.checked) {
                                                                                                updateRefundPayload(nonSystemProduct._id, 1, refundablePrice)
                                                                                            } else {
                                                                                                removeRefundPayload(nonSystemProduct._id)
                                                                                            }
                                                                                        }} /> Prompt:{nonSystemProduct.subTitle} Refundable ( ${refundablePrice} )
                                                                                </label>
                                                                            </li>
                                                                        )
                                                                    })
                                                                }
                                                            </ul>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <label>Amount to refund <span className="text-danger">*</span></label>
                                                    <Form.Control
                                                        disabled={true}
                                                        type="number"
                                                        value={refundAmount}
                                                        onChange={(event) => setRefundAmount(event.target.value)}
                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, refundAmount: '' }))}
                                                        min={0}
                                                        max={data.paidAmount}
                                                    />
                                                    <span className={msg.refundAmount ? `` : `d-none`}>
                                                        <small className="pl-1 text-danger">{msg.refundAmount}</small>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-success" onClick={() => refundSubmit()}>Refund</Button>
                                    <Button className="btn btn-danger" onClick={() => setRefundModal(!refundModal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container >
            }
        </>
    )
}
const mapStateToProps = state => ({
    sale: state.sale,
    error: state.error,

});

export default connect(mapStateToProps, { beforeSale, getInvoice, refundAmount, registerPayment })(Invoice);