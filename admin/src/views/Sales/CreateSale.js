import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
import 'rc-pagination/assets/index.css'
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap"
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { beforeSale, createSale, validateCoupon } from './Sale.action'
import { getSettings, beforeSettings } from 'views/Settings/settings.action'
import Inspirations from './Inspirations'
import { ENV } from '../../config/config'
import { beforeProduct, getProducts } from '../Products/Products.action';
import { currencyFormat } from '../../../src/utils/functions'
import { getSizeGroups, beforeSizeGroup } from 'views/SizeGroups/SizeGroup.action';
import { beforePromotion, getPromotions } from '../Promotions/Promotions.action';
import { Helmet } from 'react-helmet';

const CreateSale = (props) => {

    const [loader, setLoader] = useState(true)
    const [customers, setCustomers] = useState([])
    const [products, setProducts] = useState([])
    const [orderProducts, setOrderProducts] = useState([]);
    const [promotion, setPromotions] = useState([])
    const [couponValidationFlag, setCouponValidationFlag] = useState(false);
    const [orderData, setOrderData] = useState({
        customer: null,
        vatPercentage: null,
        promotionId: null,
        systemProducts: [],
        nonSystemProducts: [],
        status: true,
        subTotal: 0,
        taxTotal: 0,
        discountTotal: 0,
        couponDiscountType: 0,
        grandTotal: 0
    })


    useEffect(() => {
        window.scroll(0, 0)
        props.beforeCustomer()
        const qs = ENV.objectToQueryString({ all: 1, order: 1 })
        const filterCustomer = { status: "true" }
        props.getCustomers(qs, filterCustomer)
        const filter = { status: "true" }
        props.getProducts(qs, filter);
        const qs2 = ENV.objectToQueryString({ all: 1 })
        const promotionFilter = { isActive: true }
        props.getPromotions(qs2, promotionFilter )
        props.getSettings()
        setLoader(false)
    }, [])

    // Valid promotion / coupon code
    useEffect(() => {
        if (props.sale.validateCouponAuth) {
            let { coupon } = props.sale
            console.log("🚀 ~ file: CreateSale.js:61 ~ useEffect ~ props.sale:", props.sale)
            let newGrandTotal = parseFloat(coupon.subTotal) + parseFloat(coupon.taxTotal) - parseFloat(coupon.discountTotal)
            let tempCoupon = coupon
            tempCoupon.discountTotal = coupon.discountTotal
            tempCoupon.couponDiscountAmount= coupon.couponDiscountAmount
            tempCoupon.couponDiscountType= coupon.couponDiscountType

            tempCoupon.grandTotal = newGrandTotal > 0 ? newGrandTotal.toFixed(2) : 0.00
            tempCoupon.customer = orderData.customer
            setOrderData(tempCoupon)

            props.beforeSale()
        }
    }, [props.sale.validateCouponAuth])


    // Invalide promotion / coupon code
    useEffect(() => {
        if (props.sale.noValidateCouponAuth) {
            let temp = orderData
            temp.discountTotal = 0

            let tempGrandTotal = parseFloat(temp.taxTotal) + parseFloat(temp.subTotal)
            temp.grandTotal = tempGrandTotal.toFixed(2)
            setOrderData(temp)
            props.beforeSale()
        }
    }, [props.sale.noValidateCouponAuth])


    // Promotion / coupon code fetched
    useEffect(() => {
        if (props.promotion.getPromotionsAuth) {
            let { promotions } = props.promotion.promotions
            let promotionsArray = [{ value: '', label: 'Select Promotion' }];
            promotions.map((promotion, key) => {
                promotionsArray.push({
                    label: promotion.name + ' ( ' + promotion.promotionCode + " )",
                    value: promotion._id,
                    key: key
                })
            })
            setPromotions(promotionsArray)
            props.beforePromotion()
        }
    }, [props.promotion.getPromotionsAuth])


    // Update the Products in the order
    const updateOrderProducts = (localProducts) => {

        let updateProducts = orderData
        updateProducts.systemProducts = localProducts
        setOrderData(updateProducts)
        let body = {
            customer: orderData.customer,
            promotionId: orderData.promotionId,
            orderData

        }
        props.validateCoupon(body)
        updateOrderTotals(localProducts)
        setOrderProducts(localProducts);
    }

    

    const handleCustomerChange = (option) => {
        setOrderData({ ...orderData, customer: option.value });
        setMsg((prevMsg) => ({ ...prevMsg, customer: '' }));
        setCouponValidationFlag(true);
    };

    useEffect(() => {
        if (couponValidationFlag) {
            let body = {
                customer: orderData.customer,
                promotionId: orderData.promotionId,
                orderData: orderData // Ensure you're using the updated orderData
            };

            props.validateCoupon(body);
            setCouponValidationFlag(false); // Reset the flag after triggering useEffect
        }
    }, [couponValidationFlag, orderData]);

    // Initialize error messages
    const [msg, setMsg] = useState({
        customer: '',
        product: ''
    })

    // Settings fetched
    useEffect(() => {
        if (props.settings.settingsAuth) {
            if (props.settings.settings) {
                setOrderData({ ...orderData, vatPercentage: props.settings.settings.vatPercentage })
            }
            props.beforeSettings()
        }
    }, [props.settings.settingsAuth])

    // Products fetched
    useEffect(() => {
        if (props.product.getProductsAuth) {
            const products_ = props.product.productsList.products
            let productOptions = []
            products_.map((product, index) => {
                if (product.type == 0 || product.type == 1 || product.type == 2 || product.type == 4) {
                    let variations_ = []
                    product.variations?.map(variation => {
                        variations_.push({
                            value: variation._id,
                            label: variation.details.map((value, vIndex) => {
                                return value.title + ':' + value.value
                            }).join(','),
                        })
                    })

                    productOptions.push({
                        label: product.title,
                        value: product._id,

                        price: product.price,
                        variations: variations_,
                        image: product.image,
                        key: index
                    })
                }
            })
            setProducts(productOptions)
            props.beforeProduct()
        }
    }, [props.product.getProductsAuth])

    // Order Created
    useEffect(() => {
        if (props.sale.createSaleAuth) {
            props.beforeSale()
            setLoader(false)
            props.history.push(`/orders`)
        }
    }, [props.sale.createSaleAuth])

    // Customers Fetched
    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            const { customers } = props.customer
            let customersArray = [];
            customers.map((customer, key) => {
                customersArray.push({
                    label: customer.customername + ' ( ' + customer.email + " )",
                    value: customer._id,
                    key: key
                })
            })
            setCustomers(customersArray)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])

    // Order Products updated
    const updateOrderTotals = (localProducts) => {
        let total = {
            subTotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0
        }
        localProducts.map((product) => {
            let t = product.price * product.quantity;
            total.subTotal += t;
            total.taxTotal += t * orderData.vatPercentage / 100;
            total.grandTotal += t + (t * orderData.vatPercentage / 100);
        })
        setOrderData({ ...orderData, systemProducts: localProducts, subTotal: total.subTotal.toFixed(2), taxTotal: total.taxTotal.toFixed(2), grandTotal: total.grandTotal.toFixed(2) })

    }

    // Submit Order Form
    const submitOrderForm = () => {

        let isAdd = true;
        let payloadProducts = []
            
        orderProducts.length > 0 && orderProducts.map((product) => {
            if (product.productId === null) {
                isAdd = false;
            }
            if (product.productId != null) {
                payloadProducts.push({
                    productId: product.productId,
                    variationId: product.variationId,
                    quantity: product.quantity,
                    price: product.price,
                    subTotal: (product.price * product.quantity),
                })
            }
        })


        if (orderData.customer && orderProducts.length > 0 && isAdd === true) {

            if (isAdd) {
                setLoader(true);
                let payload = {
                    customer: orderData.customer,
                    vatPercentage: orderData.vatPercentage,
                    systemProducts: payloadProducts,
                    nonSystemProducts: [],
                    status: 0,  // 0: Quotation, 1: Sales Order, 2: Cancelled Order
                    promotionId: orderData.promotionId,
                    couponDiscountAmount: orderData.couponDiscountAmount,
                    couponDiscountType: orderData.couponDiscountType,
                    subTotal: parseFloat(orderData.subTotal),
                    taxTotal: parseFloat(orderData.taxTotal),
                    discountTotal: parseFloat(orderData.discountTotal),
                    grandTotal: parseFloat(orderData.grandTotal)
                }
                props.createSale(payload)
            }

        } else {
            setMsg({
                customer: !orderData.customer ? 'Select a customer' : '',
                product: orderProducts.length == 0 ? 'Select at least one product' : isAdd === false ? 'Select product from list' : ''
            })
        }
    }

    return (
        <>
        <Helmet>
            <title>Scotani | Admin Panel | Create Order</title>
        </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy custom">
                                    <Card.Header>
                                        <Card.Title as="h4">Create New Order</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Customer<span className="text-danger"> *</span></label>

                                                    <Select options={customers}
                                                        // onChange={(option) => {
                                                        //     setOrderData({ ...orderData, customer: option.value })
                                                        //     setMsg((prevMsg) => ({ ...prevMsg, customer: '' }))
                                                        //     let body = {
                                                        //         customer: option.value,
                                                        //         promotionId: orderData.promotionId,
                                                        //         orderData

                                                        //     }
                                                          
                                                        //     props.validateCoupon(body)

                                                        // }
                                                        // }
                                                        onChange={(option) => handleCustomerChange(option)}
                                                        value={customers.filter(option => option.value === orderData.customer)}
                                                    />

                                                    <span className={msg.customer ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.customer}</label>
                                                    </span>
                                                </Form.Group>

                                            </Col>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Promotions</label>

                                                    <Select options={promotion}
                                                        onChange={(option) => {
                                                            setOrderData({ ...orderData, promotionId: option.value })

                                                            let body = {
                                                                customer: orderData.customer,
                                                                promotionId: option.value,
                                                                orderData

                                                            }
                                                            props.validateCoupon(body)

                                                        }
                                                        }
                                                        value={promotion.find(option => option.value === orderData.promotionId)||promotion[0] }
                                                    />
                                                </Form.Group>
                                            </Col>


                                        </Row>


                                        <div className="tab-content mb-2">
                                            <Inspirations
                                                orderProducts={orderProducts}
                                                products={products}
                                                updateOrderProducts={updateOrderProducts}
                                            />
                                        </div>
                                        <span className={msg.product ? `` : `d-none`}>
                                            <label className="pl-1 text-danger">{msg.product}</label>
                                        </span>
                                        <Row>
                                            <Col md="6" sm="6">
                                                <Table bordered>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                Sub Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(Number(orderData.subTotal))}
                                                            </td>
                                                        </tr>
                                                        {(orderData.taxTotal > 0) &&
                                                            <tr>
                                                                <td>
                                                                    Tax Total
                                                                </td>
                                                                <td>
                                                                    {currencyFormat(Number(orderData.taxTotal))}
                                                                </td>
                                                            </tr>
                                                        }
                                                        <tr>
                                                            <td>
                                                                Discount Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(Number(orderData.discountTotal))}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Grand Total
                                                            </td>
                                                            <td>
                                                                {currencyFormat(Number(orderData.grandTotal))}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </Col>

                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <Link to={'/orders'} className=" pull-right" >
                                                    <Button className="btn-fill pull-right mt-3" variant="info">
                                                        Back
                                                    </Button>
                                                </Link>
                                                <Button
                                                    className="btn-fill float-right mt-3"
                                                    type="submit"
                                                    variant="info"
                                                    onClick={(e) => submitOrderForm()}

                                                >
                                                    Create Order
                                                </Button>
                                            </Col>
                                        </Row>

                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
            }
        </>
    )
}
const mapStateToProps = state => ({
    order: state,
    promotion: state.promotion,
    sizeGroups: state.sizeGroups,
    customer: state.customer,
    sale: state.sale,
    error: state.error,
    product: state.product,
    settings: state.settings,

});

export default connect(mapStateToProps, {
    beforeCustomer,
    getCustomers,
    beforeSale,
    createSale,
    getSettings,
    beforeSettings,
    beforeProduct,
    getProducts,
    getSizeGroups, beforeSizeGroup,
    beforePromotion, getPromotions,
    validateCoupon
})(CreateSale);