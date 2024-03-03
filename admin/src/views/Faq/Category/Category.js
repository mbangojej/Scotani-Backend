import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../../config/config';
import { beforeFAQCategory, getFAQCategories, deleteFAQCategory, addFAQCategory, updateFAQCategory } from './Category.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import userDefaultImg from '../../../assets/img/default-user-icon-13.jpg';
import { Button, Card, Form, Table, Container, Row, Col, Modal } from "react-bootstrap";
import validator from 'validator';
import Select from 'react-select'
import { Helmet } from 'react-helmet';
var CryptoJS = require("crypto-js");

const FAQCategory = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [searchTitle, setSearchTitle] = useState('')
    const [searchStatus, setSearchStatus] = useState('')

    const [categoryModal, setCategoryModal] = useState(false)
    const [categoryModalType, setCategoryModalType] = useState(null)
    const [category, setCategory] = useState(null)
    const [msg, setMsg] = useState(null)
    const [categorySelection, setCategorySelection] = useState(null)
    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
        const filter = {}
        if (searchTitle !== undefined && searchTitle !== null && searchTitle !== '')
            filter.title = searchTitle

        props.getFAQCategories(qs, filter)
        let roleEncrypted = localStorage.getItem('role');
        let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            role = roleDecrypted
        }
        props.getRole(role)
    }, [])

    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])

    useEffect(() => {
        if (props.FAQcategory.createFAQCategoryAuth || props.FAQcategory.editFAQCategoryAuth) {
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            const filter = {}
            if (searchTitle !== undefined && searchTitle !== null && searchTitle !== '')
                filter.title = searchTitle

            props.getFAQCategories(qs, filter)
            setCategoryModal(false)

        }
    }, [props.FAQcategory.createFAQCategoryAuth, props.FAQcategory.editFAQCategoryAuth])


    useEffect(() => {
        if (props.FAQcategory.getFAQCategoriesAuth) {
            let { categories, pagination } = props.FAQcategory.FAQcategories
            setData(categories)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setLoader(false)
            props.beforeFAQCategory()
        }
    }, [props.FAQcategory.getFAQCategoriesAuth])

    useEffect(() => {
        if (props.FAQcategory.existFAQCategoryAuth) {
            let { message, exist } = props.FAQcategory.FAQcategories
            if (exist)
                setMsg({ name: 'Category name already exist' })
            else
                setMsg({ display_order: 'Display order already exist' })
            setLoader(false)
            props.beforeFAQCategory()
        }
    }, [props.FAQcategory.existFAQCategoryAuth])


    useEffect(() => {
        if (props.FAQcategory.delFAQCategoryAuth) {
            const filter = {}
            if (searchTitle && searchTitle !== '') {
                filter.name = searchTitle
            }
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getFAQCategories(qs, filter)
            props.beforeFAQCategory()
        }
    }, [props.FAQcategory.delFAQCategoryAuth])

    const deleteCATEGORY = (categoryId) => {
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
                props.deleteFAQCategory(categoryId)
            }
        })
    }

    const onPageChange = async (page) => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getFAQCategories(qs, filter)
    }


    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getFAQCategories(qs, filter)
        setLoader(true)

    };


    const setModal = (data, type) => {
        setCategoryModalType(type)
        if (type == 1)   // Add
        {
            setCategory({
                name: '',
                display_order: '',
            })
        } else {
            setCategory({
                _id: data._id,
                name: data.name,
                display_order: data.display_order,
            })
        }
        setMsg({
            name: '',
            display_order: '',
        })
        setCategoryModal(!categoryModal)
    }

    const applyFilters = () => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.title = searchTitle
        }
        setPage(1)
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getFAQCategories(qs, filter)
        setLoader(true)
    }

    const reset = () => {
        setSearchTitle('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getFAQCategories(qs)
        setLoader(true)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters();
        }
    }



    const submit = () => {
        const errors = {};

        if (validator.isEmpty(category.name.trim())) {
            errors.name = 'Name is required';
        }

        if (categoryModalType == 1) {
            if (validator.isEmpty(category.display_order)) {
                errors.display_order = 'Display order is required';
            }
        } else {
            if (validator.isEmpty(String(category.display_order))) {
                errors.display_order = 'Display order is required';
            }
        }
        if (category.display_order !== "" && category.display_order <= 0) {

            errors.display_order = 'Display Order must be greater than zero';
        }

        setMsg(errors);

        const isValid = Object.keys(errors).length === 0;

        if (isValid) {
            setLoader(true)
            if (categoryModalType == 1) {
                props.addFAQCategory(category)
            } else {
                props.updateFAQCategory(category)
            }

        }
    }



    const handleKeyDown = (e) => {
        // Prevent the input if the key pressed is a decimal point
        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };


    // when an error is received
    useEffect(() => {
        if (props.error.error)
            setLoader(false)
    }, [props.error.error])
    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Faq Categories</title>
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
                                                    <label style={{ color: 'black' }}>Name</label>
                                                    <Form.Control onKeyPress={handleKeyPress} placeholder='Name' type="text" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
                                                </Form.Group>
                                            </Col>


                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info" disabled={!searchTitle} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchTitle} onClick={reset}>Reset</Button>
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
                                            <Card.Title as="h4">FAQ Categories</Card.Title>
                                            {
                                                permissions && permissions.addFaqCategory &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => setModal(null, 1)}>
                                                    Add Category
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
                                                        <th className='text-center td-actions'>Name</th>
                                                        <th className='text-center td-actions'>Display Order</th>
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
                                                                        <td className="text-center td-actions">
                                                                            {item.name}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            {item.display_order}
                                                                        </td>

                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">

                                                                                <li className="d-inline-block align-top">
                                                                                    <Button
                                                                                        className="btn-action btn-primary"
                                                                                        type="button" title="View"
                                                                                        onClick={() => setModal(item, 3)}
                                                                                    >
                                                                                        <i className="fa fa-eye"></i>
                                                                                    </Button>
                                                                                </li>

                                                                                {
                                                                                    permissions && permissions.editFaqCategory &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button" title="Edit"
                                                                                            variant="success"
                                                                                            onClick={() => setModal(item, 2)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                                {
                                                                                    permissions && permissions.deleteFaqCategory &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-danger"
                                                                                            type="button"
                                                                                            variant="danger" title="Delete"
                                                                                            onClick={() => deleteCATEGORY(item._id)}
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
                                                                <td colSpan="5" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Category Found</div>
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
                            categoryModal &&
                            <Modal className="modal-primary" id="content-Modal" onHide={() => setCategoryModal(!categoryModal)} show={categoryModal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {categoryModalType == 1 ? "Add" : categoryModalType == 2 ? "Edit" : "View"} Category
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group>
                                            <label>Name <span className="text-danger">*</span></label>
                                            {
                                                categoryModalType == 3 ?
                                                    <Form.Control
                                                        type="text"
                                                        value={category.name}
                                                        readOnly
                                                        disabled
                                                    />
                                                    :
                                                    <Form.Control
                                                        type="text"
                                                        value={category.name}
                                                        onChange={(e) => {
                                                            setCategory({ ...category, name: e.target.value })
                                                            setMsg((prevMsg) => ({ ...prevMsg, name: '' }))
                                                        }}
                                                    />
                                            }
                                            {msg.name &&
                                                <span className={msg.name ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.name}</label>
                                                </span>
                                            }
                                        </Form.Group>

                                        <Form.Group>
                                            <label>Display Order<span className="text-danger">*</span></label>
                                            {
                                                categoryModalType == 3 ?
                                                    <Form.Control
                                                        type="number"
                                                        value={category.display_order}
                                                        readOnly
                                                        disabled
                                                    />
                                                    :
                                                    <Form.Control
                                                        type="number"
                                                        value={category.display_order}
                                                        onChange={(e) => {
                                                            setCategory({ ...category, display_order: e.target.value.replace(/[^0-9]/g, '') })
                                                            setMsg((prevMsg) => ({ ...prevMsg, display_order: '' }))
                                                        }}
                                                        onKeyDown={handleKeyDown}
                                                    />
                                            }
                                            {msg.display_order &&
                                                <span className={msg.display_order ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.display_order}</label>
                                                </span>
                                            }
                                        </Form.Group>



                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    {categoryModalType != 3 && <Button className="btn btn-danger" onClick={() => submit()}>{categoryModalType == 1 ? "Add" : "Update"}</Button>}
                                    <Button className="btn btn-danger" onClick={() => setCategoryModal(!categoryModal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container >
            }
        </>
    )
}

const mapStateToProps = state => ({
    FAQcategory: state.faqCategory,
    category: state.category,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforeFAQCategory, getFAQCategories, deleteFAQCategory, getRole, addFAQCategory, updateFAQCategory })(FAQCategory);