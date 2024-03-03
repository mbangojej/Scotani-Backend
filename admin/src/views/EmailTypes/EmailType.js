;import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeEmailType, deleteEmailType, getEmailTypes } from './EmailType.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip, Modal } from "react-bootstrap";

const EmailType = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page , setPage] = useState(1)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [searchTitle, setSearchTitle] = useState(localStorage.getItem('faqTitle') !== undefined && localStorage.getItem('faqTitle') !== null? localStorage.getItem('faqTitle') : '')
   
    useEffect(()=> {
        props.getEmailTypes()
    }, [])

    useEffect(()=> {
        if(props.EmailType.getEmailTypesAuth) {
            const {emailTemplate, pagination} =  props.EmailType.emailTypes
            setPagination(pagination)
            setData(emailTemplate)
        }
    }, [props.EmailType.getEmailTypesAuth, props.EmailType.emailTypes])
    

    useEffect(()=>{
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    },[props.getRoleRes])

    useEffect(() =>{
        if(data){
            setLoader(false)
        }
    }, [data])

    useEffect(()=>{
        if(props.EmailType.delEmailTypeAuth){
            let filtered = data.filter((item) => {
                if (item._id !== props.EmailType.emailType.languageId)
                    return item
            })
            setData(filtered)
            const filter = {}
            if(searchTitle && searchTitle !== ''){
                filter.name = searchTitle
                localStorage.setItem('faqTitle', searchTitle)
            }
            const qs = ENV.objectToQueryString({page : Page , limit : 10})
            props.getEmailTypes(qs , filter)          
            props.beforeEmailType()
        }
    }, [props.EmailType.delEmailTypeAuth])

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
                props.deleteEmailType(faqId)
            }
        })
    }

    const onPageChange = async (page) => {
        const filter = {}
        if(searchTitle && searchTitle !== ''){
            filter.title = searchTitle
            localStorage.setItem('faqTitle', searchTitle)
        }
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page , limit :10 })
        props.getEmailTypes(qs,filter)
    }

    const applyFilters = () =>{
        const filter = {}
        if(searchTitle && searchTitle !== ''){
            filter.title = searchTitle
            localStorage.setItem('faqTitle', searchTitle)
        }
        setPage(1)
        const qs = ENV.objectToQueryString({ page : 1, limit: 10 })
        props.getEmailTypes(qs, filter)
        setLoader(true)
    }

    const reset = () =>{
        setSearchTitle('')
        setPage(1)
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getEmailTypes(qs)
        setLoader(true)
        localStorage.setItem('faqTitle', '')
    }

    return (
        <>
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
                                            {/* <p className="card-collection">List of Auctions</p> */}
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{color : 'black'}}>Name</label>
                                                    <Form.Control type="text" value ={searchTitle} placeholder="Title" onChange={(e) => setSearchTitle(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>                                                    
                                            </Col>
                                
                                            
                                            <Col xl={3} sm={6}>
                                                <Form.Group className='btnGroup'>
                                                    <Form.Label className="d-block">&nbsp;</Form.Label>
                                                    <div className="d-flex filter-btns-holder">
                                                        <Button variant="info"  disabled={!searchTitle } onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchTitle } onClick={reset}>Reset</Button>
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
                                    <span  style={{ color: 'white',fontWeight:'bold' }}>{`Total : ${pagination?.total}`}</span>
                                    </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Email Types</Card.Title>
                                            {/* <p className="card-category">List of FAQs</p> */}
                                            {
                                                permissions && permissions.addEmailTemplate && 
                                                    <Button
                                                        variant="info"
                                                        className="float-sm-right"
                                                        onClick={() => props.history.push(`/add-email-type`)}>
                                                        Add Email Type
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
                                                        <th className='text-center td-actions'>Title</th>
                                                    
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
                                                
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                {
                                                                                    permissions && permissions.editEmailType && 
                                                                                        <li className="d-inline-block align-top">
                                                                                            <Button
                                                                                                className="btn-action btn-warning"
                                                                                                type="button"
                                                                                                variant="success" title="Eit"
                                                                                                onClick={() => props.history.push(`/edit-email-type/${item._id}`)}
                                                                                            >
                                                                                                <i className="fas fa-edit"></i>
                                                                                            </Button>
                                                                                        </li>
                                                                                }
                                                                                {
                                                                                    permissions && permissions.deleteEmailType &&
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
                                                                                }
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
                                                <Pagination
                                                    className="m-3"
                                                    defaultCurrent={1}
                                                    pageSize // items per page
                                                    current={Page > pagination.pages ? pagination.pages :  Page} // current active page
                                                    total={pagination.pages} // total pages
                                                    onChange={onPageChange}
                                                    locale={localeInfo}
                                                />
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

    EmailType: state.EmailType,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { getEmailTypes, deleteEmailType, getRole, beforeEmailType })(EmailType);