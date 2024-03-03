import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforePromotion, getPromotion, addPromotion, updatePromotion } from './Promotions.action';
import { getProducts } from '../Products/Products.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap";
import Select from 'react-select'
import { getCategories } from '../Products/Category/Category.action';
import { Link, useHistory } from 'react-router-dom'
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { ENV } from '../../config/config';
var CryptoJS = require("crypto-js");
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap-daterangepicker/daterangepicker.css';
import validator from 'validator';
import Promotions from './Promotions';
import { Helmet } from 'react-helmet';

const PromotionForm = (props) => {

    const [promotion, setPromotion] = useState({
        name: '',
        customers: [],
        promotionCode: '',
        noOfUsesPerCustomer: 0,
        minPurchaseAmount: 0,
        startDate: null,
        endDate: null,
        discountAmount: null,
        discountType: 1,
        isActive: true,
    })
    const promotionID = window.location.pathname.split('/')[3]
    const [customerOptions, setCustomerOptions] = useState([])
    const [msg, setMsg] = useState({
        name: '',
        customers: '',
        promotionCode: '',
        noOfUsesPerCustomer: '',
        minPurchaseAmount: '',
        startDate: '',
        endDate: '',
        discountAmount: '',
        discountType: '',
        isActive: '',
    })
    const [loader, setLoader] = useState(true)

    useEffect(() => {
        window.scroll(0, 0)
        let filter = {}

        let qs = ENV.objectToQueryString({ all: 1, withProducts: 1 })

        if (window.location.pathname.split('/')[3]) {
            qs += '&withDeleted=true';
        }
        else {
            filter = { status: "true" }
        }

        if (window.location.pathname.split('/')[3]) {
            props.getPromotion(window.location.pathname.split('/')[3])
        }

        props.getCustomers(qs, filter)

        let roleEncrypted = localStorage.getItem('role');
        let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            role = roleDecrypted
        }
        props.getRole(role)
    }, [])

    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            let { customers } = props.customer
            let customers_ = []
            customers.map(customer => {
                customers_.push({
                    label: customer.customername + " / " + customer.email,
                    value: customer._id
                })
            })
            setCustomerOptions(customers_)
            setLoader(false)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])            // Get Customer List Fetched

    useEffect(() => {
        if (props.promotion.getPromotionAuth) {
            let promo = props.promotion.promotion
            setPromotion({
                name: promo.name,
                customers: promo.customers,
                promotionCode: promo.promotionCode,
                noOfUsesPerCustomer: promo.noOfUsesPerCustomer,
                minPurchaseAmount: promo.minPurchaseAmount,
                startDate: promo.startDate,
                endDate: promo.endDate,
                discountAmount: promo.discountAmount,
                discountType: promo.discountType,
                isActive: promo.isActive
            })
        }
    }, [props.promotion.getPromotionAuth])                // Promotion Fetched

    useEffect(() => {
        if (props.promotion.existPromotionAuth) {
            setLoader(false)
            setMsg({
                ...msg,
                promotionCode: "Promotion code already exist",
            });
            props.beforePromotion()
        }
    }, [props.promotion.existPromotionAuth])                // Promotion Exist

    useEffect(() => {
        if (props.promotion.createAuth || props.promotion.editPromotionAuth) {
            // setLoader(false)
            props.beforePromotion()
            props.history.push(`/promotions`)

        }
    }, [props.promotion.createAuth, props.promotion.editPromotionAuth])                // Promotion Saved

    const setSelectedCustomer = (event) => {
        if (event) {
            const arrayOfIds = event.map((obj) => obj.value);
            setPromotion({ ...promotion, customers: arrayOfIds })
        } else {
            setPromotion({ ...promotion, customers: [] })
        }
    }



    const submit = async () => {
        const validationMessages = {};
        if (validator.isEmpty(promotion.name.trim())) {
            validationMessages.name = 'Promotion Name is required';
        }
        if (validator.isEmpty(promotion.promotionCode.trim())) {
            validationMessages.promotionCode = 'Promotion Code is required';
        }
        if (!promotion.noOfUsesPerCustomer) {
            validationMessages.noOfUsesPerCustomer = 'No Of Uses Per Customer is required';
        }
        if (!promotion.minPurchaseAmount) {
            validationMessages.minPurchaseAmount = 'Minimum Purchase Amount is required';
        }
        if (!promotion.startDate) {
            validationMessages.startDate = 'Start Date is required';
        }
        if (!promotion.endDate) {
            validationMessages.endDate = 'End Date is required';
        }
        if (!promotion.discountAmount) {
            validationMessages.discountAmount = 'Discount Amount / Percentage is required';
        }
        if (promotion.noOfUsesPerCustomer) {
            if (promotion.noOfUsesPerCustomer <= 0)
                validationMessages.noOfUsesPerCustomer = `No Of Uses Per Customer must be greater than zero.`;
        }
        if (promotion.minPurchaseAmount) {
            if (promotion.minPurchaseAmount <= 0) {
                validationMessages.minPurchaseAmount = `Minimum Purchase Amount must be greater than zero.`;
            } else if (!/^\d+(\.\d{1,2})?$/.test(promotion.minPurchaseAmount)) {
                validationMessages.minPurchaseAmount = `Minimum Purchase Amount must have up to 2 decimal.`;
            }
        }
        if (promotion.discountAmount) {
            if (promotion.discountAmount <= 0) {
                validationMessages.discountAmount = `Discount Amount / Percentage must be greater than zero.`;
            } else if (!/^\d+(\.\d{1,2})?$/.test(promotion.discountAmount)) {
                validationMessages.discountAmount = `Discount Amount / Percentage must have up to 2 decimal.`;
            }
        }
        if (promotion.discountAmount && promotion.minPurchaseAmount && [0, 1].includes(promotion.discountType)) {
            if (promotion.discountType == 0) {    // Percentage Case
                if (parseFloat(promotion.discountAmount) > 99 || parseFloat(promotion.discountAmount) < 0) {
                    validationMessages.discountAmount = `Discount Percentage must be greater than 0 and less than 100.`;
                }
            } else if (promotion.discountType == 1) {    // Fixed Case
                if (parseFloat(promotion.discountAmount) >= parseFloat(promotion.minPurchaseAmount)) {
                    validationMessages.discountAmount = `Discount Amount must be less than the minimum purchase amount.`;
                }
            }
        }
        // If there are validation errors, set them in the state and return
        if (Object.keys(validationMessages).length > 0) {
            setMsg({ ...msg, ...validationMessages });
            return;
        }
        try {
            setLoader(true);
            let payload = {
                name: promotion.name,
                promotionCode: promotion.promotionCode,
                noOfUsesPerCustomer: promotion.noOfUsesPerCustomer,
                minPurchaseAmount: promotion.minPurchaseAmount,
                startDate: promotion.startDate,
                endDate: promotion.endDate,
                discountAmount: promotion.discountAmount,
                discountType: promotion.discountType,
                isActive: promotion.isActive,
            };
            if (promotion.customers)
                payload.customers = JSON.stringify(promotion.customers)
            if (window.location.pathname.split('/')[3]) {
                payload._id = window.location.pathname.split('/')[3];
                await props.updatePromotion(payload);
            } else {
                await props.addPromotion(payload);
            }
        } catch (error) {
        }

    };
    const isDateDisabled = () => {
        return new Date();
    };

    const isEndDateDisabled = () => {
        return promotion.startDate ? promotion.startDate : new Date();
    };
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | {window.location.pathname.split('/')[3] ? "Edit" : "Add"} Promotion</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy promotion-table-wrapper">
                                    <Card.Header>
                                        <Card.Title as="h4">{window.location.pathname.split('/')[3] ? "Edit" : "Add"} Promotion</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>

                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Customers <small>( Leave blank to select all customers )</small></label>
                                                    <Select classNamePrefix="custom-multi-select" options={customerOptions ? customerOptions : ''}
                                                        isMulti
                                                        className="basic-multi-select"
                                                        onChange={setSelectedCustomer}
                                                        value={customerOptions.length > 0 && customerOptions?.filter(option => promotion.customers?.includes(option.value))}
                                                    />
                                                    <span className={msg.customer ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.customer}</label>
                                                    </span>
                                                </Form.Group>

                                            </Col>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Promotion Name<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={promotion?.name ? promotion?.name : ''}
                                                        onChange={(e) => {
                                                            setPromotion({ ...promotion, name: e.target.value });
                                                        }}
                                                        placeholder="Promotion Name"
                                                        type="text"
                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, name: '' }))}
                                                    ></Form.Control>
                                                    <span className={msg.name ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.name}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Promotion Code<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={promotion?.promotionCode ? promotion?.promotionCode : ''}
                                                        onChange={(e) => {
                                                            setPromotion({ ...promotion, promotionCode: e.target.value });
                                                        }}
                                                        placeholder="Promotion Code"
                                                        type="text"
                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, promotionCode: '' }))}
                                                    ></Form.Control>
                                                    <span className={msg.promotionCode ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.promotionCode}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Maximum Usage <small> (per customer)</small><span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={promotion?.noOfUsesPerCustomer ? promotion?.noOfUsesPerCustomer : ''}
                                                        onChange={(e) => {
                                                            setPromotion({ ...promotion, noOfUsesPerCustomer: e.target.value });
                                                        }}
                                                        placeholder="Maximum Usage"
                                                        type="number"
                                                        step="1"
                                                        onKeyDown={e => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, noOfUsesPerCustomer: '' }))}
                                                    ></Form.Control>
                                                    <span className={msg.noOfUsesPerCustomer ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.noOfUsesPerCustomer}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="4">
                                                <Form.Group>
                                                    <label>Minimum Purchase Amount<span className="text-danger"> *</span></label>
                                                    <Form.Control
                                                        value={promotion?.minPurchaseAmount ? promotion?.minPurchaseAmount : ''}
                                                        onChange={(e) => {
                                                            setPromotion({ ...promotion, minPurchaseAmount: e.target.value });
                                                        }}
                                                        placeholder="Minimum Purchase Amount"
                                                        type="number"
                                                        step="1"
                                                        onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, minPurchaseAmount: '' }))}
                                                    ></Form.Control>
                                                    <span className={msg.minPurchaseAmount ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.minPurchaseAmount}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={3}>
                                                <Form.Group className='add-date-picker'>
                                                    <label>Start Date <span className="text-danger"> *</span></label>  <br></br>
                                                    <DatePicker className='form-control'
                                                        selected={promotion.startDate ? new Date(promotion.startDate) : ''}
                                                        onChange={(date) => {
                                                            // Check if endDate is less than startDate
                                                            if (promotion.endDate && date && date > new Date(promotion.endDate)) {
                                                                setPromotion({ ...promotion, startDate: date, endDate: '' });
                                                            } else {
                                                                setPromotion({ ...promotion, startDate: date });
                                                            }
                                                            setMsg((prevMsg) => ({ ...prevMsg, startDate: '' }))
                                                        }}
                                                        minDate={new Date()} // Set the minimum date to the current date
                                                        filterDate={isDateDisabled} // Function to disable dates
                                                        placeholderText="Start Date"
                                                    />
                                                    <span className={msg.startDate ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.startDate}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <label>End Date <span className="text-danger"> *</span></label>  <br></br>
                                                    <DatePicker className='form-control'
                                                        selected={promotion.endDate ? new Date(promotion.endDate) : ''}
                                                        onChange={(date) => {

                                                            setPromotion({ ...promotion, endDate: date })
                                                            setMsg((prevMsg) => ({ ...prevMsg, endDate: '' }))
                                                        }

                                                        }
                                                        minDate={promotion.startDate ? new Date(promotion.startDate) : new Date()} // Set the minimum date to the current date
                                                        filterDate={isEndDateDisabled} // Function to disable dates
                                                        placeholderText="End Date"
                                                    >
                                                    </DatePicker>
                                                    <span className={msg.endDate ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.endDate}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label className='mr-2'>Discount Amount / Percentage<span className="text-danger">*</span></label>
                                                    <Form.Control
                                                        value={promotion.discountAmount}
                                                        onChange={(e) => setPromotion({ ...promotion, discountAmount: e.target.value })}
                                                        placeholder="Value"
                                                        type="number"
                                                        onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, discountAmount: '' }))}
                                                        min={1}
                                                    ></Form.Control>

                                                    <span className={msg.discountAmount ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg.discountAmount}</label>
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label className='mr-2'>Discount Type<span className="text-danger">*</span></label>
                                                    <label className="right-label-radio mb-2 mr-2">
                                                        <div className='d-flex align-items-center'>
                                                            <input name={`discountfixed${props.index}`} type="radio" checked={promotion.discountType == 1 || promotion.discountType == "1"} value="1" onChange={(e) => setPromotion({ ...promotion, discountType: 1 })} />

                                                            <span className="checkmark black-checkmark"></span>
                                                            <span className='ml-1' onChange={(e) => setPromotion({ ...promotion, discountType: 1 })} ><i />Fixed Amount</span>
                                                        </div>
                                                    </label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <div className='d-flex align-items-center'>
                                                            <input name={`discountpercentage${props.index}`} type="radio" checked={promotion.discountType == 0 || promotion.discountType == "0"} value="0" onChange={(e) => setPromotion({ ...promotion, discountType: 0 })} />
                                                            <span className="checkmark black-checkmark"></span>
                                                            <span className='ml-1' onChange={(e) => setPromotion({ ...promotion, discountType: 1 })}  ><i />Percentage</span>
                                                        </div>
                                                    </label>
                                                </Form.Group>
                                                <span className={msg.discountType ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.discountType}</label>
                                                </span>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md="6">
                                                <Form.Group>
                                                    <label className='mr-2'>Status<span className="text-danger"> *</span></label>
                                                    <label className="right-label-radio mb-2 mr-2">
                                                        <div className='d-flex align-items-center'>
                                                            <input name="isActive" type="radio" checked={promotion?.isActive} value={promotion?.isActive} onChange={(e) => { setPromotion({ ...promotion, isActive: true }) }} />
                                                            <span className="checkmark black-checkmark"></span>
                                                            <span className='ml-1' onChange={(e) => {
                                                                setPromotion({ ...promotion, isActive: true });
                                                            }} ><i />Active</span>
                                                        </div>
                                                    </label>
                                                    <label className="right-label-radio mr-3 mb-2">
                                                        <div className='d-flex align-items-center'>
                                                            <input name="isActive" type="radio" checked={!promotion?.isActive} value={!promotion?.isActive} onChange={(e) => { setPromotion({ ...promotion, isActive: false }) }} />
                                                            <span className="checkmark black-checkmark"></span>
                                                            <span className='ml-1' onChange={(e) => {
                                                                setPromotion({ ...promotion, isActive: false });
                                                            }} ><i />Inactive</span>
                                                        </div>
                                                    </label>

                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md="12" sm="6">
                                                <Link to={'/promotions'} className=" pull-right" >
                                                    <Button className="btn-fill pull-right mt-3" variant="info">
                                                        Back
                                                    </Button>
                                                </Link>
                                                <Button
                                                    className="btn-fill float-right mt-3"
                                                    type="submit"
                                                    variant="info"
                                                    onClick={submit}
                                                >
                                                    {window.location.pathname.split('/')[3] ? "Update" : "Add"}
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
    category: state.category,
    customer: state.customer,
    promotion: state.promotion,
    error: state.error,
    getRoleRes: state.role.getRoleRes,
    productAttribute: state.productAttribute
});

export default connect(mapStateToProps, { beforeCustomer, getCustomers, beforePromotion, getPromotion, addPromotion, updatePromotion, getProducts, getRole, getCategories })(PromotionForm);