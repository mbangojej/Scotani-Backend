import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { beforeProduct, updateProduct, getProduct } from './Products.action';
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import 'rc-pagination/assets/index.css';
import { Button, Card, Form, Container, Row, Col, Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import userDefaultImg from '../../assets/img/imagePlaceholder.jpg';
import { ENV } from '../../config/config';
import validator from 'validator';
import VariationListings from './Variations/VariationListings';
import Select from 'react-select'
import { getCategories } from './Category/Category.action';
import TinyMCE from '../../components/tinyMce/tinyMCE'
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';

const EditProduct = (props) => {
    const [loader, setLoader] = useState(true)
    const [categories, setCategories] = useState(null)
    const [data, setData] = useState({
        title: "",
        category: "",
        price: "",
        type: "",
        shortDescription: "",
        image: "",
        status: true,
        isFeatured: false,
        images: [],
    })

    const typeOptions = [
        {
            value: 0,
            label: "Inspiration"
        },
        {
            value: 1,
            label: "Discover"
        },
        {
            value: 2,
            label: "Tattoos"
        },
        {
            value: 3,
            label: "Configurable Product"
        },
        {
            value: 4,
            label: "Fashion"
        },
    ]
    const [attributes, setAttributes] = useState([])
    const [msg, setMsg] = useState({
        title: "",
        type: "",
        price: "",
        category: "",
        shortDescription: "",
        image: "",
        status: "",
        images:[]
    })
    useEffect(() => {
        window.scroll(0, 0)
        props.getProduct(window.location.pathname.split('/')[3])

        const qs = ENV.objectToQueryString({ all: 1 })
        const filter = {}

        props.getCategories(qs, filter)

    }, [])


    useEffect(() => {
        if (props.product.getProductAuth) {
            const {
                title,
                price,
                shortDescription,
                image,
                category,
                type,
                status,
                isFeatured,
                attributes,
                images
            } = props.product.getProduct.product
            setData({
                title,
                price,
                shortDescription,
                image,
                category,
                type,
                status,
                isFeatured,
                images,
                _id: window.location.pathname.split('/')[3]
            })

            setAttributes(attributes)
            setLoader(false)
        }
        console.log(props.product.getProduct)
    }, [props.product.getProductAuth])
    useEffect(() => {
        if (props.category.getCategoriesAuth) {
            let { categories } = props.category.categories
            let options = []
            categories.map((cate) => {
                options.push({
                    label: cate.name,
                    value: cate._id,
                })
            })
            setCategories(options)
        }
    }, [props.category.getCategoriesAuth])
    useEffect(() => {
        if (props.product.editProductAuth) {
            props.beforeProduct()
            setLoader(false)
            props.history.push(`/products`)
        }
    }, [props.product.editProductAuth])

    useEffect(() => {
        if (props.product.existProductAuth) {
            setMsg({ ...msg, title: "Product name already exist" })
            setLoader(false)
            props.beforeProduct()
        }
    }, [props.product.existProductAuth])


    /**Update 15-09-2023 
  * Add image upload function for validation before upload image on server
  ***/
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
        } else {
            toast.warning("Invalid image format")
            setData({ ...data, image: 'no-image' })
            setMsg({ ...msg, image: 'Invalid file format. Only PNG and JPG images are allowed.' });
        }
    };


    const updateProduct = () => {

        /**Update 15-09-2023 
        * Update Validation to fix image issue and show proper msg
         ***/

        const validationMessages = {};


        if (validator.isEmpty(data.title.trim())) {
            validationMessages.title = 'Product name is required.';
        }

        if ((validator.isEmpty(String(data.type)) || data.type === 0) && (validator.isEmpty(String(data.price)) || data.price === null)) {
            validationMessages.price = 'Product price is required.';
        }

        if (categories != null && validator.isEmpty(data.category)) {
            validationMessages.category = 'Caregory is required.';
        }

        if (validator.isEmpty(String(data.type))) {
            validationMessages.type = 'Product type is required.';
        }

        if (validator.isEmpty(data.image)) {
            validationMessages.image = 'Product image is required.';
        }

        if (data.image === 'no-image') {
            validationMessages.image = 'Invalid file format. Only PNG and JPG images are allowed.';
        }


        if (data.price) {
            if (data.price <= 0) {
                validationMessages.price = `Price must be greater than zero.`;
            } else if (!/^\d+(\.\d{1,2})?$/.test(data.price)) {
                validationMessages.price = `Price must have up to 2 decimal.`;
            }
        }


        // // If there are validation errors, set them in the state and return
        if (Object.keys(validationMessages).length > 0) {
            setMsg({ ...msg, ...validationMessages });
            return;
        }


        if (!validator.isEmpty(data.image) && !validator.isEmpty(data.title) && !validator.isEmpty(String(data.price)) && data.price != null) {
            setLoader(true)
            let payload = {
                _id: window.location.pathname.split('/')[3],
                title: data.title,
                price: data.price,
                shortDescription: data.shortDescription,
                image: data.image,
                category: data.category,
                isFeatured: data.isFeatured,
                type: data.type,
                attributes: data.type == 3 ? attributes : [],
                status: data.status
            }
            props.updateProduct(payload)
        }
    }

    const handleChange = (name, value) => {
        setData({ ...data, [name]: value })
        setMsg({ ...msg, [name]: '' })
    }


    return (
        <>
            <Helmet>
                <title>Scotani | Admin Panel | Update Product</title>
            </Helmet>
            {
                loader ?
                    <FullPageLoader />
                    :
                    <Container>
                        <Row>
                            <Col md="12">
                                <Card className="pb-3 table-big-boy">
                                    <Card.Header>
                                        <Card.Title as="h4">Edit Product</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Row>
                                            <Col md={6}>
                                                <Row>
                                                    <Col md="12">
                                                        <Form.Group>
                                                            <label>Product Name<span className="text-danger"> *</span></label>
                                                            <Form.Control
                                                                value={data.title ? data.title : ''}
                                                                onChange={(e) => handleChange('title', e.target.value)}
                                                                placeholder="Product Name"
                                                                type="text"
                                                            ></Form.Control>
                                                            <span className={msg.title ? `` : `d-none`}>
                                                                {<label className="pl-1 text-danger">{msg.title}</label>}
                                                            </span>
                                                        </Form.Group>
                                                    </Col>
                                                    {/* {categories != null && data.type && data.type == 3 && */}
                                                    {categories != null &&
                                                        <Col md="12">
                                                            <Form.Group>
                                                                <label>Category<span className="text-danger"> *</span></label>
                                                                <Select styles={{ menu: provided => ({ ...provided, zIndex: 999999 }) }} options={categories}
                                                                    onChange={(option) => setData({ ...data, category: option.value })}
                                                                    value={categories.filter(option => option.value === data.category)}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    }

                                                    <Col md="12">
                                                        <Form.Group>
                                                            <label>Product Price ($)<span className="text-danger"> *</span></label>
                                                            <Form.Control
                                                                value={data.price ? data.price : ''}
                                                                onChange={(e) => {
                                                                    handleChange('price', e.target.value)
                                                                }}
                                                                onKeyDown={e => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                                                placeholder="Sales Price"
                                                                type="number"
                                                            ></Form.Control>
                                                            <span className={msg.price ? `` : `d-none`}>
                                                                {<label className="pl-1 text-danger">{msg.price}</label>}
                                                            </span>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md="12">
                                                        <Form.Group>
                                                            <label>Product Type<span className="text-danger"> *</span></label>
                                                            <Select styles={{ menu: provided => ({ ...provided, zIndex: 999999 }) }} options={typeOptions}
                                                                onChange={(option) => handleChange('type', option.value)}
                                                                value={typeOptions.filter(option => option.value === data.type)}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col md={6}>
                                                <Row>
                                                    <Col md="6">
                                                        <Form.Group className='product-file-wrapper'>
                                                            <label>Product Image<span className="text-danger"> *</span></label>
                                                            <div className='mb-2'>
                                                                {<img className="img-thumbnail" src={data.image ? data.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} style={{ width: '100px' }} />}
                                                            </div>
                                                            <Form.Control
                                                                className='text-white'
                                                                onChange={async (e) => {
                                                                    // fileSelectHandler(e);
                                                                    // const res = await ENV.uploadImage(e);
                                                                    // handleChange('image', res ? ENV.uploadedImgPath + res : "")
                                                                    submitPic(e)
                                                                }}
                                                                type="file"
                                                                accept=".png, .jpg, .jpeg"
                                                            ></Form.Control>
                                                            <small>Recommended Image Size:<br></br> 500px x 500px</small>
                                                            <br></br>
                                                            {msg.image &&
                                                                <span className={msg.image ? `` : `d-none`}>
                                                                    <label className="pl-1 text-danger">{msg.image}</label>
                                                                </span>
                                                            }

                                                        </Form.Group>

                                                        {/* multiple images handle */}
                                                        <Form.Group className="product-files-wrapper">
                                                            <label>
                                                                Products Images
                                                                <span className="text-danger"> *</span>
                                                            </label>
                                                            <div className="mb-2">
                                                                {/* Display selected images */}
                                                                {data.images?.map((image, index) => (
                                                                    <img
                                                                        key={index}
                                                                        className="img-thumbnail"
                                                                        src={image ? image : userDefaultImg}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = userDefaultImg;
                                                                        }}
                                                                        style={{ width: "100px", marginRight: "5px" }}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <Form.Control
                                                                className="text-white "
                                                                onChange={(e) => {
                                                                    submitMultiplePic(e);
                                                                }}
                                                                type="file"
                                                                accept=".png, .jpg, .jpeg"
                                                                multiple  // Allow multiple file selection
                                                            ></Form.Control>
                                                            <small>
                                                                Recommended Image Size:<br></br> 500px x 500px
                                                            </small>
                                                            <br></br>
                                                            {msg.images && (
                                                                <span className={msg.images ? `` : `d-none`}>
                                                                    <label className="pl-1 text-danger">{msg.images}</label>
                                                                </span>
                                                            )}

                                                        </Form.Group>

                                                    </Col>


                                                    <Col md="3">
                                                        <Form.Group>
                                                            <label className='mr-2'>Status <span className="text-danger"> *</span></label>
                                                            <label className="right-label-radio mb-2 mr-2">
                                                                <div className='d-flex align-items-center'>
                                                                    <input name="status" type="radio" checked={data.status} value={data.status} onChange={(e) => { handleChange('status', true) }} />
                                                                    <span className="checkmark black-checkmark"></span>
                                                                    <span className='ml-1' onChange={(e) => {
                                                                        handleChange('status', true)
                                                                    }} ><i />Active</span>
                                                                </div>
                                                            </label>
                                                            <label className="right-label-radio mr-3 mb-2">
                                                                <div className='d-flex align-items-center'>
                                                                    <input name="status" type="radio" checked={!data.status} value={!data.status} onChange={(e) => { handleChange('status', false) }} />
                                                                    <span className="checkmark black-checkmark"></span>
                                                                    <span className='ml-1' onChange={(e) => {
                                                                        handleChange('status', false)
                                                                    }} ><i />Inactive</span>
                                                                </div>
                                                            </label>
                                                        </Form.Group>
                                                        {/* <Form.Group>
                                                            <label className='mr-2'>Is Featured</label>
                                                            <label className="right-label-radio mb-2 mr-2">
                                                                <div className='d-flex align-items-center'>
                                                                    <input name="isFeatured" type="radio" checked={data.isFeatured} value={data.isFeatured} onChange={(e) => { handleChange('isFeatured', true) }} />
                                                                    <span className="checkmark black-checkmark"></span>
                                                                    <span className='ml-1' onChange={(e) => {
                                                                        handleChange('isFeatured', true)
                                                                    }} ><i />Yes</span>
                                                                </div>
                                                            </label>
                                                            <label className="right-label-radio mr-3 mb-2">
                                                                <div className='d-flex align-items-center'>
                                                                    <input name="isFeatured" type="radio" checked={!data.isFeatured} value={!data.isFeatured} onChange={(e) => { handleChange('isFeatured', false) }} />
                                                                    <span className="checkmark black-checkmark"></span>
                                                                    <span className='ml-1' onChange={(e) => {
                                                                        handleChange('isFeatured', false)
                                                                    }} ><i />No</span>
                                                                </div>
                                                            </label>
                                                        </Form.Group> */}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        {
                                            data.type == 3 &&
                                            <Row className="attributesRow">
                                                <VariationListings productId={window.location.pathname.split('/')[3]} />
                                            </Row>
                                        }

                                        <Row>
                                            <Col md="12">
                                                <Form.Group>
                                                    <label>Short Description</label>
                                                    <TinyMCE
                                                        value={data.shortDescription ? data.shortDescription : ''}
                                                        onEditorChange={(content) => {
                                                            setData({ ...data, shortDescription: content });
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>




                                        <Row>
                                            <Col md="12" sm="6" className="mt-5">
                                                <Button
                                                    className="btn-fill pull-right mt-3 float-right"
                                                    type="submit"
                                                    variant="info"
                                                    onClick={updateProduct}
                                                >
                                                    Update
                                                </Button>
                                                <Link to={'/products'} >
                                                    <Button className="btn-fill pull-right mt-3" variant="info">
                                                        Back
                                                    </Button>
                                                </Link>
                                            </Col>
                                        </Row>
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
    category: state.category,
    product: state.product,
    error: state.error
});

export default connect(mapStateToProps, { beforeProduct, updateProduct, getProduct, getCategories })(EditProduct);