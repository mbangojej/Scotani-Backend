import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeUserEmailTemplate, deleteUserEmailTemplate, getUserEmailTemplates } from './UserEmailTemplate.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col } from "react-bootstrap";
import { Helmet } from 'react-helmet';

const UserEmailTemplate = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [searchTitle, setSearchTitle] = useState('')
    const [searchSubject, setSearchSubject] = useState('')


    useEffect(() => {
        props.getUserEmailTemplates()
    }, [])

    useEffect(() => {
        if (props.UserEmailTemplates.getUserEmailTemplatesAuth) {
            const { emailTemplate, pagination } = props.UserEmailTemplates.userEmailTemplateList
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setData(emailTemplate)
        }
    }, [props.UserEmailTemplates.getUserEmailTemplatesAuth, props.UserEmailTemplates.userEmailTemplateList])


    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])

    useEffect(() => {
        if (data) {
            setLoader(false)
        }
    }, [data])

    useEffect(() => {
        if (props.UserEmailTemplates.delUserEmailTemplateAuth) {


            let filtered = data.filter((item) => {
                if (item._id !== props.UserEmailTemplates.userEmailTemplate.languageId)
                    return item
            })
            setData(filtered)
            const filter = {}
            if (searchTitle && searchTitle !== '') {
                filter.name = searchTitle
            }
            if (searchSubject && searchSubject !== '') {
                filter.subject = searchSubject
            }
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getUserEmailTemplates(qs, filter)
            props.beforeUserEmailTemplate()
        }
    }, [props.UserEmailTemplates.delUserEmailTemplateAuth])

    const deleteUserEmailTemplate = (faqId) => {
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
                props.deleteUserEmailTemplate(faqId)
            }
        })
    }

    const onPageChange = async (page) => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        if (searchSubject && searchSubject !== '') {
            filter.subject = searchSubject
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getUserEmailTemplates(qs, filter)
    }

    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.name = searchTitle
        }
        if (searchSubject && searchSubject !== '') {
            filter.subject = searchSubject
        }
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getUserEmailTemplates(qs, filter)
        setLoader(true)

    }

    const applyFilters = () => {
        const filter = {}
        if (searchTitle && searchTitle !== '') {
            filter.title = searchTitle
        }
        if (searchSubject && searchSubject !== '') {
            filter.subject = searchSubject
        }
        setPage(1)
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getUserEmailTemplates(qs, filter)
        setLoader(true)
    }

    const reset = () => {
        setSearchTitle('')
        setSearchSubject('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getUserEmailTemplates(qs)
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
                <title>Scotani | Admin Panel | Email Templates</title>
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
                                                    <Form.Control onKeyPress={handleKeyPress} type="text" value={searchTitle} placeholder="Title" onChange={(e) => setSearchTitle(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>

                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Subject</label>
                                                    <Form.Control onKeyPress={handleKeyPress} type="text" value={searchSubject} placeholder="Title" onChange={(e) => setSearchSubject(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>


                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info" disabled={!searchTitle && !searchSubject} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchTitle && !searchSubject} onClick={reset}>Reset</Button>
                                                    </div>

                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* <Row>
                            <Col>
                                <span style={{color : 'white'}}>{`Total : ${pagination?.total}`}</span>
                                <label>&nbsp;</label>
                            </Col>
                        </Row> */}
                        <Row>
                            <Col md="12">
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Email Templates</Card.Title>
                                            {/* <p className="card-category">List of FAQs</p> */}
                                            {/* {
                                                permissions && permissions.addEmailTemplate && 
                                                    <Button
                                                        variant="info"
                                                        className="float-sm-right"
                                                        onClick={() => props.history.push(`/add-user-email-templates`)}>
                                                        Add Email Templates
                                                    </Button>
                                            } */}
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className='text-center td-actions'>Title</th>
                                                        <th className='text-center td-actions'>Subject</th>
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
                                                                            {item.title}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            {item.subject}
                                                                        </td>

                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                {
                                                                                    permissions && permissions.editEmailTemplate &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button" title="Edit"
                                                                                            variant="success"
                                                                                            onClick={() => props.history.push(`/edit-user-email-templates/${item._id}`)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                                {/* {
                                                                                    permissions && permissions.deleteEmailTemplate &&
                                                                                        <li className="d-inline-block align-top">
                                                                                            <Button
                                                                                                className="btn-action btn-danger"
                                                                                                type="button" title="Delete"
                                                                                                variant="danger"
                                                                                                onClick={() => deleteUserEmailTemplate(item._id)}
                                                                                            >
                                                                                                <i className="fas fa-trash"></i>
                                                                                            </Button>
                                                                                        </li>
                                                                                } */}
                                                                            </ul>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                            :
                                                            <tr>
                                                                <td colSpan="5" className="text-center">
                                                                    <div className="alert alert-info" role="alert">No Template Found</div>
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
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({

    UserEmailTemplates: state.UserEmailTemplate,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { getUserEmailTemplates, deleteUserEmailTemplate, getRole, beforeUserEmailTemplate })(UserEmailTemplate);