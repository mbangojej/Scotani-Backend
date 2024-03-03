import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeContactUsQuery, getContactUsQueries, deleteContactUsQuery, respondToQuery } from './ContactUsQuery.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import validator from 'validator';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap"
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
const ContactUsQueries = (props) => {
    const dispatch = useDispatch()
    const [Page, setPage] = useState(1)

    // contactUsQuery properties
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState('')
    const [response, setResponse] = useState('')
    const [responseMsg, setResponseMsg] = useState('')
    //General
    const [pagination, setPagination] = useState(null)
    const [contactUsQueryModal, setContactUsQueryModal] = useState(false)
    const [contactUsQueries, setContactUsQueries] = useState(null)
    const [contactUsQuery, setContactUsQuery] = useState(null)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})


    useEffect(() => {
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        const filter = {}
        window.scroll(0, 0)
        props.getContactUsQueries(qs, filter)
    }, [])

    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])


    useEffect(() => {
        if (props.contactUsQuery.getContactUsQueryAuth) {
            const { contactUsQueries, pagination } = props.contactUsQuery

            setContactUsQueries(contactUsQueries)
            setPagination(pagination)
            props.beforeContactUsQuery()
        }
    }, [props.contactUsQuery.getContactUsQueryAuth])

    useEffect(() => {
        if (props.contactUsQuery.upsertContactUsQueryAuth) {
            setLoader(true)
            let filtered = contactUsQueries.filter((item) => {
                if (item._id !== props.contactUsQuery.contactUsQueryId)
                    return item
            })
            setContactUsQueries([...filtered, props.contactUsQuery.contactUsQuery])
            setLoader(false)
            const filter = {}

            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getContactUsQueries(qs, filter)
            props.beforeContactUsQuery()
        }
    }, [props.contactUsQuery.upsertContactUsQueryAuth])

    useEffect(() => {
        if (props.contactUsQuery.deleteContactUsQueryAuth) {
            const filter = {}
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            window.scroll(0, 0)
            props.getContactUsQueries(qs, filter)
            props.beforeContactUsQuery()
        }
    }, [props.contactUsQuery.deleteContactUsQueryAuth])

    useEffect(() => {
        if (contactUsQueries) {
            setLoader(false)
            if (window.location.search) {
                const urlParams = new URLSearchParams(window.location.search);
                setModal(3, urlParams.get('contactUsQueryId'))
            }
        }
    }, [contactUsQueries])

    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])


    // set modal type
    const setModal = (contactUsQueryId = null) => {
        setContactUsQueryModal(!contactUsQueryModal)
        setLoader(false)        // edit or view contactUsQuery
        getContactUsQuery(contactUsQueryId)
    }

    const getContactUsQuery = async (contactUsQueryId) => {
        setLoader(true)
        const contactUsQueryData = await contactUsQueries.find((elem) => String(elem._id) === String(contactUsQueryId))
        if (contactUsQueryData) {
            setContactUsQuery({ ...contactUsQueryData })
            setName(contactUsQueryData.name ? contactUsQueryData.name : '')
            setEmail(contactUsQueryData.email ? contactUsQueryData.email : '')
            setPhone(contactUsQueryData.phone ? contactUsQueryData.phone : '')
            setSubject(contactUsQueryData.subject ? contactUsQueryData.subject : '')
            setMessage(contactUsQueryData.message ? contactUsQueryData.message : '')
            setStatus(contactUsQueryData.status ? contactUsQueryData.status : '')
            setResponse(contactUsQueryData.response ? contactUsQueryData.response : '')
        }
        setLoader(false)
    }

    const submit = (Id) => {
        // setStatus(true)
        let check = true
        if (validator.isEmpty(response.trim())) {
            setResponseMsg('Message is Required.')
            check = false
        }

        if (check) {
            let payload = { status: true, response }
            dispatch(respondToQuery(Id, payload));
            setContactUsQueryModal(!contactUsQueryModal)
        }
    }
    const onPageChange = async (page) => {
        const filter = {}
        // if (searchContactUsQuery !== undefined && searchContactUsQuery !== null && searchContactUsQuery !== '')
        //     filter.name = searchContactUsQuery
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: 10 })
        props.getContactUsQueries(qs, filter, true)
    }

    const deleteContactUsQuery = (contactUsQueryId) => {
        Swal.fire({
            title: 'Are you sure you want to delete?',
            html: 'If you delete an item, it would be permanently lost.',
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Delete'
        }).then(async (result) => {
            if (result.value) {
                setLoader(true)
                props.deleteContactUsQuery(contactUsQueryId)
            }
        })
    }

    return (
        <>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row>
                            <Col md="12">
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Phone</th>
                                                        <th>Subject</th>
                                                        <th>Status</th>
                                                        <th className="td-actions">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        contactUsQueries && contactUsQueries.length ?
                                                            contactUsQueries.map((query, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>
                                                                        <td>
                                                                            {query.name}
                                                                        </td>
                                                                        <td>
                                                                            {query.email}
                                                                        </td>
                                                                        <td>
                                                                            {query.phone}
                                                                        </td>
                                                                        <td>
                                                                            {query.subject}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            <span className={` status ${query.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {query.status ? 'Responded' : 'Pending'}</span>
                                                                            </span>
                                                                        </td>

                                                                        <td className="td-actions">
                                                                            <ul className="list-unstyled mb-0 d-flex">
                                                                                <li className="d-inline-block align-top">
                                                                                 
                                                                                        <a
                                                                                            className="btn-action btn-primary"
                                                                                            type="button" title="View"
                                                                                            variant="info"
                                                                                            onClick={() => setModal(query._id)}
                                                                                        >
                                                                                            <i className="fas fa-eye"></i>
                                                                                        </a>
                                                                                    
                                                                                    {
                                                                                        permissions && permissions.deleteContact &&
                                                                                        <OverlayTrigger overlay={() => (<Tooltip id="tooltip-481441726">Delete</Tooltip>)} >
                                                                                            <a
                                                                                                className="btn-action btn-danger"
                                                                                                type="button"
                                                                                                variant="info"
                                                                                                onClick={() => deleteContactUsQuery(query._id)}
                                                                                            >
                                                                                                <i className="fas fa-trash"></i>
                                                                                            </a>
                                                                                        </OverlayTrigger>
                                                                                    }
                                                                                </li>
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="7" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Contact Query Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            <div className="pb-4">
                                                {pagination &&
                                                    <Pagination
                                                        className="m-3"
                                                        defaultCurrent={1}
                                                        pageSize // items per page
                                                        current={Page > pagination.pages ? pagination.pages : Page} // current active page
                                                        total={pagination.pages} // total pages
                                                        onChange={onPageChange}
                                                        locale={localeInfo}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {contactUsQuery && contactUsQuery.name ?

                            <Modal className="modal-primary contact-query-modal" onHide={() => setContactUsQueryModal(!contactUsQueryModal)} show={contactUsQueryModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {/* {modalType === 1 ? 'Add' : modalType === 2 ? 'Edit' : ''} User */}
                                                View
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form className="text-left">
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Name: </label><span className="field-value">{contactUsQuery.name ? contactUsQuery.name : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Email: </label><span className="field-value">{contactUsQuery.email ? contactUsQuery.email : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Phone: </label><span className="field-value">{contactUsQuery.phone ? contactUsQuery.phone : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-center">
                                                <label className="label-font mr-2">Subject: </label><span className="field-value">{contactUsQuery.subject ? contactUsQuery.subject : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group className="flex-fill d-flex align-items-start">
                                                <label className="label-font mr-2">Message: </label>
                                                <br></br>
                                                <span className="field-value msg-body">{contactUsQuery.message ? contactUsQuery.message : "N/A"}</span>
                                            </Form.Group>
                                        </div>
                                        <div className="d-flex name-email">
                                            <Form.Group>
                                                <label className='mr-2'>Status<span className="text-danger"> *</span></label>
                                                <label className="right-label-radio mb-2 mr-2">
                                                    <div className='d-flex align-items-center'>
                                                        <input name="status" type="radio" checked={status} value={status} onChange={(e) => { setStatus(true) }} />
                                                        <span className="checkmark"></span>
                                                        <span className='ml-1' onChange={(e) => {
                                                            setStatus(true);
                                                        }} ><i />Responded</span>
                                                    </div>
                                                </label>
                                                <label className="right-label-radio mb-2 mr-2">
                                                    <div className='d-flex align-items-center'>
                                                        <input name="status" type="radio" checked={!status} value={status} onChange={(e) => { setStatus(false) }} />
                                                        <span className="checkmark"></span>
                                                        <span className='ml-1' onChange={(e) => {
                                                            setStatus(false);
                                                        }} ><i />Pending</span>
                                                    </div>
                                                </label>

                                            </Form.Group>
                                        </div>

                                        <div className="d-flex name-email">
                                            <Form.Group>
                                                <label>Respnose Message</label>

                                                <textarea className='form-control' placeholder='Respond to query' name="response" rows={4} cols={40} onChange={(e) => setResponse(e.target.value)} value={contactUsQuery.response} />

                                                <span className={responseMsg ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{responseMsg}</label>
                                                </span>
                                            </Form.Group>
                                        </div>

                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-warning" onClick={() => setContactUsQueryModal(!contactUsQueryModal)} >Close</Button>
                                    {contactUsQuery.response == null &&
                                        <Button className="btn btn-info" onClick={() => submit(contactUsQuery._id)} >Send</Button>
                                    }
                                </Modal.Footer>
                            </Modal>
                            : ''
                        }
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    contactUsQuery: state.contactUsQuery,
    error: state.error,
    getRoleRes: state.role.getRoleRes

});

export default connect(mapStateToProps, { getRole, beforeContactUsQuery, getContactUsQueries, deleteContactUsQuery, respondToQuery })(ContactUsQueries);