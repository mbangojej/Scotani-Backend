import React, { useState, useEffect } from 'react';
import 'rc-pagination/assets/index.css';
import { Card, Form, Table, Row, Col } from "react-bootstrap"
import 'bootstrap-daterangepicker/daterangepicker.css';
import { currencyFormat } from '../../utils/functions'
import ProductRow from './ProductRow'

const Tattoo = (props) => {
    const [orderProducts, setOrderProducts] = useState(props.orderTattooProducts);
    const [orderData, setOrderData] = useState({
        customer: null,
        vatPercentage: null,
        status: true,
        subTotal: 0,
        taxTotal: 0,
        grandTotal: 0
    })
    useEffect(() => {
        updateOrderProducts(orderProducts)
    }, [orderProducts])
    // Update Product Row Data
    const changeOrderRow = (index, product_) => {
        let localOrderProducts = [...orderProducts];
        localOrderProducts[index] = product_
        updateOrderProducts(localOrderProducts)
    }
    // Update the Products in the order
    const updateOrderProducts = (localProducts) => {
        updateOrderTotals(localProducts)
        setOrderProducts(localProducts);
        props.updateOrderTattooProducts(localProducts)
    }
    // Order Products calculations updated
    const updateOrderTotals = (localProducts) => {
        let total = {
            subTotal: 0,
        }
        localProducts.map((product, index) => {
            let t = 0;

            if (product.productId) {
                let dp = 0
                product.designs.map((item) => {
                    dp += item.price * item.quantity;
                })
                t += (dp + product.price + product.designImprintPrice) * product.quantity;
            } else {
                product.designs.map((item) => {
                    t += item.price * item.quantity;
                })
            }

            let temp = { ...orderProducts }
            temp[index].subTotal = t.toFixed(2)
            setOrderProducts(temp)
            total.subTotal += t;
        })
        setOrderData({ ...orderData, subTotal: total.subTotal, taxTotal: total.taxTotal, grandTotal: total.grandTotal })
    }

    return (
        <>
            {
                <>
                    <Card.Title as="h4" className="mb-2">Products</Card.Title>
                    <Row>
                        <Col md="12">
                            <Form.Group>
                                <div id="productsDiv">
                                    <Row>
                                        <Table bordered size="sm">
                                            <thead>
                                                <tr>

                                                    <th style={{ "width": "20%" }}>Product</th>
                                                    <th style={{ "width": "25%" }}>Design</th>
                                                    <th style={{ "width": "25%" }}>Design Imprint</th>
                                                    <th style={{ "width": "15%" }}>Quantity</th>
                                                    <th style={{ "width": "20%" }}>Price</th>
                                                    <th style={{ "width": "20%" }}>Body Part</th>
                                                    <th style={{ "width": "10%" }}>Color</th>
                                                    <th style={{ "width": "25%" }}>Sub Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>

                                                {props.orderTattooProducts.length > 0 ?
                                                    props.orderTattooProducts.map((orderProduct, index) => {
                                                        return (
                                                            <ProductRow
                                                                paidAmount={props.paidAmount}
                                                                key={index}
                                                                productVariations={props.productVariations}
                                                                products={props.products}
                                                                product_={orderProduct}
                                                                isorderisInvoiced={props.isorderisInvoiced}
                                                                index={index}
                                                                designImprintsOptions={props.designImprintsOptions}
                                                                isLast={(props.orderTattooProducts.length - 1) == index}
                                                                changeOrderRow={changeOrderRow}
                                                            />
                                                        )
                                                    })
                                                    :
                                                    <tr>
                                                        <td colSpan="9" className="text-center">
                                                            <div className="alert alert-info" role="alert">Non System Products is empty </div>
                                                        </td>
                                                    </tr>
                                                }


                                            </tbody>
                                        </Table>
                                    </Row>
                                </div>
                            </Form.Group>
                        </Col>

                        <Col md="6" sm="6">
                            <Table bordered  className="totalsTable">
                                <tbody>
                                    <tr>
                                        <td>
                                            Sub Total
                                        </td>
                                        <td>
                                            {currencyFormat(orderData.subTotal)}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>


                    </Row>
                </>

            }
        </>
    )
}

export default React.memo(Tattoo);