import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { beforeProduct, addProduct } from "./Products.action";
import FullPageLoader from "components/FullPageLoader/FullPageLoader";
import "rc-pagination/assets/index.css";
import {
  Button,
  Card,
  Form,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import userDefaultImg from "../../assets/img/imagePlaceholder.jpg";
import { ENV } from "../../config/config";
import AttributeRow from "./AttributeRow";
import validator from "validator";
import Select from "react-select";
import { getCategories } from "./Category/Category.action";
import TinyMCE from "../../components/tinyMce/tinyMCE";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";

const AddProduct = (props) => {
  const history = useHistory();
  const [categories, setCategories] = useState(null);
  const [data, setData] = useState({
    title: "",
    category: "",
    price: "",
    minQty: "",
    type: "",
    shortDescription: "",
    image: "",
    images: [],
    status: true,
    isFeatured: false,
  });
  const typeOptions = [
    {
      value: 0,
      label: "Inspiration",
    },
    {
      value: 1,
      label: "Discover",
    },
    {
      value: 2,
      label: "Tattoos",
    },
    {
      value: 3,
      label: "Configurable Product",
    },
    {
      value: 4,
      label: "Fashion",
    },
  ];
  const [attributes, setAttributes] = useState([]);
  const [msg, setMsg] = useState({
    title: "",
    type: "",
    price: "",
    minQty: "",
    category: "",
    shortDescription: "",
    image: "",
    status: "",
    images:[],
  });
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    window.scroll(0, 0);
    setLoader(false);
    const qs = ENV.objectToQueryString({ all: 1 });
    const filter = {};
    setAttributes([
      {
        title: "Color",
        price: "",

        shortDescription: "",
        isColor: true,
        isMeasurement: false,
        isImage: false,
        image: "",
        status: true,
        values: [
          {
            title: "",
            image: "",
            colorCode: "",
            measurementScale: "",
          },
        ],
      },
      {
        title: "Size",
        price: "",

        shortDescription: "",
        isColor: false,
        isMeasurement: false,
        isImage: false,
        // image: "",
        status: true,
        values: [
          {
            title: "",
            colorCode: "",
            measurementScale: "",
          },
        ],
      },
    ]);
    props.getCategories(qs, filter);
  }, []);
  useEffect(() => {
    if (props.category.getCategoriesAuth) {
      let { categories, pagination } = props.category.categories;
      let options = [];
      categories.map((cate) => {
        options.push({
          label: cate.name,
          value: cate._id,
        });
      });
      setCategories(options);
    }
  }, [props.category.getCategoriesAuth]);
  useEffect(() => {
    if (props.product.createProductAuth) {
      history.push("/products");
      setLoader(false);
    }
  }, [props.product.createProductAuth]);
  useEffect(() => {
    if (props.product.existProductAuth) {
      setMsg({ ...msg, title: "Product name already exist" });
      setLoader(false);
      props.beforeProduct();
    }
  }, [props.product.existProductAuth]);
  useEffect(() => {
    data.imageAltText = "Skin Canvas - " + data.title;
  }, [data.title]);
  /**Update 14-09-2023
   * Add image upload function for validation before upload image on server
   ***/
  const submitPic = async (e) => {
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
    const selectedFile = e.target.files[0];

    if (allowedFormats.includes(selectedFile.type)) {
      try {
        const res = await ENV.uploadImage(e);
        handleChange("image", res ? ENV.uploadedImgPath + res : "");

        // Clear the image validation error if it was previously set
        if (
          msg.image ===
          "Invalid file format. Only PNG and JPG images are allowed."
        ) {
          setMsg({ ...msg, image: "" });
        }
      } catch (error) {
        // Handle the error, if necessary
      }
    } else {
      toast.warning("Invalid image format");
      setData({ ...data, image: "no-image" });
      setMsg({
        ...msg,
        image: "Invalid file format. Only PNG and JPG images are allowed.",
      });
    }
  };

  // handle multiple images
  const submitMultiplePic = async (e) => {
    let imagespath = [];
    const allowedFormats = ["image/png", "image/jpeg", "image/jpg"];
    const selectedFiles = e.target.files;
    if (selectedFiles?.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        if (allowedFormats.includes(selectedFiles[i].type)) {
          try {
            const res = await ENV.uploadImage(e);
            handleChange("image", res ? ENV.uploadedImgPath + res : "");
            imagespath.push(ENV.uploadedImgPath + res);
            // Clear the image validation error if it was previously set
            if (
              msg.image ===
              "Invalid file format. Only PNG and JPG images are allowed."
            ) {
              setMsg({ ...msg, image: "" });
            }
          } catch (error) {
            // Handle the error, if necessary
          }
        } else {
          toast.warning("Invalid image format");

          setMsg({
            ...msg,
            image: "Invalid file format. Only PNG and JPG images are allowed.",
          });
        }
      }
    }
    setData({ ...data, images: imagespath });
    if(data.image===""){
      handleChange("image", imagespath[0]);
      setMsg({ ...msg, image: "" });
    }
 
  };


  const addProduct = () => {
    const validationMessages = {};
    if (validator.isEmpty(data.title.trim())) {
      validationMessages.title = "Product name is required.";
    }
    if (validator.isEmpty(data.price.trim())) {
      validationMessages.price = "Product price is required.";
    }
    if (validator.isEmpty(data.minQty.trim())) {
      validationMessages.minQty = "Minimum Quantity is required.";
    }

    if (categories != null && validator.isEmpty(data.category)) {
      validationMessages.category = "Caregory is required.";
    }

    if (validator.isEmpty(String(data.type))) {
      validationMessages.type = "Product type is required.";
    }

    if (validator.isEmpty(data.image)) {
      validationMessages.image = "Product image is required.";
    }

    if (data.image === "no-image") {
      validationMessages.image =
        "Invalid file format. Only PNG and JPG images are allowed.";
    }

    if (data.price) {
      if (data.price <= 0) {
        validationMessages.price = `Price must be greater than zero.`;
      } else if (!/^\d+(\.\d{1,2})?$/.test(data.price)) {
        validationMessages.price = `Price must have up to 2 decimal.`;
      }
    }
    if (data.minQty) {
      if (data.minQty <= 0) {
        validationMessages.minQty = `Minimum Quantity must be greater than zero`;
      }
    }
    if (data.type == 3) {
      attributes.map((attr) => {
        if (attr.isColor == true) {
          attr.values.map((v) => {
            if (v.colorCode.trim() == "" || v.title.trim() == "") {
              validationMessages.attributes = "Some of the values are empty";
            }
          });
        } else {
          attr.values.map((v) => {
            if (v.title.trim() == "") {
              validationMessages.attributes = "Some of the values are empty";
            }
          });
        }
      });
    }

    // If there are validation errors, set them in the state and return
    if (Object.keys(validationMessages).length > 0) {
      setMsg({ ...msg, ...validationMessages });
      return;
    }

    setLoader(true);
    let payload = {
      category: data.category,
      title: data.title,
      price: data.price,
      minQty: data.minQty,
      images: data.images,
      shortDescription: data.shortDescription,
      image: data.image,
      type: data.type,
      attributes: data.type == 3 ? attributes : [],
      status: data.status,
      isFeatured: data.isFeatured,
    };
    props.addProduct(payload);
  };
  const handleChange = (name, value) => {
    setData({ ...data, [name]: value });
    setMsg({ ...msg, [name]: "" });
  };
  const removeAttribute = (index) => {
    let attributes_ = [...attributes];
    attributes_.splice(index, 1); // 2nd parameter means remove one item only
    setAttributes(attributes_);
  };
  const updateAttributes = (attribute, index) => {
    let attributes_ = [...attributes];
    attributes_[index] = attribute;
    setAttributes(attributes_);
  };
  return (
    <>
      <Helmet>
        <title>Scotani | Admin Panel | Add Product</title>
      </Helmet>
      {loader ? (
        <FullPageLoader />
      ) : (
        <Container>
          <Row>
            <Col md="12">
              <Card className="pb-3 table-big-boy">
                <Card.Header>
                  <Card.Title as="h4">Add Product</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Row>
                        <Col md="12">
                          <Form.Group>
                            <label>
                              Product Name
                              <span className="text-danger"> *</span>
                            </label>
                            <Form.Control
                              value={data.title ? data.title : ""}
                              onChange={(e) =>
                                handleChange("title", e.target.value)
                              }
                              placeholder="Product Name"
                              type="text"
                            ></Form.Control>
                            <span className={msg.title ? `` : `d-none`}>
                              {
                                <label className="pl-1 text-danger">
                                  {msg.title}
                                </label>
                              }
                            </span>
                          </Form.Group>
                        </Col>
                        {categories != null && (
                          <Col md="12">
                            <Form.Group>
                              <label>
                                Category
                                <span className="text-danger"> *</span>
                              </label>
                              <Select
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 999999,
                                  }),
                                }}
                                options={categories}
                                onChange={(option) =>
                                  setData({ ...data, category: option.value })
                                }
                                value={categories.filter(
                                  (option) => option.value === data.category
                                )}
                              />
                              <span className={msg.category ? `` : `d-none`}>
                                {(data.category === "" ||
                                  data.category === null) && (
                                  <label className="pl-1 text-danger">
                                    {msg.category}
                                  </label>
                                )}
                              </span>
                            </Form.Group>
                          </Col>
                        )}

                        <Col md="12">
                          <Form.Group>
                            <label>
                              Product Price ($)
                              <span className="text-danger"> *</span>
                            </label>
                            <Form.Control
                              value={data.price ? data.price : ""}
                              onChange={(e) => {
                                handleChange("price", e.target.value);
                              }}
                              onKeyDown={(e) =>
                                ["e", "E", "+", "-"].includes(e.key) &&
                                e.preventDefault()
                              }
                              placeholder="Sell Price"
                              type="number"
                            ></Form.Control>
                            <span className={msg.price ? `` : `d-none`}>
                              {
                                <label className="pl-1 text-danger">
                                  {msg.price}
                                </label>
                              }
                            </span>
                          </Form.Group>
                        </Col>
                        <Col md="12">
                          <Form.Group>
                            <label>
                              Minimum Quantity
                              <span className="text-danger"> *</span>
                            </label>
                            <Form.Control
                              value={data.minQty ? data.minQty : ""}
                              onChange={(e) => {
                                handleChange("minQty", e.target.value);
                              }}
                              onKeyDown={(e) =>
                                ["e", "E", "+", "-"].includes(e.key) &&
                                e.preventDefault()
                              }
                              placeholder="Minimum Quantity"
                              type="number"
                            ></Form.Control>
                            <span className={msg.minQty ? `` : `d-none`}>
                              {
                                <label className="pl-1 text-danger">
                                  {msg.minQty}
                                </label>
                              }
                            </span>
                          </Form.Group>
                        </Col>
                        <Col md="12">
                          <Form.Group>
                            <label>
                              Product Type
                              <span className="text-danger"> *</span>
                            </label>
                            <Select
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 999999,
                                }),
                              }}
                              options={typeOptions}
                              onChange={(option) =>
                                handleChange("type", option.value)
                              }
                              value={typeOptions.filter(
                                (option) => option.value === data.type
                              )}
                            />
                            <span className={msg.type ? `` : `d-none`}>
                              {(data.type === "" || data.type === null) && (
                                <label className="pl-1 text-danger">
                                  {msg.type}
                                </label>
                              )}
                            </span>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Col>
                    <Col md={6}>
                      <Row>
                        <Col md="6">
                          <Form.Group className="product-file-wrapper">
                            <label>
                              Product Image
                              <span className="text-danger"> *</span>
                            </label>
                            <div className="mb-2">
                              {
                                <img
                                  className="img-thumbnail"
                                  src={data.image ? data.image : userDefaultImg}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = userDefaultImg;
                                  }}
                                  style={{ width: "100px" }}
                                />
                              }
                            </div>
                            <Form.Control
                              className="text-white "
                              onChange={async (e) => {
                                submitPic(e);
                              }}
                              type="file"
                              accept=".png, .jpg, .jpeg"
                            ></Form.Control>
                            <small>
                              Recommended Image Size:<br></br> 500px x 500px
                            </small>
                            <br></br>
                            {msg.image && (
                              <span className={msg.image ? `` : `d-none`}>
                                <label className="pl-1 text-danger">
                                  {msg.image}
                                </label>
                              </span>
                            )}
                          </Form.Group>
                            {/* add multiple images option */}
                            <Form.Group className="product-files-wrapper">
                              <label>
                                Products Images
                                <span className="text-danger"> *</span>
                              </label>
                              <div className="mb-2">
                                {/* Display selected images */}
                                {data.images.map((image, index) => (
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
                              {msg.image && (
                                <span className={msg.image ? `` : `d-none`}>
                                  <label className="pl-1 text-danger">
                                    {msg.image}
                                  </label>
                                </span>
                              )}
                            </Form.Group>


                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <label className="mr-2">
                              Status<span className="text-danger"> *</span>
                            </label>
                            <label className="right-label-radio mb-2 mr-2">
                              <div className="d-flex align-items-center">
                                <input
                                  name="status"
                                  type="radio"
                                  checked={data.status}
                                  value={data.status}
                                  onChange={(e) => {
                                    handleChange("status", true);
                                  }}
                                />
                                <span className="checkmark black-checkmark"></span>
                                <span
                                  className="ml-1"
                                  onChange={(e) => {
                                    handleChange("status", true);
                                  }}
                                >
                                  <i />
                                  Active
                                </span>
                              </div>
                            </label>
                            <label className="right-label-radio mr-3 mb-2">
                              <div className="d-flex align-items-center">
                                <input
                                  name="status"
                                  type="radio"
                                  checked={!data.status}
                                  value={!data.status}
                                  onChange={(e) => {
                                    handleChange("status", false);
                                  }}
                                />
                                <span className="checkmark black-checkmark"></span>
                                <span
                                  className="ml-1"
                                  onChange={(e) => {
                                    handleChange("status", false);
                                  }}
                                >
                                  <i />
                                  Inactive
                                </span>
                              </div>
                            </label>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  {data.type == 3 && (
                    <Row className="attributesRow">
                      <Table bordered size="sm">
                        <thead>
                          <tr>
                            <th style={{ width: "20%" }}>Title</th>
                            <th style={{ width: "20%" }}>Type</th>
                            <th style={{ width: "55%" }}>Values</th>
                            {/* <th style={{ "width": "5%" }}>Actions</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {attributes.length > 0
                            ? attributes.map((attribute, index) => {
                                return (
                                  <AttributeRow
                                    attribute={attribute}
                                    count={attributes.length}
                                    isLast={attributes.length - 1 == index}
                                    index={index}
                                    removeAttribute={removeAttribute}
                                    updateAttributes={updateAttributes}
                                  />
                                );
                              })
                            : ""}
                        </tbody>
                      </Table>
                      {msg.attributes && (
                        <span className={msg.attributes ? `` : `d-none`}>
                          <label className="pl-1 text-danger">
                            {msg.attributes}
                          </label>
                        </span>
                      )}
                    </Row>
                  )}
                  <Row>
                    <Col md="12">
                      <Form.Group>
                        <label>Short Description</label>
                        <TinyMCE
                          value={
                            data.shortDescription ? data.shortDescription : ""
                          }
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
                        onClick={addProduct}
                      >
                        Add
                      </Button>
                      <Link to={"/products"}>
                        <Button
                          className="btn-fill pull-right mt-3"
                          variant="info"
                        >
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
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  category: state.category,
  product: state.product,
  error: state.error,
});

export default connect(mapStateToProps, {
  beforeProduct,
  addProduct,
  getCategories,
})(AddProduct);
