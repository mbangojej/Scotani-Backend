import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeCustomer, getCustomers } from '../Customers/Customers.action'
import { beforeBugReport, getBugReports, respondToBugReport } from './BugReport.action'
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import validator from 'validator';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
import { Helmet } from 'react-helmet';


const BugReport = (props) => {
    const dispatch = useDispatch()
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)

    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [customer, setCustomer] = useState('')
    // const [customerOptions, setCustomerOptions] = useState([])
    const [searchStatus, setSearchStatus] = useState(null)
    const [search, setSearch] = useState('')
    const [searchEmail, setSearchEmail] = useState(null)
    const [contentModal, setContentModal] = useState(false)
    const [bugId, setBugId] = useState('')
    const [name, setName] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [reply, setReply] = useState('')
    const [status, setStatus] = useState('')
    const [msg, setMsg] = useState('')
    const [permissions, setPermissions] = useState({})


    // set modal type
    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10, withDeleted: true })
        const filter = {}
        if (customer)
            filter.customer = customer
        props.getBugReports(qs, filter)
        const qsC = ENV.objectToQueryString({ all: 1 })
        props.getCustomers(qsC)
    }, [])

    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }



    useEffect(() => {
        if (props.BugReports.getBugReportsAuth) {
            const { bugReports, pagination } = props.BugReports.bugReports
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setData(bugReports)
            setLoader(false)
            props.beforeBugReport()
        }
    }, [props.BugReports.getBugReportsAuth, props.BugReports.BugReports])


    useEffect(() => {
        if (props.BugReports.respondedToBugReportAuth) {
            setLoader(true)
            const filter = {}
            const qs = ENV.objectToQueryString({ page: Page, limit: limit })
            props.getBugReports(qs, filter)
            props.beforeBugReport()
        }
    }, [props.BugReports.respondedToBugReportAuth])


    const onPageChange = async (page) => {
        const filter = {}
        if (customer)
            filter.customer = customer
        if (search) {
            filter.name = search
        }
        if (searchEmail) {
            filter.email = searchEmail
        }

        if (searchStatus) {
            filter.status = searchStatus
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getBugReports(qs, filter)
    }

    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (customer)
            filter.customer = customer
        if (search) {
            filter.name = search
        }
        if (searchEmail) {
            filter.email = searchEmail
        }

        if (searchStatus) {
            filter.status = searchStatus
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getBugReports(qs, filter)
        setLoader(true)

    }


    // Function to apply filters and fetch bug reports based on filter criteria
    const applyFilters = () => {
        const filter = {}

        if (customer)
            filter.customer = customer

        if (search) {
            filter.name = search
        }
        if (searchEmail) {
            filter.email = searchEmail
        }

        if (searchStatus) {
            filter.status = searchStatus
        }

        const qs = ENV.objectToQueryString({ page: 1, limit: limit })

        props.getBugReports(qs, filter)
        setLoader(true)
    }


    // Function to reset filters
    const reset = () => {

        setCustomer('')
        setSearchStatus('')
        setSearch('')
        setSearchEmail('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getBugReports(qs)
        setLoader(true)
        localStorage.setItem('bugReportTitle', '')
    }

    // Function to toggle the content modal and populate with data
    const setModal = (data) => {
        setMsg("");
        setContentModal(!contentModal)
        setBugId(data._id)
        setCustomerName(data.customerName)
        setName(data.name)
        setEmail(data.email)
        setPhone(data.phone)
        setSubject(data.subject)
        setMessage(data.message)
        setReply(data.reply)
        setStatus(data.status)
    }


    const submit = (Id) => {
        // setStatus(true)
        let check = true
        if (reply == undefined || validator.isEmpty(reply.trim())) {
            setMsg('Reply is Required.')
            check = false
        }

        if (check) {
            let payload = { status: true, reply }
            dispatch(respondToBugReport(Id, payload));
            setContentModal(!contentModal)
        }
    }


    return (
        <>
        <Helmet>
            <title>Scotani | Admin Panel | Bug Report</title>
        </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row>
                            <Col md="12">
                                <Card className="filter-card card custom">
                                    <Card.Header>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Group>
                                                    <Form.Label style={{ color: 'black' }} className="d-block mb-2">Name</Form.Label>
                                                    <Form.Control onKeyPress={handleKeyPress} placeholder="Name" name="Name" value={search} onChange={(e) => setSearch(e.target.value)}></Form.Control>
                                                </Form.Group>
                                            </Col>



                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Group>
                                                    <Form.Label style={{ color: 'black' }} className="d-block mb-2">Email</Form.Label>
                                                    <Form.Control onKeyPress={handleKeyPress} value={searchEmail} type="text" placeholder="john@gmail.com" onChange={(e) => setSearchEmail(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6} className="search-wrap">
                                                <Form.Label style={{ color: 'black' }} className="d-block mb-2">Status</Form.Label>
                                                <Form.Group>
                                                    <select onKeyPress={handleKeyPress} value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                                                        <option value="">Select Status</option>
                                                        <option value='true'>Responded</option>
                                                        <option value="false">Pending</option>
                                                    </select>
                                                </Form.Group>
                                            </Col>


                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label className="d-none d-sm-block mb-2 form-label">&nbsp;</label>
                                                    <div className="d-flex justify-content-between filter-btns-holder">
                                                        <button type="button" className="btn btn-info" disabled={!search && !customer && !searchStatus && !searchEmail} onClick={applyFilters} >Search</button>
                                                        <button type="button" className="btn btn-warning" hidden={!search && !customer && !searchStatus && !searchEmail} onClick={reset}>Reset</button>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Bug Reports</Card.Title>

                                        </div>

                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className='text-center td-actions'>Name</th>
                                                        <th className='text-center td-actions'>Email</th>
                                                        <th className='text-center td-actions'>Subject</th>
                                                        <th className='text-center td-actions'>Status</th>
                                                        <th className="td-actions text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        data && data.length ?
                                                            data.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>

                                                                        <td style={{ textWrap: "wrap" }} className="text-center td-actions">
                                                                            {item.name}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            {item.email}
                                                                        </td>
                                                                        <td style={{ textWrap: "wrap" }} className="text-center td-actions">
                                                                            {item.subject}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            <span className={` status ${item.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {item.status ? 'Responded' : 'Pending'}</span>
                                                                            </span>
                                                                        </td>

                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">


                                                                                <li className="d-inline-block align-top">
                                                                                    <Button
                                                                                        className="btn-action btn-primary"
                                                                                        type="button" title="View"
                                                                                        onClick={() => setModal(item)}
                                                                                    >
                                                                                        <i className="fa fa-eye"></i>
                                                                                    </Button>
                                                                                </li>


                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="7" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Data Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>

                                            {pagination &&
                                                <Col className="pb-4">
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
                                                </Col>
                                            }
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {


                            data &&
                            <Modal className="modal-primary" id="content-Modal" onHide={() => setContentModal(!contentModal)} show={contentModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                View Bug Report
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className='bug-report-modal'>
                                        <Form.Group>
                                            <label>Customer <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={customerName}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Name <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={name}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Email <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={email}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Phone <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={phone}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Subject <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={subject}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Message <span className="text-danger">*</span></label>
                                            <div
                                                style={{ color: "#ccc" }}
                                                dangerouslySetInnerHTML={{ __html: message }}
                                            ></div>

                                        </Form.Group>
                                        <Form.Group>

                                            {status ?
                                                <>
                                                    <label>Reply <span className="text-danger">*</span></label>
                                                    <div
                                                        style={{ color: "#ccc" }}
                                                        dangerouslySetInnerHTML={{ __html: reply }}
                                                    ></div>
                                                </>
                                                :
                                                permissions && permissions.replyBugReport &&
                                                <>
                                                    <label>Reply <span className="text-danger">*</span></label>
                                                    <Form.Control
                                                        as="textarea" rows={3}
                                                        value={reply ?? ''}
                                                        onChange={(e) => { setReply(e.target.value) }}
                                                        placeholder="reply text here"
                                                        type="text"
                                                    ></Form.Control>
                                                    <span className={msg ? `` : `d-none`}>
                                                        <label className="pl-1 text-danger">{msg}</label>
                                                    </span>
                                                </>

                                            }

                                        </Form.Group>


                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-danger" onClick={() => setContentModal(!contentModal)}>Close</Button>


                                    {(status == null || status == false) && permissions && permissions.replyBugReport &&
                                        <Button className="btn btn-info" onClick={() => submit(bugId)} >Send</Button>
                                    }
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({

    BugReports: state.BugReports,
    error: state.error,
    customer: state.customer,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { getBugReports, beforeBugReport, beforeCustomer, getCustomers })(BugReport);