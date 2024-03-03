import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeProduct, getProduct, getVariations, updateVariation, deleteVariation, addVariation } from '../Products.action';
import { ENV } from '../../../config/config';
import 'rc-pagination/assets/index.css';
import { Container, Table, OverlayTrigger, Button, Tooltip, Modal, Row, Form, Col, Card } from "react-bootstrap";
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import { currencyFormat } from 'utils/functions';
import Swal from 'sweetalert2';
import userDefaultImg from '../../../assets/img/imagePlaceholder.jpg';
import Select from 'react-select'
import validator from 'validator';


const VariationListings = (props) => {
    const [productVariations, setProductVariations] = useState([])
    const [product, setProduct] = useState([])
    const [variation, setVariation] = useState(null)
    const [variationModal, setVariationModal] = useState(false)
    const [variationAddModal, setVariationAddModal] = useState(false)
    const [newVariation, setNewVariation] = useState(null)
    const [loader, setLoader] = useState(true)

    const [msg, setMsg] = useState({
        size: "",
        color: "",
        price: "",
        image: "",
    })

    const sizeOptions = [
        {
            value: "XS",
            label: "XS"
        },
        {
            value: "S",
            label: "S"
        },
        {
            value: "M",
            label: "M"
        },
        {
            value: "L",
            label: "L"
        },
        {
            value: "XL",
            label: "XL"
        },
        {
            value: "XXL",
            label: "XXL"
        },
    ]
    useEffect(() => {
        window.scroll(0, 0)
        setLoader(true)
        const qs = ENV.objectToQueryString({ all: 1 })
        props.getVariations(props.productId)
    }, []);
    useEffect(() => {
        if (props.product.getVariationsAuth) {
            setLoader(false)
            setProductVariations(props.product.variations)
            setProduct(props.product.product)
            setNewVariation({
                productId: props.productId,
                image: "",
                price: props.product.product.price,
                size: "",
                color: "",
                colorCode: "#000000",
                status: true
            })
            props.beforeProduct()
            setLoader(false)
        }
    }, [props.product.getVariationsAuth])            // Variations Fetched

    useEffect(() => {
        if (props.product.delVariationsAuth) {
            props.getVariations(props.productId)

        }
    }, [props.product.delVariationsAuth])      // Variation Deleted

    useEffect(() => {
        if (props.product.upsertVariationsAuth) {
            setLoader(false)
            setVariationModal(false)
            setVariation(null)
            props.getVariations(props.productId)
        }
    }, [props.product.upsertVariationsAuth]);

    useEffect(() => {
        if (props.product.addVariationsAuth) {
            setLoader(false)
            setVariationAddModal(false)
            props.getVariations(props.productId)
        }
    }, [props.product.addVariationsAuth]);

    const deleteVariations = (variationId) => {
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
                props.deleteVariation(variationId)
            }
        })
    }

    const openAddModal = () => {
        
        setMsg({
            size: "",
            color: "",
            price: "",
            image: "",
        })
        setVariationAddModal(true)
    }
    const openModal = (variationId) => {
        setMsg({
            size: "",
            color: "",
            price: "",
            image: "",
        })
        let selectedVariation = productVariations.filter(function (elem) {
            return elem._id == variationId
        })
        selectedVariation[0].variationName = product.name + ' '
        let detailNameArray = selectedVariation[0].details.map((value, vIndex) => {
            if (value.title === "Color")
                selectedVariation[0].image = value.image
            return value.title + ": " + value.value
        })
        selectedVariation[0].title = product.title + ' ( ' + detailNameArray.join(', ') + " )"
        setVariation(selectedVariation[0])
        setVariationModal(true)
    }
    const handleChange = (name, value) => {
        setVariation({ ...variation, [name]: value })
    }

    const editVariation = (_id) => {
        setLoader(true)
        let check = validateEdit()
        if (check) {
            setMsg({
                size: "",
                color: "",
                price: "",
                image: "",
            })
        props.updateVariation(variation)
        }
    }
    const validateEdit = (e) => {
        let check = true
        const validationMessages = {};
        if (validator.isEmpty(String(variation.price))) {
            validationMessages.price = 'Price is required.';
            check = false
        } else {
            validationMessages.price = '';
        }
        if (validator.isEmpty(variation.image)) {
            validationMessages.image = 'Image is required.';
            check = false
        }  else if (variation.image === 'no-image') {
            validationMessages.image = 'Invalid file format. Only PNG and JPG images are allowed.';
            check = false
        }   else {
            validationMessages.image = '';
        }
        if (!validator.isEmpty(String(variation.price))) {
            if (variation.price <= 0) {
                validationMessages.price = 'Price must be greater than zero.';
                check = false
            }
           else if (!/^\d+(\.\d{1,2})?$/.test(variation.price)) {
                validationMessages.price = 'Price must have up to 2 decimal places.';
                check = false
            } else {
                validationMessages.price = '';
            }

        }
        // If there are validation errors, set them in the state and return
        if (Object.keys(validationMessages).length > 0) {
            setMsg({ ...msg, ...validationMessages });
            return check;
        }

    }

    const validate = (e) => {
        let check = true
        const validationMessages = {};
        if (validator.isEmpty(newVariation.size.trim())) {
            validationMessages.size = 'Size is required.';
            check = false
        } else {
            validationMessages.size = '';
        }

        if (validator.isEmpty(String(newVariation.price))) {
            validationMessages.price = 'Price is required.';
            check = false
        } else {
            validationMessages.price = '';
        }

        if (validator.isEmpty(newVariation.color.trim())) {
            validationMessages.color = 'Color is required.';
            check = false
        } else {
            validationMessages.color = '';
        }

        if (validator.isEmpty(newVariation.image.trim())) {
            validationMessages.image = 'Image is required.';
            check = false
        } else if (newVariation.image === 'no-image') {
                validationMessages.image = 'Invalid file format. Only PNG and JPG images are allowed.';
                check = false
        }else{
            validationMessages.image = '';
        }
        if (!validator.isEmpty(String(newVariation.price))) {
            if (newVariation.price <= 0) {
                validationMessages.price = 'Price must be greater than zero.';
                check = false
            }
           else if (!/^\d+(\.\d{1,2})?$/.test(newVariation.price)) {
                validationMessages.price = 'Price must have up to 2 decimal places.';
                check = false
            } else {
                validationMessages.price = '';
            }

        }

        // If there are validation errors, set them in the state and return
        if (Object.keys(validationMessages).length > 0) {
            setMsg({ ...msg, ...validationMessages });
            return check;
        }

    }
    const submitNewVariation = () => {
        let check = validate()
        if (check) {

            setMsg({
                size: "",
                color: "",
                price: "",
                image: "",
            })

            let payload = {
                productId: newVariation.productId,
                price: newVariation.price,
                details: [
                    {
                        title: "Color",
                        isColor: true,
                        isMeasurement: false,
                        isImage: false,
                        value: newVariation.color,
                        image: newVariation.image,
                        colorCode: newVariation.colorCode,
                        measurementScale: "",
                    },
                    {
                        title: "Size",
                        isColor: false,
                        isMeasurement: false,
                        isImage: false,
                        value: newVariation.size,
                        image: "",
                        colorCode: "",
                        measurementScale: "",
                    }
                ]
            }
            setLoader(true)
            props.addVariation(payload)
        }
    }

    const submitPic = async (e) => {
        const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
        const selectedFile = e.target.files[0];

        if (allowedFormats.includes(selectedFile.type)) {
            try {
                const res = await ENV.uploadImage(e);
                handleChange('image', res ? ENV.uploadedImgPath + res : '');

                // Clear the image validation error if it was previously set
                if (msg.image === 'Invalid file format. Only PNG and JPG images are allowed.') {
                    setMsg({ ...msg, image: '' });
                }
            } catch (error) {
                // Handle the error, if necessary
            }
        }else{
            handleChange('image', 'no-image');
            setMsg({ ...msg, image: 'Invalid file format. Only PNG and JPG images are allowed.' });
        }
    }
    const submitAddPic = async (e) => {
        const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
        const selectedFile = e.target.files[0];

        if (allowedFormats.includes(selectedFile.type)) {
            try {
                const res = await ENV.uploadImage(e);
                setNewVariation({ ...newVariation, image: res ? ENV.uploadedImgPath + res : '' })

                // Clear the image validation error if it was previously set
                if (msg.image === 'Invalid file format. Only PNG and JPG images are allowed.') {
                    setMsg({ ...msg, image: '' });
                }
            } catch (error) {
                // Handle the error, if necessary
            }
        }else{
            handleChange('image', 'no-image');
            setMsg({ ...msg, image: 'Invalid file format. Only PNG and JPG images are allowed.' });
        }
    }
    const handleKeyDown = (e) => {
        // Prevent the input if the key pressed is a decimal point
        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' ) {
          e.preventDefault();
        }
      };


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

                                        <div className="d-block d-md-flex align-items-center justify-content-between">
                                            <Card.Title as="h4">Variations</Card.Title>


                                            <Button
                                                variant="info"
                                                className="float-sm-right"
                                                onClick={() => openAddModal()}>
                                                Add Variation
                                            </Button>

                                        </div>
                                    </Card.Header>
                                    <Card.Body className="table-full-width">
                                        <div className="table-responsive">
                                            <Table className="table-bigboy">

                                                <thead>
                                                    <tr>
                                                        <th className="text-center serial-col">#</th>
                                                        <th className="text-center">Variation Name</th>
                                                        <th className="text-center">Price</th>
                                                        <th className="text-center">Status</th>
                                                        <th className="td-actions text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        productVariations && productVariations.length ?
                                                            productVariations.map((item, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td className="text-center serial-col">{index + 1}</td>
                                                                        <td className="text-center">
                                                                            {product.title} &nbsp;

                                                                            (
                                                                            {
                                                                                item.details.map((value, vIndex) => {
                                                                                    return (
                                                                                        <> <strong>{value.title}:</strong> {value.value} </>
                                                                                    )
                                                                                })
                                                                            }
                                                                            )

                                                                        </td>
                                                                        <td className="text-center">{currencyFormat(item.price)}</td>
                                                                        <td className="text-center td-actions">
                                                                            <span className={` status ${item.status ? `bg-success` : `bg-danger`
                                                                                }`}>
                                                                                <span className='lable lable-success'> {item.status ? 'Active' : 'Inactive'}</span>
                                                                            </span>
                                                                        </td>
                                                                        <td className="td-actions text-center">
                                                                            <ul className="list-unstyled mb-0">
                                                                                <li className="d-inline-block align-top">
                                                                                    <a
                                                                                        className="btn-action btn-warning"
                                                                                        type="button"
                                                                                        variant="info" title="Edit"
                                                                                        onClick={() => openModal(item._id)}
                                                                                    >
                                                                                        <i className="fas fa-edit"></i>
                                                                                    </a>
                                                                                </li>

                                                                                <li className="d-inline-block align-top">
                                                                                    <Button
                                                                                        className="btn-action btn-danger"
                                                                                        type="button"
                                                                                        variant="danger" title="Delete"
                                                                                        onClick={() => deleteVariations(item._id)}
                                                                                    >
                                                                                        <i className="fas fa-trash"></i>
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
                                                                    <div className="alert alert-info" role="alert">No Product Variation Found</div>
                                                                </td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                            {
                                                variationModal && variation &&
                                                <Modal className="modal-primary" onHide={() => setVariationModal(!variationModal)} show={variationModal}>
                                                    <Modal.Header className="justify-content-center">
                                                        <Row>
                                                            <div className="col-12">
                                                                <h4 className="mb-0 mb-md-3 mt-0">
                                                                Edit Product Variation
                                                                </h4>
                                                            </div>
                                                        </Row>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <Form className="text-left">
                                                            <Form.Group>
                                                                <label>Variation Name <span className="text-danger"> *</span></label>
                                                                <Form.Control
                                                                    disabled={true}
                                                                    type="text"
                                                                    name=""
                                                                    value={variation.title}
                                                                />
                                                            </Form.Group>
                                                            <Form.Group>
                                                                <label>Price ($) <span className="text-danger"> *</span></label>
                                                                <Form.Control
                                                                    type="number"
                                                                    
                                                                    name=""
                                    
                                                                    onChange={(e) => {
                                                                        if (e.target.value > 0) {
                                                                            handleChange('price' , e.target.value)
                                                                        } else {
                                                                            handleChange('price' , '')
                                                                        }
                                                                    }}
                                                                    value={variation.price}
                                                                    onKeyDown={handleKeyDown}
                                                                />
                                                                    <span className={msg.price ? `` : `d-none`}>
                                                                    {<label className="pl-1 text-danger">{msg.price}</label>}
                                                                </span>
                                                            </Form.Group>

                                                            <Form.Group>

                                                                <div className='mb-2'>
                                                                    {<img className="img-thumbnail" src={variation.image ? variation.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} style={{ width: '100px' }} />}
                                                                </div>
                                                                <Form.Control
                                                                    className='text-white image-width'
                                                                    onChange={async (e) => {
                                                                        submitPic(e)
                                                                    }}
                                                                    type="file"
                                                                    accept=".png, .jpg, .jpeg"
                                                                ></Form.Control>
                                                                <small className='recommended-text'>Recommended Image Size:<br></br> 500px x 500px</small>
                                                                <br></br>
                                                                {msg.image &&
                                                                    <span className={msg.image ? `` : `d-none`}>
                                                                        <label className="pl-1 text-danger">{msg.image}</label>
                                                                    </span>
                                                                }
                                                            </Form.Group>

                                                            <Form.Group>
                                                                <Row>
                                                                    <Col md={3}>
                                                                        <label className="label-font">Status <span className="text-danger">*</span></label>
                                                                    </Col>
                                                                    <Col md={9} className="check-inline d-flex flex-wrap" >
                                                                        <label className="right-label-radio mr-3 mb-2">Active
                                                                            <input name="status" type="radio" checked={variation.status} value={variation.status} onChange={(e) => handleChange('status', true)} />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                        <label className="right-label-radio mr-3 mb-2">Inactive
                                                                            <input name="status" type="radio" checked={!variation.status} value={!variation.status} onChange={(e) => handleChange('status', false)} />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                    </Col>
                                                                </Row>
                                                            </Form.Group>

                                                        </Form>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button className="btn btn-warning" onClick={() => {
                                                            setVariationModal(!variationModal)
                                                            setVariation(null)
                                                        }}>Close</Button>
                                                        <Button className="btn btn-info" onClick={() => editVariation(variation._id)} >Update</Button>

                                                    </Modal.Footer>
                                                </Modal>
                                            }
                                            {
                                                variationAddModal &&
                                                <Modal className="modal-primary" onHide={() => setVariationAddModal(!variationAddModal)} show={variationAddModal}>
                                                    <Modal.Header className="justify-content-center">
                                                        <Row>
                                                            <div className="col-12">
                                                                <h4 className="mb-0 mb-md-3 mt-0">
                                                                    Add Product Variation
                                                                </h4>
                                                            </div>
                                                        </Row>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <Form className="text-left">
                                                            <Form.Group>
                                                                <label>Size <span className="text-danger">*</span></label>
                                                                <Select options={sizeOptions}
                                                                    onChange={(event) => { setNewVariation({ ...newVariation, size: event.value }) }}
                                                                    value={sizeOptions.filter(option => option.value === newVariation.size)}
                                                                />
                                                                <span className={msg.size ? `` : `d-none`}>
                                                                    {<label className="pl-1 text-danger">{msg.size}</label>}
                                                                </span>
                                                            </Form.Group>

                                                            <Form.Group>
                                                                <label>Color <span className="text-danger">*</span></label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name=""
                                                                    onChange={(e) => setNewVariation({ ...newVariation, color: e.target.value })}
                                                                    // onChange={(e) => handlenewVariationChange('color', e.target.value)}
                                                                    value={newVariation.color}
                                                                />
                                                                <span className={msg.color ? `` : `d-none`}>
                                                                    {<label className="pl-1 text-danger">{msg.color}</label>}
                                                                </span>
                                    
                                                            </Form.Group>

                                                            <Form.Group>
                                                                <Form.Control
                                                                    type="color"
                                                                    name=""
                                                                    onChange={(e) => setNewVariation({ ...newVariation, colorCode: e.target.value })}
                                                                    // onChange={(e) => handlenewVariationChange('colorCode', e.target.value)}
                                                                    value={newVariation.colorCode}
                                                                />
                                                            </Form.Group>


                                                            <Form.Group>
                                                                <label>Price ($) <span className="text-danger">*</span></label>
                                                                <Form.Control
                                                                    type="number"
                                                                    
                                                                    name=""
                                                                    onChange={(e) => {
                                                                        if (e.target.value > 0) {
                                                                            setNewVariation({ ...newVariation, price: e.target.value })
                                                                        } else {
                                                                            setNewVariation({ ...newVariation, price: '' })
                                                                        }
                                                                    }}
                                                    
                                                                    onKeyDown={handleKeyDown}
                                                                    value={newVariation.price}
                                                                />
                                                                <span className={msg.price ? `` : `d-none`}>
                                                                    {<label className="pl-1 text-danger">{msg.price}</label>}
                                                                </span>
                                                            </Form.Group>

                                                            <Form.Group>

                                                                <div className='mb-2'>
                                                                    {<img className="img-thumbnail" src={newVariation.image ? newVariation.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} style={{ width: '100px' }} />}
                                                                </div>
                                                                <Form.Control
                                                                    className='text-white image-width'
                                                                    onChange={async (e) => {
                                                                        submitAddPic(e)
                                                                    }}
                                                                    type="file"
                                                                    accept=".png, .jpg, .jpeg"
                                                                ></Form.Control>
                                                                <small className='recommended-text'>Recommended Image Size:<br></br> 500px x 500px</small>
                                                                <br></br>
                                                                {msg.image &&
                                                                    <span className={msg.image ? `` : `d-none`}>
                                                                        <label className="pl-1 text-danger">{msg.image}</label>
                                                                    </span>
                                                                }
                                                            </Form.Group>

                                                            <Form.Group>
                                                                <Row>
                                                                    <Col md={3}>
                                                                        <label className="label-font">Status <span className="text-danger">*</span></label>
                                                                    </Col>
                                                                    <Col md={9} className="check-inline d-flex flex-wrap" >
                                                                        <label className="right-label-radio mr-3 mb-2">Active
                                                                            <input name="status" type="radio" checked={newVariation.status} value={newVariation.status} onChange={(e) => setNewVariation({ ...newVariation, status: true })} />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                        <label className="right-label-radio mr-3 mb-2">Inactive
                                                                            <input name="status" type="radio" checked={!newVariation.status} value={!newVariation.status} onChange={(e) => setNewVariation({ ...newVariation, status: false })} />
                                                                            <span className="checkmark"></span>
                                                                        </label>
                                                                    </Col>
                                                                </Row>
                                                            </Form.Group>

                                                        </Form>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button className="btn btn-warning" onClick={() => {
                                                            setVariationAddModal(!variationAddModal)
                                                        }}>Close</Button>
                                                        <Button className="btn btn-info" onClick={() => { submitNewVariation() }}>Add</Button>

                                                    </Modal.Footer>
                                                </Modal>
                                            }
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container >

            }
        </>
    )
}

const mapStateToProps = state => ({
    product: state.product,
    error: state.error
});

export default connect(mapStateToProps, { beforeProduct, getProduct, getVariations, updateVariation, deleteVariation, addVariation })(VariationListings);