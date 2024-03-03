import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeFaq, getFaqs, deleteFaq } from './Faq.action';
import { getFAQCategories, beforeFAQCategory } from './Category/Category.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";
var CryptoJS = require("crypto-js");
import { Helmet } from 'react-helmet';

const Faq = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [searchTitle, setSearchTitle] = useState('')
    const [categoryOptions, setCategoryOptions] = useState([])
    const [category, setCategory] = useState()
    const [categoryName, setCategoryName] = useState()
    const [searchStatus, setSearchStatus] = useState('')
    const [contentModal, setContentModal] = useState(false)
    const [title, setTitle] = useState('')
    const [display_order, setDisplayOrder] = useState('')
    const [desc, setDescription] = useState()
    const [status, setStatus] = useState(true)


    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
        const filter = {}
        if (searchTitle !== undefined && searchTitle !== null && searchTitle !== '')
            filter.title = searchTitle
        if (category !== undefined && category !== null && category !== '')
            filter.category = category
        if (searchStatus !== undefined && searchStatus !== null && searchStatus !== '')
            filter.status = searchStatus === 'true' ? true : false

        props.getFaqs(qs, filter)
        let roleEncrypted = localStorage.getItem('role');
        let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            role = roleDecrypted
        }
        props.getRole(role)

        const fiterQs = ENV.objectToQueryString({ all: 1 })
        props.getFAQCategories(fiterQs)
    }, [])

    /*Set Category data in select for filter*/
    useEffect(() => {
        if (props.FAQcategory.getFAQCategoriesAuth) {
            const { categories } = props.FAQcategory.FAQcategories
            let categories_ = []
            categories.forEach((category, index) => {
                categories_.push({
                    label: category.name,
                    key: category._id,
                    value: category._id,
                })
            })
            setCategoryOptions(categories_)

            props.beforeFAQCategory()
        }
    }, [props.FAQcategory.getFAQCategoriesAuth])


    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])

    useEffect(() => {
        if (props.faqs.getFaqsAuth) {
            let { faqs, pagination } = props.faqs.faqs
            setData(faqs)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            props.beforeFaq()
        }
    }, [props.faqs.getFaqsAuth])

    useEffect(() => {
        if (data) {
            setLoader(false)
        }
    }, [data])

    useEffect(() => {
        if (props.faqs.delFaqAuth) {
            let filtered = data.filter((item) => {
                if (item._id !== props.faqs.faq.faqId)
                    return item
            })
            setData(filtered)
            const filter = {}
            if (searchTitle && searchTitle !== '') {
                filter.name = searchTitle
            }
            if (category !== undefined && category !== null && category !== '') {
                filter.category = category
            }
            if (searchStatus !== '') {
                filter.status = searchStatus === 'true' ? true : false
            }
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getFaqs(qs, filter)
            props.beforeFaq()
        }
    }, [props.faqs.delFaqAuth])

    const deleteFAQ = (faqId) => {
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
                props.deleteFaq(faqId)
            }
        })
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }
    const onPageChange = async (page) => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        if (category !== undefined && category !== null && category !== '') {
            filter.category = category
        }
        if (searchStatus !== '') {
            filter.status = searchStatus === 'true' ? true : false
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getFaqs(qs, filter)
    }
    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        if (category !== undefined && category !== null && category !== '') {
            filter.category = category
        }
        if (searchStatus !== '') {
            filter.status = searchStatus === 'true' ? true : false
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getFaqs(qs, filter)
        setLoader(true)

    };

    const applyFilters = () => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.title = searchTitle
        }
        if (category !== undefined && category !== null && category !== '') {
            filter.category = category
        }
        if (searchStatus !== '') {
            filter.status = searchStatus === 'true' ? true : false
        }
        setPage(1)
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getFaqs(qs, filter)
        setLoader(true)
    }

    const reset = () => {
        setSearchTitle('')
        setSearchStatus('')
        setCategory('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getFaqs(qs)
        setLoader(true)
    }
    const setModal = (data) => {
        setContentModal(!contentModal)
        setTitle(data.title)
        setDisplayOrder(data.display_order)
        setDescription(data.desc)
        setCategoryName(data.category)
        setStatus(data.status)

    }
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | FAQs</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row className="pb-3">
                            <Col sm={12}>
                                <Card className="filter-card">
                                    <Card.Header>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Filters</Card.Title>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>

                                                <Form.Group>
                                                    <Form.Label style={{ color: 'black' }} className="d-block mb-2">Category</Form.Label>
                                                    <select value={category} onKeyPress={handleKeyPress} onChange={(e) => setCategory(e.target.value)}>
                                                        <option value="">Select Category</option>
                                                        {
                                                            categoryOptions && categoryOptions.length > 0 ?
                                                                categoryOptions.map((option, key) => {
                                                                    return (<option key={key} value={option.value}>{option.label}</option>);
                                                                })
                                                                :
                                                                ''
                                                        }

                                                    </select>
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Question</label>
                                                    <Form.Control onKeyPress={handleKeyPress} placeholder='Question' type="text" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6}>
                                                <label style={{ color: 'black' }}>Status</label>
                                                <Form.Group>
                                                    <select onKeyPress={handleKeyPress} value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                                                        <option value="">Select Status</option>
                                                        <option value='true'>Active</option>
                                                        <option value="false">Inactive</option>
                                                    </select>
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info" disabled={!searchTitle && !category && !searchStatus} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchTitle && !category && !searchStatus} onClick={reset}>Reset</Button>
                                                    </div>

                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">FAQs</Card.Title>
                                            {
                                                permissions && permissions.addFaq &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => props.history.push(`/add-faq`)}>
                                                    Add FAQ
                                                </Button>
                                            }
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className='text-center'>Category</th>
                                                        <th className='text-center'>Question</th>
                                                        <th className='text-center'>Display Order</th>
                                                        <th className='text-center'>Status</th>
                                                        <th className="td-actions text-center ">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        data && data.length ?
                                                            data.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{pagination && ((pagination.limit * pagination.page) - pagination.limit) + index + 1}</td>

                                                                        <td className="text-center ">
                                                                            {item.category}
                                                                        </td>
                                                                        <td className="text-center ">
                                                                            {item.title}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {item.display_order}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <span className={` status ${item.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {item.status ? 'Active' : 'Inactive'}</span>
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

                                                                                {
                                                                                    permissions && permissions.editFaq &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button" title="Edit"
                                                                                            variant="success"
                                                                                            onClick={() => props.history.push(`/edit-faq/${item._id}`)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                                {
                                                                                    permissions && permissions.deleteFaq &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-danger"
                                                                                            type="button"
                                                                                            variant="danger" title="Delete"
                                                                                            onClick={() => deleteFAQ(item._id)}
                                                                                        >
                                                                                            <i className="fas fa-trash"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="6" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No FAQ Found</div>
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
                        {
                            data &&
                            <Modal className="modal-primary" id="content-Modal" onHide={() => setContentModal(!contentModal)} show={contentModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                View FAQ
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group>
                                            <label>Category <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={categoryName}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Question <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={title}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Display Order <span className="text-danger">*</span></label>
                                            <Form.Control
                                                readOnly
                                                type="text"
                                                value={display_order}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Answer <span className="text-danger">*</span></label>

                                            <Form.Control
                                                readOnly
                                                as="textarea" rows={3}
                                                value={desc}

                                                placeholder="Title"
                                                type="text"
                                            ></Form.Control>

                                        </Form.Group>

                                        <Form.Group>
                                            <label>Status <span className="text-danger">*</span></label>
                                            <label className="right-label-radio mr-3 mb-2 disabled-checkbox">Active
                                                <input name="status" disabled type="radio" checked={status} value={status} />
                                                <span className="checkmark"></span>
                                            </label>
                                            <label className="right-label-radio mr-3 mb-2 disabled-checkbox">Inactive
                                                <input name="status" disabled type="radio" checked={!status} value={!status} />
                                                <span className="checkmark"></span>
                                            </label>
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button className="btn btn-danger" onClick={() => setContentModal(!contentModal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    FAQcategory: state.faqCategory,
    faqs: state.faqs,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforeFAQCategory, getFAQCategories, beforeFaq, getFaqs, deleteFaq, getRole })(Faq);