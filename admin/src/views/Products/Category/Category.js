import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../../config/config';
import { beforeCategory, getCategories, deleteCategory, addCategory, updateCategory, getParentCategories } from './Category.action';
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

const Category = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [searchTitle, setSearchTitle] = useState('')
    const [searchStatus, setSearchStatus] = useState('')
    const [isValidImage, setIsValidImage] = useState(true)
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
        if (searchStatus !== undefined && searchStatus !== null && searchStatus !== '')
            filter.status = searchStatus === 'true' ? true : false

        props.getCategories(qs, filter)
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
        if (props.category.createAuth || props.category.editCategoryAuth) {
            setCategoryModal(false)
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            const filter = {}
            if (searchTitle !== undefined && searchTitle !== null && searchTitle !== '')
                filter.title = searchTitle
            if (searchStatus !== undefined && searchStatus !== null && searchStatus !== '')
                filter.status = searchStatus === 'true' ? true : false

            props.getCategories(qs, filter)
            props.getParentCategories()
            props.beforeCategory()
        }
    }, [props.category.createAuth, props.category.editCategoryAuth])
    useEffect(() => {
        if (props.category.existCategoryAuth) {
            setLoader(false)
            setMsg({ ...msg, name: 'Title already exist' })
            props.beforeCategory()
        }
    }, [props.category.existCategoryAuth])
    useEffect(() => {
        if (props.category.getParentCategoriesAuth) {
            let { categories } = props.category.parentCategories

            let options = [
                {
                    label: "Select Parent Category",
                    value: "",
                }
            ]
            categories.map((cate) => {
                if (cate.status) {
                    options.push({
                        label: cate.name,
                        value: cate._id,
                    })
                }
            })
            setCategorySelection(options)
            props.beforeCategory()
        }
    }, [props.category.getParentCategoriesAuth])
    useEffect(() => {
        if (props.category.getCategoriesAuth) {
            let { categories, pagination } = props.category.categories
            setData(categories)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setLoader(false)
            props.getParentCategories()
        }
    }, [props.category.getCategoriesAuth])
    useEffect(() => {
        if (props.category.delCategoryAuth) {
            const filter = {}
            if (searchTitle && searchTitle !== '') {
                filter.name = searchTitle
            }
            if (searchStatus !== '') {
                filter.status = searchStatus === 'true' ? true : false
            }
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getCategories(qs, filter)
            props.beforeCategory()
        }
    }, [props.category.delCategoryAuth])
    const deleteCategory = (categoryId) => {
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
                props.deleteCategory(categoryId)
            }
        })
    }
    const onPageChange = async (page) => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        if (searchStatus !== '') {
            filter.status = searchStatus === 'true' ? true : false
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getCategories(qs, filter)
    }
    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        if (searchStatus !== '') {
            filter.status = searchStatus === 'true' ? true : false
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getCategories(qs, filter)
        setLoader(true)

    }
    const applyFilters = () => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.title = searchTitle
        }
        if (searchStatus !== '') {
            filter.status = searchStatus === 'true' ? true : false
        }
        setPage(1)
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getCategories(qs, filter)
        setLoader(true)
    }
    const reset = () => {
        setSearchTitle('')
        setSearchStatus('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getCategories(qs)
        setLoader(true)
    }
    const setModal = (data, type) => {
        setCategoryModalType(type)
        if (type == 1)   // Add
        {
            setCategory({
                name: '',
                image: '',
                status: true,
                category: null,
            })
        } else {
            setCategory({
                _id: data._id,
                name: data.name,
                image: data.image,
                status: data.status,
                category: data.category
            })
        }
        setMsg({
            name: '',
            image: '',
            status: ''
        })
        setCategoryModal(!categoryModal)
    }
    /**Update 12-09-2023 
    * Add image upload function for validation before upload image on server
    ***/
    const submitPic = async (e) => {
        const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
        const selectedFile = e.target.files[0];
        if (allowedFormats.includes(selectedFile.type)) {
            try {
                const res = await ENV.uploadImage(e);
                if (res) {
                    setIsValidImage(true)
                    setCategory({ ...category, image: res ? res : "" })
                } else {
                    setIsValidImage(false)
                    if (categoryModalType == 1) {
                        setCategory({ ...category, image: "no-image" })
                    }
                }
            } catch (error) {

            }
        } else {
            if (categoryModalType == 1) {
                setCategory({ ...category, image: "no-image" })
            }
            setIsValidImage(false)
        }
    }
    const submit = () => {
        // Initialize an empty object to store validation error messages
        const validationMessages = {};

        // Check if the category name and image are empty
        if (validator.isEmpty(category.name.trim())) {
            validationMessages.name = 'Title is required';
        }
        if (validator.isEmpty(category.image)) {
            validationMessages.image = 'Image is required';
        }

        // If there are initial validation errors, display them and return
        if (Object.keys(validationMessages).length > 0) {
            setMsg({ ...msg, ...validationMessages });
            return;
        }

        // Additional validation checks
        const isValidName = /^[A-Za-z][A-Za-z\s]*$/.test(category.name);
        if (!isValidName) {
            validationMessages.name = 'Name must start with an alphabet and contain only alphabetic characters and spaces';
        }
        if (category.name.trim().length < 3 || category.name.trim().length > 50) {
            validationMessages.name = 'Name character length must be between 3 and 50.';
        }
        if (category.image === 'no-image') {
            validationMessages.image = 'Invalid file format. Only PNG and JPG images are allowed.';
        }

        // If there are additional validation errors, display them and return
        if (Object.keys(validationMessages).length > 0) {
            setMsg({ ...msg, ...validationMessages });
            return;
        }
        setLoader(true)
        if (categoryModalType == 1) {
            props.addCategory(category)
        } else {
            props.updateCategory(category)
        }
        // setCategoryModal(false)
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
                <title>Scotani | Admin Panel | Category </title>
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
                                                    <label style={{ color: 'black' }}>Title</label>
                                                    <Form.Control onKeyPress={handleKeyPress} placeholder='Title' type="text" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
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
                                                        <Button variant="info" disabled={!searchTitle && !searchStatus} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchTitle && !searchStatus} onClick={reset}>Reset</Button>
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
                                            <Card.Title as="h4">Categories</Card.Title>
                                            {
                                                permissions && permissions.addCategory &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => setModal(null, 1)}>
                                                    Add New Category
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
                                                        <th className="text-center" style={{ "width": "25%" }}>Title</th>
                                                        <th className="text-center" style={{ "width": "25%" }}>Parent Category</th>
                                                        <th className="text-center" style={{ "width": "25%" }}>Status</th>
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
                                                                        <td className="text-center">
                                                                            {item.name}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {item.parentCategoryName}
                                                                        </td>

                                                                        <td className="td-actions text-center">
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
                                                                                        onClick={() => setModal(item, 3)}
                                                                                    >
                                                                                        <i className="fa fa-eye"></i>
                                                                                    </Button>
                                                                                </li>

                                                                                {
                                                                                    permissions && permissions.editCategory &&
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
                                                                                    permissions && permissions.deleteCategory &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-danger"
                                                                                            type="button"
                                                                                            variant="danger" title="Delete"
                                                                                            onClick={() => deleteCategory(item._id)}
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
                                                                <td colSpan="7" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Category Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            <div className="pb-4">
                                                {pagination &&
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
                                                }
                                            </div>
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
                                                {categoryModalType == 1 ? "Add New" : categoryModalType == 2 ? "Edit" : "View"} Category
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group>
                                            <label>Title <span className="text-danger">*</span></label>
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
                                                            setMsg({ ...msg, name: '' })
                                                        }
                                                        }
                                                    />
                                            }
                                            {msg.name &&
                                                <span className={msg.name ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.name}</label>
                                                </span>
                                            }
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Parent Category</label>
                                            <Select className={`${categoryModalType === 3 ? 'disabled-select' : ''}`} 
                                                options={categorySelection.filter(cate => {
                                                    return cate.value == "" || cate.value != category?._id
                                                })}
                                                onChange={(option) => setCategory({ ...category, category: option.value })}
                                                value={categorySelection?.filter(option => option.value === category.category)}
                                            />
                                        </Form.Group>
                                        <Form.Group className='modal-control-wrapper'>
                                            <label>Image <span className="text-danger">*</span></label>
                                            <div className='mb-2' >
                                                {<img className="img-thumbnail" src={category.image ? ENV.uploadedImgPath + category.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} style={{ width: '140px' }} />}
                                            </div>
                                            {
                                                categoryModalType != 3 &&
                                                <Form.Control
                                                    className='text-white img-btn-wrapper category-img-selector'
                                                    onChange={async (e) => {
                                                        setMsg({ ...msg, image: '' })
                                                        submitPic(e)
                                                    }}
                                                    accept="image/*"
                                                    type="file"
                                                ></Form.Control>
                                            }
                                            {msg.image &&
                                                <span className={msg.image ? `` : `d-none`}>
                                                    <label className="pl-1 text-danger">{msg.image}</label>
                                                </span>
                                            }
                                        </Form.Group>
                                        <Form.Group>
                                            <label>Status <span className="text-danger">*</span></label>
                                            {
                                                categoryModalType == 3 ?
                                                    <>
                                                        <label className="right-label-radio mr-3 mb-2 disabled-checkbox">Active
                                                            <input name="status" disabled type="radio" checked={category.status} value={category.status} onChange={(e) => { setCategory({ ...category, status: true }) }} />
                                                            <span className="checkmark"></span>
                                                        </label>
                                                        <label className="right-label-radio mr-3 mb-2 disabled-checkbox">Inactive
                                                            <input name="status" disabled type="radio" checked={!category.status} value={!category.status} onChange={(e) => { setCategory({ ...category, status: false }) }} />
                                                            <span className="checkmark"></span>
                                                        </label>
                                                    </>
                                                    :
                                                    <>
                                                        <label className="right-label-radio mr-3 mb-2">Active
                                                            <input name="status" type="radio" checked={category.status} value={category.status} onChange={(e) => { setCategory({ ...category, status: true }) }} />
                                                            <span className="checkmark"></span>
                                                        </label>
                                                        <label className="right-label-radio mr-3 mb-2">Inactive
                                                            <input name="status" type="radio" checked={!category.status} value={!category.status} onChange={(e) => { setCategory({ ...category, status: false }) }} />
                                                            <span className="checkmark"></span>
                                                        </label>
                                                    </>
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
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    category: state.category,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforeCategory, getCategories, deleteCategory, getRole, addCategory, updateCategory, getParentCategories })(Category);