import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { beforeSizeGroup, getSizeGroups, addSizeGroup, editSizeGroup, deleteSizeGroup } from './SizeGroup.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import Pagination from 'rc-pagination';
import PaginationLimitSelector from '../Components/PaginationLimitSelector';
import 'rc-pagination/assets/index.css';
import localeInfo from 'rc-pagination/lib/locale/en_US';
import Swal from 'sweetalert2';
import { getRole } from 'views/AdminStaff/permissions/permissions.actions';
import { Button, Card, Form, Table, Container, Row, Col, Modal } from "react-bootstrap";
import { valuesToCommaSeparatedLabels } from '../../../src/utils/functions'
import Select from 'react-select'
import { Helmet } from 'react-helmet';
var CryptoJS = require("crypto-js");

const SizeGroups = (props) => {
    const [data, setData] = useState(null)
    const [pagination, setPagination] = useState(null)
    const [Page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [loader, setLoader] = useState(true)
    const [permissions, setPermissions] = useState({})
    const [sizeGroup, setSizeGroup] = useState(null)
    const [msg, setMsg] = useState({
        startingWidth: '',
        endingWidth: '',
        configurableProductPrice: '',
        typeOfSizeGroup: '',
        blackAndWhitePrice: '',
        coloredPrice: '',
        mixedPrice: '',
        bodyParts: '',
    })
    const [modal, setModal] = useState(false)
    const [modalType, setModalType] = useState(false)       // 0: Add 1: View 2: Edit

    // Define an array of options with values and labels for body part
    const options = [
        { value: 1, label: 'Left Arm' },
        { value: 2, label: 'Right Arm' },
        { value: 3, label: 'Chest' },
        { value: 4, label: 'Neck' },
        { value: 5, label: 'Back' },
        { value: 6, label: 'Left Leg' },
        { value: 7, label: 'Right Leg' },
        { value: 8, label: 'Wrist' },
    ];

    // Function to handle changes in the selected body parts
    const handleSelectChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
        setSizeGroup({ ...sizeGroup, bodyParts: selectedValues });


    }

    // Function to handle Type Of Size Group Change
    const handleTypeOfSizeGroupChange = (e) => {
        setMsg({
            blackAndWhitePrice: '',
            coloredPrice: '',
            mixedPrice: '',
            bodyParts: '',
        })

        setSizeGroup({ ...sizeGroup, typeOfSizeGroup: e.target.value })

    }


    useEffect(() => {
        window.scroll(0, 0)
        const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
        const filter = {}
        props.getSizeGroups(qs, filter)
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
    }, [props.getRoleRes])                          // Roles Fetched

    useEffect(() => {
        if (props.sizeGroups.getSizeGroupsAuth) {
            let { sizeGroups, pagination } = props.sizeGroups.sizeGroups
            setData(sizeGroups)
            setLoader(false)
            setPagination(pagination)
            setPage(pagination.page)
            setLimit(pagination.limit)
            setModal(false)
            props.beforeSizeGroup()
        }
    }, [props.sizeGroups.getSizeGroupsAuth])        // Size Groups Fetched                

    useEffect(() => {
        if (props.sizeGroups.createAuth || props.sizeGroups.editSizeGroupAuth || props.sizeGroups.delSizeGroupAuth) {
            const qs = ENV.objectToQueryString({ page: Page, limit: 10 })
            const filter = {}
            props.getSizeGroups(qs, filter)
        }
    }, [props.sizeGroups.createAuth, props.sizeGroups.editSizeGroupAuth, props.sizeGroups.delSizeGroupAuth])         // Size Group Created, Deleted

    const deleteSizeGroup = (sizeGroupId) => {
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
                props.deleteSizeGroup(sizeGroupId)
            }
        })
    }

    const onPageChange = async (page) => {
        const filter = {}
        setPage(page)
        setLoader(true)
        const qs = ENV.objectToQueryString({ page: page, limit: limit })
        props.getSizeGroups(qs, filter)
    }


    const itemsPerPageChange = (newLimit) => {
        setLimit(newLimit);
        const filter = {}
        const qs = ENV.objectToQueryString({ page: 1, limit: newLimit })
        props.getSizeGroups(qs, filter)
        setLoader(true)

    }


    const PriceComponent = (item) => {

        switch (item?.typeOfSizeGroup?.toString()) {
            case "0":
                return (
                    <>
                        <p className="m-0">Black & White: {item.blackAndWhitePrice}</p>
                        <p className="m-0">Colored: {item.coloredPrice}</p>
                        <p className="m-0">Mixed: {item.mixedPrice}</p>
                    </>
                );
            case "1":
                return (
                    <>
                        <p className="m-0">Price: {item.configurableProductPrice}</p>
                    </>
                );
            default:
                return null; // Return nothing for other cases
        }
    };


    const initialModalData = (item = null) => {

        if (item == null) {
            setSizeGroup({
                startingWidth: '',
                endingWidth: '',
                typeOfSizeGroup: '',
                configurableProductPrice: '',
                blackAndWhitePrice: '',
                coloredPrice: '',
                mixedPrice: '',
                bodyParts: [],
            })
        } else {
            setSizeGroup({
                _id: item._id,
                startingWidth: item.startingWidth,
                endingWidth: item.endingWidth,
                typeOfSizeGroup: item.typeOfSizeGroup,
                configurableProductPrice: item.configurableProductPrice,
                blackAndWhitePrice: item.blackAndWhitePrice,
                coloredPrice: item.coloredPrice,
                mixedPrice: item.mixedPrice,
                bodyParts: item.bodyParts,

            })

        }
        setMsg({
            startingWidth: '',
            endingWidth: '',
            typeOfSizeGroup: '',
            configurableProductPrice: '',
            blackAndWhitePrice: '',
            coloredPrice: '',
            mixedPrice: '',
            bodyParts: '',
        })

    }

    const setFormModal = (type, item = null) => {
        initialModalData(item)
        setModal(!modal)
        setModalType(type)
    }


    const submitForm = () => {
        const errors = {};

        // Validation for required fields
        if (!sizeGroup.startingWidth) {
            errors.startingWidth = 'Starting Width is required.';
        }

        if (!sizeGroup.endingWidth) {
            errors.endingWidth = 'Ending Width is required.';
        }

        if (!sizeGroup.typeOfSizeGroup) {
            errors.typeOfSizeGroup = 'Type of size group is required.';
        }

        if (sizeGroup.typeOfSizeGroup != "" && sizeGroup.typeOfSizeGroup != 1 && sizeGroup.typeOfSizeGroup != 2) {
            if (!sizeGroup.blackAndWhitePrice) {
                errors.blackAndWhitePrice = 'Black & White price is required.';
            }

            if (!sizeGroup.coloredPrice) {
                errors.coloredPrice = 'Colored price is required.';
            }

            if (!sizeGroup.mixedPrice) {
                errors.mixedPrice = 'Mixed price is required.';
            }


            if (sizeGroup.bodyParts.length == 0) {

                errors.bodyParts = 'Body Part is required.';
            }
        }

        if (sizeGroup.startingWidth != "" && sizeGroup.endingWidth) {
            if (parseFloat(sizeGroup.endingWidth) < parseFloat(sizeGroup.startingWidth)) {
                errors.endingWidth = `Ending width shouldn't be less than starting width`
            }
        }


        if (sizeGroup.startingWidth && sizeGroup.typeOfSizeGroup == 1) {
            if (!sizeGroup.configurableProductPrice) {
                errors.configurableProductPrice = 'Price is required.';
            }
        }



        if (sizeGroup.startingWidth) {
            if (sizeGroup.startingWidth <= 0) {
                errors.startingWidth = 'Starting Width must be greater than zero.';
            }
        }


        if (sizeGroup.endingWidth) {
            if (sizeGroup.endingWidth <= 0) {
                errors.endingWidth = 'Ending width must be greater than zero.';
            }
        }



        if (sizeGroup.typeOfSizeGroup != "" && sizeGroup.typeOfSizeGroup != 2) {
            const numericFields = ['blackAndWhitePrice', 'coloredPrice', 'mixedPrice', 'configurableProductPrice'];
            const validationMsg = ['Black & White price', 'Colored price', 'Mixed price', 'Price'];
            numericFields.forEach((field, index) => {

                if (
                    sizeGroup[field] !== undefined &&
                    sizeGroup[field] !== null &&
                    sizeGroup[field] !== ""
                ) {
                    if (sizeGroup[field] <= 0) {
                        errors[field] = `${validationMsg[index]} must be greater than zero.`;
                    } else if (field.includes('Price') && !/^\d+(\.\d{1,2})?$/.test(sizeGroup[field])) {
                        errors[field] = `${validationMsg[index]} must have up to 2 decimal places.`;
                    }
                }

            });
        }


        setMsg(errors);

        // Check if there are no errors
        const isValid = Object.keys(errors).length === 0;

        if (isValid) {
            setLoader(true)
            sizeGroup.bodyParts = Array.isArray(sizeGroup.bodyParts) ? sizeGroup.bodyParts : [];
            if (modalType === 0) {
                props.addSizeGroup({ ...sizeGroup });
            } else if (modalType === 2) {
                props.editSizeGroup({ ...sizeGroup });
            }
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
                <title>Scotani | Admin Panel | Size Group </title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container fluid>
                        <Row className="pb-3">
                            <Col md="12">
                                <Card className="table-big-boy">
                                    <Card.Header>
                                        <div className='d-flex justify-content-end mb-2 pr-3'>
                                            <span style={{ color: 'black', fontWeight: 'bold' }}>{`Total : ${pagination?.total}`}</span>
                                        </div>
                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Size Groups</Card.Title>
                                            {
                                                permissions && permissions.addSizeGroup &&
                                                <Button
                                                    variant="info"
                                                    className="float-sm-right"
                                                    onClick={() => setFormModal(0)}>
                                                    Add Size Group
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
                                                        <th className='text-center'>Starting Width</th>
                                                        <th className='text-center'>Ending Width</th>
                                                        <th className='text-center'>Type</th>
                                                        <th className='text-center'>Body Parts</th>
                                                        <th className='text-center'>Prices</th>
                                                        <th className="text-center td-actions">Actions</th>
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
                                                                            {item.startingWidth}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {item.endingWidth}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {
                                                                                {
                                                                                    "0": <span bg="warning" class="badge badge-warning">Tattoo</span>,
                                                                                    "1": <span bg="success" class="badge badge-success">Configurable Product</span>,
                                                                                    "2": <span bg="danger" class="badge badge-danger">Desire Text</span>,

                                                                                }[item?.typeOfSizeGroup?.toString()]
                                                                            }
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {item?.bodyParts?.length > 0 && valuesToCommaSeparatedLabels(item?.bodyParts, options)}
                                                                        </td>
                                                                        <td className="text-center ">
                                                                            {PriceComponent(item)}
                                                                        </td>
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                <li className="d-inline-block align-top">
                                                                                    <Button
                                                                                        className="btn-action btn-primary"
                                                                                        type="button" title="View"
                                                                                        onClick={() => setFormModal(1, item)}
                                                                                    >
                                                                                        <i className="fa fa-eye"></i>
                                                                                    </Button>
                                                                                </li>

                                                                                {
                                                                                    permissions && permissions.editSizeGroup &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-warning"
                                                                                            type="button" title="Edit"
                                                                                            variant="success"
                                                                                            onClick={() => setFormModal(2, item)}
                                                                                        >
                                                                                            <i className="fas fa-edit"></i>
                                                                                        </Button>
                                                                                    </li>
                                                                                }
                                                                                {
                                                                                    permissions && permissions.deleteSizeGroup &&
                                                                                    <li className="d-inline-block align-top">
                                                                                        <Button
                                                                                            className="btn-action btn-danger"
                                                                                            type="button"
                                                                                            variant="danger" title="Delete"
                                                                                            onClick={() => deleteSizeGroup(item._id)}
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
                                                                    <div className="alert alert-info" role="alert">No Size Group Found</div>
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
                            modal &&
                            <Modal className="modal-primary role-modal" id="content-Modal" onHide={() => setModal(!modal)} show={modal}>
                                <Modal.Header className="justify-content-center">
                                    <Row>
                                        <div className="col-12">
                                            <h4 className="mb-0 mb-md-3 mt-0">
                                                {modalType == 0 ? "Add" : modalType == 2 ? "Edit" : "View"} Size Group
                                            </h4>
                                        </div>
                                    </Row>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Starting Width <span className="text-danger">*</span></label>
                                                    {modalType == 1 ?
                                                        <Form.Control
                                                            readOnly
                                                            type="number"
                                                            value={sizeGroup.startingWidth}

                                                        />
                                                        :
                                                        <>
                                                            <Form.Control
                                                                type="number"
                                                                value={sizeGroup.startingWidth}
                                                                onChange={(event) => setSizeGroup({ ...sizeGroup, startingWidth: event.target.value })}
                                                                onInput={() => setMsg((prevMsg) => ({ ...prevMsg, startingWidth: '' }))}
                                                                min={0}
                                                                onKeyDown={e => ["e", "E", "-", "."].includes(e.key) && e.preventDefault()}
                                                            />
                                                            <span className={msg.startingWidth ? `` : `d-none`}>
                                                                <small className="pl-1 text-danger">{msg.startingWidth}</small>
                                                            </span>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>Ending Width <span className="text-danger">*</span></label>
                                                    {modalType == 1 ?
                                                        <Form.Control
                                                            readOnly
                                                            type="number"
                                                            value={sizeGroup.endingWidth}
                                                        />
                                                        :
                                                        <>
                                                            <Form.Control
                                                                type="number"
                                                                value={sizeGroup.endingWidth}
                                                                onChange={(event) => setSizeGroup({ ...sizeGroup, endingWidth: event.target.value })}
                                                                onInput={() => setMsg((prevMsg) => ({ ...prevMsg, endingWidth: '' }))}
                                                                onKeyDown={e => ["e", "E", "-", "."].includes(e.key) && e.preventDefault()}
                                                                min={0}
                                                            />
                                                            <span className={msg.endingWidth ? `` : `d-none`}>
                                                                <small className="pl-1 text-danger">{msg.endingWidth}</small>
                                                            </span>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <label>Type Of Size Group <span className="text-danger">*</span></label>
                                                    {modalType == 1 ?

                                                        <select value={sizeGroup.typeOfSizeGroup} disabled >
                                                            <option value="">Select Type Of Size Group</option>
                                                            <option value={0}>Tattoo</option>
                                                            <option value={1}>Configurable Product</option>
                                                            <option value={2}>Desire Text </option>

                                                        </select>

                                                        :
                                                        <>
                                                            <select value={sizeGroup.typeOfSizeGroup} onChange={handleTypeOfSizeGroupChange}>
                                                                <option value="">Select Type Of Size Group</option>
                                                                <option value={0}>Tattoo</option>
                                                                <option value={1}>Configurable Product</option>
                                                                <option value={2}>Desire Text </option>

                                                            </select>
                                                            <span className={msg.typeOfSizeGroup ? `` : `d-none`}>
                                                                <small className="pl-1 text-danger">{msg.typeOfSizeGroup}</small>
                                                            </span>
                                                        </>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            {(sizeGroup.typeOfSizeGroup != "" && sizeGroup.typeOfSizeGroup == 0) && (
                                                <>

                                                    <Col md={12}>
                                                        <Form.Group>
                                                            <label>Body Parts <span className="text-danger">*</span></label>
                                                            {modalType == 1 ?
                                                                <p>
                                                                    <label>{sizeGroup?.bodyParts?.length > 0 && valuesToCommaSeparatedLabels(sizeGroup.bodyParts, options)}</label>
                                                                </p>
                                                                :
                                                                <>
                                                                    <Select
                                                                        className="modal-select-wrapper"
                                                                        isMulti
                                                                        options={options}
                                                                        value={
                                                                            Array.isArray(sizeGroup?.bodyParts) ?
                                                                                sizeGroup.bodyParts.map((value) => options.find((option) => option.value === value))
                                                                                : []}
                                                                        onChange={handleSelectChange}
                                                                    />
                                                                    <span className={msg.bodyParts ? `` : `d-none`}>
                                                                        <small className="pl-1 text-danger">{msg.bodyParts}</small>
                                                                    </span>
                                                                </>
                                                            }
                                                        </Form.Group>
                                                    </Col>

                                                    <Col md={12}>
                                                        <h4 style={{ "color": "white" }}>Prices <span className="text-danger">*</span></h4>
                                                        <Form.Group>
                                                            <label>Black & White <span className="text-danger">*</span></label>
                                                            {modalType == 1 ?
                                                                <Form.Control
                                                                    readOnly
                                                                    type="number"
                                                                    value={sizeGroup.blackAndWhitePrice}
                                                                />
                                                                :
                                                                <>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={sizeGroup.blackAndWhitePrice}
                                                                        onChange={(event) => setSizeGroup({ ...sizeGroup, blackAndWhitePrice: event.target.value })}
                                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, blackAndWhitePrice: '' }))}
                                                                        min={0}
                                                                    />
                                                                    <span className={msg.blackAndWhitePrice ? `` : `d-none`}>
                                                                        <small className="pl-1 text-danger">{msg.blackAndWhitePrice}</small>
                                                                    </span>
                                                                </>
                                                            }
                                                            <br /><label>Colored <span className="text-danger">*</span></label>
                                                            {modalType == 1 ?
                                                                <Form.Control
                                                                    readOnly
                                                                    type="number"
                                                                    value={sizeGroup.coloredPrice}
                                                                />
                                                                :
                                                                <>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={sizeGroup.coloredPrice}
                                                                        onChange={(event) => setSizeGroup({ ...sizeGroup, coloredPrice: event.target.value })}
                                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, coloredPrice: '' }))}
                                                                        min={0}
                                                                    />
                                                                    <span className={msg.coloredPrice ? `` : `d-none`}>
                                                                        <small className="pl-1 text-danger">{msg.coloredPrice}</small>
                                                                    </span>
                                                                </>
                                                            }
                                                            <br /><label>Mixed <span className="text-danger">*</span></label>
                                                            {modalType == 1 ?
                                                                <Form.Control
                                                                    readOnly
                                                                    type="number"
                                                                    value={sizeGroup.mixedPrice}
                                                                />
                                                                :
                                                                <>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={sizeGroup.mixedPrice}
                                                                        onChange={(event) => setSizeGroup({ ...sizeGroup, mixedPrice: event.target.value })}
                                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, mixedPrice: '' }))}
                                                                        min={0}
                                                                    />
                                                                    <span className={msg.mixedPrice ? '' : `d-none`}>
                                                                        <small className="pl-1 text-danger">{msg.mixedPrice}</small>
                                                                    </span>
                                                                </>
                                                            }
                                                        </Form.Group>
                                                    </Col>



                                                </>
                                            )}
                                            {(sizeGroup.typeOfSizeGroup != "" && sizeGroup.typeOfSizeGroup == 1) && (
                                                <>
                                                    <Col md={12}>
                                                        <h4 style={{ "color": "white" }}>Prices <span className="text-danger">*</span></h4>
                                                        <Form.Group>
                                                            <label>Price <span className="text-danger">*</span></label>
                                                            {modalType == 1 ?
                                                                <Form.Control
                                                                    readOnly
                                                                    type="number"
                                                                    value={sizeGroup.configurableProductPrice}
                                                                />
                                                                :
                                                                <>
                                                                    <Form.Control
                                                                        type="number"
                                                                        value={sizeGroup.configurableProductPrice}
                                                                        onChange={(event) => setSizeGroup({ ...sizeGroup, configurableProductPrice: event.target.value })}
                                                                        onInput={() => setMsg((prevMsg) => ({ ...prevMsg, configurableProductPrice: '' }))}
                                                                        min={0}
                                                                    />
                                                                    <span className={msg.configurableProductPrice ? `` : `d-none`}>
                                                                        <small className="pl-1 text-danger">{msg.configurableProductPrice}</small>
                                                                    </span>
                                                                </>
                                                            }

                                                        </Form.Group>
                                                    </Col>


                                                </>
                                            )}
                                        </Row>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                    {modalType != 1 && <Button className="btn btn-success" onClick={() => submitForm()}>{modalType == 0 ? "Add" : "Update"}</Button>}
                                    <Button className="btn btn-danger" onClick={() => setModal(!modal)}>Close</Button>
                                </Modal.Footer>
                            </Modal>
                        }
                    </Container>
            }
        </>
    )
}

const mapStateToProps = state => ({
    sizeGroups: state.sizeGroups,
    error: state.error,
    getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforeSizeGroup, getSizeGroups, addSizeGroup, editSizeGroup, deleteSizeGroup, getRole })(SizeGroups);