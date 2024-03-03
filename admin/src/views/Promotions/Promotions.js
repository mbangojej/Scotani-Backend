import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforePromotion, getPromotions, deletePromotion, downloadPromotionReport } from './Promotions.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import Pagination from 'rc-pagination';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
var CryptoJS = require("crypto-js");
import { Helmet } from 'react-helmet';

const Promotion = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [searchName, setSearchName] = useState('')
    const [searchCode, setSearchCode] = useState('')
    const [searchStatus, setSearchStatus] = useState('')


    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
        const filter = {}
        if (searchName !== undefined && searchName !== null && searchName !== '')
            filter.name = searchName
        if (searchStatus !== undefined && searchStatus !== null && searchStatus !== '')
            filter.isActive = searchStatus === 'true' ? true : false
        if (searchCode !== undefined && searchCode !== null && searchCode !== '')
            filter.promotionCode = searchCode

        props.getPromotions(qs, filter)
        let roleEncrypted = localStorage.getItem('role');
        let role = ''
        if (roleEncrypted) {
            let roleDecrypted = CryptoJS.AES.decrypt(roleEncrypted, 'skincanvas123#key').toString(CryptoJS.enc.Utf8);
            role = roleDecrypted
        }
        props.getRole(role)
    }, [])
    const downloadPromotionReport = () => {
        props.downloadPromotionReport();
    }
    useEffect(() => {
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    }, [props.getRoleRes])
    useEffect(() => {
        if (props.promotion.promotionReportAuth) {
            let fileName = props.promotion.fileName
            fileName = ENV.reportPath + fileName
            const link = document.createElement('a');
            link.href = fileName;
            link.download = fileName;
            // Simulate a click event on the link
            link.click();
            props.beforePromotion()
        }
    }, [props.promotion.promotionReportAuth])
    useEffect(() => {
        if (props.promotion.getPromotionsAuth) {
            let { promotions, pagination } = props.promotion.promotions
            setData(promotions)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            props.beforePromotion()
        }
    }, [props.promotion.getPromotionsAuth])

    useEffect(() => {
        if (data) {
            setLoader(false)
        }
    }, [data])

    useEffect(() => {
        if (props.promotion.delPromotionAuth) {
            let filtered = data.filter((item) => {
                if (item._id !== props.promotion.promotion.promotionId)
                    return item
            })
            setData(filtered)
            const filter = {}
            if (searchName && searchName !== '') {
                filter.name = searchName
            }
            if (searchStatus !== '') {
                filter.isActive = searchStatus === 'true' ? true : false
            }
            if (searchCode !== undefined && searchCode !== null && searchCode !== '')
                filter.promotionCode = searchCode
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            props.getPromotions(qs, filter)
            props.beforePromotion()
        }
    }, [props.promotion.delPromotionAuth])

    const deletePromotion = (promotionId) => {
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
                props.deletePromotion(promotionId)
            }
        })
    }

    const onPageChange = async (page) => {
        const filter = {}
        if (searchName && searchName !== '') {
            filter.name = searchName
        }
        if (searchStatus !== '') {
            filter.isActive = searchStatus === 'true' ? true : false
        }
        if (searchCode !== undefined && searchCode !== null && searchCode !== '')
            filter.promotionCode = searchCode
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getPromotions(qs, filter)
    }



    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        if (searchName && searchName !== '') {
            filter.name = searchName
        }
        if (searchStatus !== '') {
            filter.isActive = searchStatus === 'true' ? true : false
        }
        if (searchCode !== undefined && searchCode !== null && searchCode !== '')
            filter.promotionCode = searchCode

        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getPromotions(qs, filter)
        setLoader(true)

    }



    const applyFilters = () => {
        const filter = {}
        if (searchName && searchName !== '') {
            filter.name = searchName
        }
        if (searchStatus !== '') {
            filter.isActive = searchStatus === 'true' ? true : false
        }
        if (searchCode !== undefined && searchCode !== null && searchCode !== '')
            filter.promotionCode = searchCode
        setPage(1)
        const qs = ENV.objectToQueryString({ page: 1, limit: limit })
        props.getPromotions(qs, filter)
        setLoader(true)
    }

    const reset = () => {
        setSearchName('')
        setSearchStatus('')
        setSearchCode('')
        setPage(1)
        setLimit(10);
        const qs = ENV.objectToQueryString({ page: 1, limit: 10 })
        props.getPromotions(qs)
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
            <title>Scotani | Admin Panel | Promotion </title>
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
                                            {/* <p className="card-collection">List of Auctions</p> */}
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Promotion Name</label>
                                                    <Form.Control onKeyPress={handleKeyPress} type="text" value={searchName} placeholder="Name" onChange={(e) => setSearchName(e.target.value)} /*onKeyDown={} */ />
                                                </Form.Group>
                                            </Col>
                                            <Col xl={3} sm={6}>
                                                <Form.Group>
                                                    <label style={{ color: 'black' }}>Promotion Code</label>
                                                    <Form.Control onKeyPress={handleKeyPress} type="text" value={searchCode} placeholder="Name" onChange={(e) => setSearchCode(e.target.value)} /*onKeyDown={} */ />
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
                                                        <Button variant="info" disabled={!searchName && !searchCode && !searchStatus} onClick={applyFilters}>Search</Button>
                                                        <Button variant="warning" hidden={!searchName && !searchCode && !searchStatus} onClick={reset}>Reset</Button>
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
                                            <Card.Title as="h4">Promotions</Card.Title>
                                            <div>
                                                {
                                                    permissions && permissions.addPromotion &&
                                                    <Button
                                                        variant="info"
                                                        className="mr-3"
                                                        onClick={() => props.history.push(`/add-promotion`)}>
                                                        Add Promotion
                                                    </Button>
                                                }

                                            </div>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className='text-center td-actions'>Name</th>
                                                        <th className='text-center td-actions'>Code</th>
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
                                                                        <td className="text-center td-actions">
                                                                            {item.name}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            {item.promotionCode}
                                                                        </td>
                                                                        <td className="text-center td-actions">
                                                                            <span className={` status ${item.isActive ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {item.isActive ? 'Active' : 'Inactive'}</span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                {
                                                                                    permissions && permissions.editPromotion &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button"
                                                                                            variant="success" title="Edit"
                                                                                            onClick={() => props.history.push(`/edit-promotion/${item._id}`)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                                {
                                                                                    permissions && permissions.deletePromotion &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-danger"
                                                                                            type="button" title="Delete"
                                                                                            variant="danger"
                                                                                            onClick={() => deletePromotion(item._id)}
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
                                                                    <div className="alert alert-info" role="alert">No Promotion Found </div>
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
    promotion: state.promotion,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforePromotion, getPromotions, deletePromotion, getRole, downloadPromotionReport })(Promotion);