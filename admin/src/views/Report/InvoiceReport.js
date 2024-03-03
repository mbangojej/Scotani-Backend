import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader'
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import 'rc-pagination/assets/index.css'
import { Button, Card, Form, Table, Container, Row, Col, Modal } from "react-bootstrap"
import Select from 'react-select';
import { ENV } from '../../config/config';
import { beforeReport, getInvoiceReport } from './Report.action'
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { getProducts } from '../Products/Products.action'
import { currencyFormat } from '../../../src/utils/functions'
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import Pagination from 'rc-pagination';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import { Helmet } from 'react-helmet';

const InvoiceReport = (props) => {
    const [loader, setLoader] = useState(true)
    const [invoices, setInvoices] = useState([])
    const [report, setReport] = useState([])
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    const [creationStartDate, setCreationStartDate] = useState('')
    const [creationEndDate, setCreationEndDate] = useState('')
    const [updationStartDate, setUpdationStartDate] = useState('')
    const [updationEndDate, setUpdationEndDate] = useState('')
    const [orderNumber, setOrderNumber] = useState()
    const [invoiceNumber, setInvoiceNumber] = useState()
    const [customer, setCustomer] = useState('')
    const [product, setProduct] = useState('')
    const [status, setStatus] = useState('')
    const [paymentType, setPaymentType] = useState('')


    const [invoicePaymentOptions, setInvoicePaymentOptions] = useState([
        {
            label: 'Select Payment Method',
            value: '',
        },
        {
            label: 'Stripe',
            value: 'Stripe',
        },
        {
            label: 'PayPal',
            value: 'PayPal',
        },
        {
            label: 'Google Pay',
            value: 'Google Pay',
        },
        {
            label: 'Apple Pay',
            value: 'Apple Pay',
        }
    ])
    const [invoiceStatusOptions, setInvoiceStatusOptions] = useState([
        {
            label: 'Select Status',
            value: '',

        },
        {
            label: 'Unpaid',
            value: '2',

        },
        {
            label: 'Paid',
            value: '4',

        }
    ])

    const [customerOptions, setCustomerOptions] = useState([])
    const [productOptions, setProductOptions] = useState([])



    useEffect(() => {
        window.scroll(0, 0)
        const qsall = ENV.objectToQueryString({ all: 1, page: 1, limit: 10, withDeleted: true })
        props.getCustomers(qsall, {})
        props.getProducts(qsall, {})
        props.getInvoiceReport()
    }, [])

    useEffect(() => {
        if (props.customer.getCustomerAuth) {
            const { customers, pagination } = props.customer
            let customersArray = [{ value: '', label: 'Select Customer' }]
            for (var key in customers) {
                let customer_ = {
                    label: `${customers[key].customername} / ${customers[key].email}`,
                    value: customers[key]._id,
                    key: key
                }
                customersArray.push(customer_)
            }

            setCustomerOptions(customersArray)
            props.beforeCustomer()
        }
    }, [props.customer.getCustomerAuth])

    useEffect(() => {
        if (props.product.getProductsAuth) {
            const { products, pagination } = props.product.productsList
            let prodoptions = [{ value: '', label: 'Select Product' }]
            products.map(p => {
                prodoptions.push({
                    label: p.title,
                    value: p._id
                })
            })
            setProductOptions(prodoptions)
        }
    }, [props.product.getProductsAuth])

    useEffect(() => {
        if (props.report.getInvoiceReportAuth) {
            setInvoices(props.report.invoices.invoices)
            setReport(props.report.invoices.filename)
            setPagination(props.report.invoices.pagination)
            setPage(props.report.invoices.pagination.page)
            setLimit(props.report.invoices.pagination.limit)
            setLoader(false)
            props.beforeReport()
        }
    }, [props.report.getInvoiceReportAuth])

    const onPageChange = async (page) => {
        const filter = {}
        if (creationStartDate) {
            filter.creationStartDate = creationStartDate
        }
        if (creationEndDate) {
            filter.creationEndDate = creationEndDate
        }
        if (updationStartDate) {
            filter.updationStartDate = updationStartDate
        }
        if (updationEndDate) {
            filter.updationEndDate = updationEndDate
        }
        if (customer) {
            filter.customerID = customer
        }
        if (orderNumber) {
            filter.orderNumber = orderNumber
        }
        if (invoiceNumber) {
            filter.invoiceNumber = invoiceNumber
        }
        if (paymentType)
            filter.paymentMethod = paymentType

        if (product) {
            filter.productID = product.split('____')[0]
        }
        if (status) {
            filter.status = parseInt(status)
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getInvoiceReport(qs, filter)
    }


    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (creationStartDate) {
            filter.creationStartDate = creationStartDate
        }
        if (creationEndDate) {
            filter.creationEndDate = creationEndDate
        }
        if (updationStartDate) {
            filter.updationStartDate = updationStartDate
        }
        if (updationEndDate) {
            filter.updationEndDate = updationEndDate
        }
        if (customer) {
            filter.customerID = customer
        }
        if (orderNumber) {
            filter.orderNumber = orderNumber
        }
        if (invoiceNumber) {
            filter.invoiceNumber = invoiceNumber
        }
        if (paymentType)
            filter.paymentMethod = paymentType

        if (product) {
            filter.productID = product.split('____')[0]
        }
        if (status) {
            filter.status = parseInt(status)
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getInvoiceReport(qs, filter)
        setLoader(true)

    }



    const applyFilters = () => {
        const filter = {}
        if (creationStartDate) {
            filter.creationStartDate = creationStartDate
        }
        if (creationEndDate) {
            filter.creationEndDate = creationEndDate
        }
        if (updationStartDate) {
            filter.updationStartDate = updationStartDate
        }
        if (updationEndDate) {
            filter.updationEndDate = updationEndDate
        }
        if (customer) {
            filter.customerID = customer
        }
        if (orderNumber) {
            filter.orderNumber = orderNumber
        }
        if (invoiceNumber) {
            filter.invoiceNumber = invoiceNumber
        }
        if (paymentType)
            filter.paymentMethod = paymentType

        if (product) {
            filter.productID = product.split('____')[0]
        }
        if (status) {
            filter.status = parseInt(status)
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getInvoiceReport(qs, filter)
        setLoader(true)
    }

    const reset = () => {
        setCreationStartDate('')
        setCreationEndDate('')
        setUpdationStartDate('')
        setUpdationEndDate('')
        setOrderNumber('')
        setInvoiceNumber('')
        setCustomer('')
        setProduct('')
        setStatus('')
        setPaymentType('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getInvoiceReport(qs, {})
        setLoader(true)
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }

    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Invoice Report</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy custom filter-card">
                                    <Card.Header>
                                        <Row>
                                            <Col md="6">

                                                <Card.Title as="h4">
                                                    Invoice Report
                                                </Card.Title>
                                            </Col>
                                            <Col md="6">
                                                <ul className="list-unstyled mb-0 float-right">
                                                    <li className="d-inline-block align-top">
                                                        <a target={invoices && invoices.length > 0 && "_blank"} disabled={invoices && invoices.length == 0} href={invoices && invoices.length > 0 ? ENV.reportPath + report : "#."} className="btn-fill pull-right  ">
                                                            <Button className="btn-fill pull-right " variant="info" disabled={pagination?.total == 0}>
                                                                Download Report
                                                            </Button>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </Col>
                                        </Row>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label className='mb-1' style={{ color: 'black' }}>Creation Date Range</label><br />
                                                    <DateRangePicker
                                                        initialSettings={{ startDate: creationStartDate ? moment(creationStartDate).format("MM-DD-YYYY") : moment().format("MM-DD-YYYY"), endDate: creationEndDate ? moment(creationEndDate).format("MM-DD-YYYY") : moment().format("MM-DD-YYYY") }}
                                                        onCallback={(start, end, label) => {
                                                            setCreationStartDate(moment(start).format("MM-DD-YYYY"))
                                                            setCreationEndDate(moment(end).format("MM-DD-YYYY"))
                                                        }}
                                                    >
                                                        <Button className="btn-fill" variant="info" >
                                                            Select Date range
                                                        </Button>
                                                    </DateRangePicker>
                                                    <span className='date-info d-block mb-2'>{creationStartDate && creationStartDate + ' - ' + creationEndDate}</span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label className='mb-1' style={{ color: 'black' }}>Updation Date Range</label><br />

                                                    <DateRangePicker
                                                        initialSettings={{ startDate: updationStartDate ? moment(updationStartDate).format("MM-DD-YYYY") : moment().format("MM-DD-YYYY"), endDate: updationEndDate ? moment(updationEndDate).format("MM-DD-YYYY") : moment().format("MM-DD-YYYY") }}
                                                        onCallback={(start, end, label) => {
                                                            setUpdationStartDate(moment(start).format("MM-DD-YYYY"))
                                                            setUpdationEndDate(moment(end).format("MM-DD-YYYY"))
                                                        }}
                                                    >
                                                        <Button className="btn-fill" variant="info" >
                                                            Select Date range
                                                        </Button>
                                                    </DateRangePicker>
                                                    <span className='date-info d-block mb-2'>{updationStartDate && updationStartDate + ' - ' + updationEndDate}</span>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Order Number</label>
                                                    <Form.Control
                                                        onKeyPress={handleKeyPress}
                                                        placeholder="Order Number"
                                                        type="number"
                                                        onChange={(e) => {
                                                            setOrderNumber(e.target.value.replace(/[^0-9]/g, ""))
                                                        }}
                                                        onKeyDown={e => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                                        value={orderNumber}
                                                    ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Invoice Number</label>
                                                    <Form.Control
                                                        onKeyPress={handleKeyPress}
                                                        placeholder="Invoice Number"
                                                        type="number"
                                                        onChange={(e) => {
                                                            setInvoiceNumber(e.target.value.replace(/[^0-9]/g, ""))
                                                        }}
                                                        onKeyDown={e => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                                        value={invoiceNumber}
                                                    ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Customer</label>
                                                    {customerOptions.length > 0 ?
                                                        <Select onKeyPress={handleKeyPress} options={customerOptions}
                                                            onChange={(event) => setCustomer(event.value)}
                                                            value={customerOptions.filter(option => option.value === customer)}
                                                        />
                                                        : ''
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md="3">
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Status</label>

                                                    <Select onKeyPress={handleKeyPress} options={invoiceStatusOptions}
                                                        onChange={(event) => setStatus(event.value)}
                                                        value={invoiceStatusOptions.filter(option => option.value === status)}
                                                    />

                                                </Form.Group>
                                            </Col>

                                            <Col md="3">
                                                <label style={{ color: 'black' }}>Payment Method</label>
                                                <Form.Group>

                                                    <Select onKeyPress={handleKeyPress} options={invoicePaymentOptions}
                                                        onChange={(event) => setPaymentType(event.value)}
                                                        value={invoicePaymentOptions.filter(option => option.value === paymentType)}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <Form.Label className="d-block mb-2">&nbsp;</Form.Label>
                                                    <div className="d-flex justify-content-between filter-btns-holder">
                                                        <Button type="button" className="btn btn-info" disabled={!paymentType && !creationStartDate && !updationStartDate && !customer && !product && !status && !orderNumber && !invoiceNumber} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!paymentType && !creationStartDate && !updationStartDate && !customer && !product && !status && !orderNumber && !invoiceNumber} onClick={reset}>Reset</Button>
                                                    </div>

                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Row className="mt-5">
                                    <Col lg={12} sm={12}>
                                        <Card className="card-stats table-big-boy">
                                            <Card.Body>
                                                {/* <Card.Title>Invoices</Card.Title> */}
                                                <div className='d-flex align-items-center justify-content-between mb-4'>
                                                    <Card.Title as="h4">Invoices</Card.Title>
                                                    <span style={{ fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                                </div>




                                                <div className="table-responsive">
                                                    <Table className="table-bigboy">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-center serial-col">#</th>
                                                                <th className='text-center td-actions'>Invoice Number</th>
                                                                <th className='text-center td-actions'>Order Number</th>
                                                                <th className='text-center td-actions'>Customer</th>
                                                                <th className='text-center td-actions'>Creation Date</th>
                                                                <th className='text-center td-actions'>Updation Date</th>
                                                                <th className="td-actions text-center">Discount </th>
                                                                <th className="td-actions text-center">Total Amount </th>
                                                                <th className="td-actions text-center">Paid Amount </th>
                                                                <th className="td-actions text-center">Status </th>
                                                                <th className="td-actions text-center">Payment Method </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                invoices.length > 0 ?
                                                                    invoices.map((invoice, index) => {
                                                                        return (
                                                                            <tr key={index}>
                                                                                <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>

                                                                                <td className="text-center serial-col"> <Link target="_blank" to={`/invoice/${invoice._id}`}>{"INV" + invoice.orderNumber.toString().padStart(5, 0)}</Link></td>
                                                                                <td className="text-center serial-col"> <Link target="_blank" to={`/edit-sale/${invoice._id}`}>{"SC" + invoice.orderNumber.toString().padStart(5, 0)}</Link></td>
                                                                                <td className="text-center serial-col"> {invoice.customername}</td>
                                                                                <td className="text-center serial-col"> {moment(invoice.invoicedAt).format('MM-DD-YYYY')}</td>
                                                                                <td className="text-center serial-col"> {moment(invoice.updatedAt).format('MM-DD-YYYY')}</td>
                                                                                <td className="text-center serial-col">  {invoice.discountTotal ? currencyFormat(invoice.discountTotal) : currencyFormat(0)}</td>
                                                                                <td className="text-center serial-col"> {currencyFormat(invoice.grandTotal)}</td>
                                                                                <td className="text-center serial-col"> {currencyFormat(invoice.paidAmount)}</td>
                                                                                <td className="text-center serial-col">
                                                                                    {
                                                                                        invoice.paidAmount == 0 && "Unpaid"
                                                                                    }
                                                                                    {
                                                                                        invoice.paidAmount > 0 && invoice.paidAmount < invoice.grandTotal && "Partially Paid"
                                                                                    }
                                                                                    {
                                                                                        invoice.paidAmount == invoice.grandTotal.toFixed(2) && "Paid"
                                                                                    }
                                                                                </td>
                                                                                <td className="text-center serial-col"> {invoice.transactionPlatform}</td>
                                                                            </tr>

                                                                        )

                                                                    }) :
                                                                    <tr>
                                                                        <td colSpan="11" className="text-center">
                                                                            <div className="alert alert-info" role="alert">No Invoice Found</div>
                                                                        </td>
                                                                    </tr>
                                                            }
                                                        </tbody>
                                                    </Table>
                                                    {
                                                        pagination &&
                                                        <div className="pb-4">
                                                            <div className='d-flex align-items-center justify-content-between pagination-wrapper'>
                                                                <Pagination
                                                                    className="m-3"
                                                                    defaultCurrent={1}
                                                                    pageSize // items per page
                                                                    current={Page > pagination.pages ? pagination.pages : Page} // current active page
                                                                    total={pagination.pages} // total pages
                                                                    onChange={onPageChange}
                                                                    locale={localeInfo}
                                                                />
                                                                <PaginationLimitSelector limit={limit} itemsPerPageChange={itemsPerPageChange} currentPage={Page} total={pagination.total} />
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>

                    </Container>
            }
        </>
    )
}
const mapStateToProps = state => ({
    report: state.report,
    customer: state.customer,
    product: state.product,
    error: state.error,

});
export default connect(mapStateToProps, { beforeReport, getInvoiceReport, beforeCustomer, getCustomers, getProducts })(InvoiceReport);