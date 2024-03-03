import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { ENV } from "../../config/config";
import { beforeProduct, getProducts, deleteProduct } from "./Products.action";
import { getCategories, beforeCategory } from "./Category/Category.action";
import FullPageLoader from "components/FullPageLoader/FullPageLoader";
import PaginationLimitSelector from "../Components/PaginationLimitSelector";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import localeInfo from "rc-pagination/lib/locale/en_US";
import Swal from "sweetalert2";
import { getRole } from "views/AdminStaff/permissions/permissions.actions";
import {
  Button,
  Card,
  Form,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import userDefaultImg from "../../assets/img/placeholder.jpg";
var CryptoJS = require("crypto-js");
import { currencyFormat } from "../../../src/utils/functions";
import { Helmet } from "react-helmet";

const Products = (props) => {
  const [pagination, setPagination] = useState(null);
  const [Page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loader, setLoader] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [products, setProducts] = useState();
  const [searchName, setSearchName] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [category, setCategory] = useState();
  useEffect(() => {
    window.scroll(0, 0);
    const qs = ENV.objectToQueryString({ page: Page, limit: 10 });
    const filter = {};
    if (
      searchStatus !== undefined &&
      searchStatus !== null &&
      searchStatus !== ""
    )
      filter.status = searchStatus === "true" ? true : false;
    // if (category)
    //     filter.category = category
    props.getProducts(qs, filter);
    let roleEncrypted = localStorage.getItem("role");
    let role = "";
    if (roleEncrypted) {
      let roleDecrypted = CryptoJS.AES.decrypt(
        roleEncrypted,
        "skincanvas123#key"
      ).toString(CryptoJS.enc.Utf8);
      role = roleDecrypted;
    }
    props.getRole(role);
    const fiterQs = ENV.objectToQueryString({ all: 1 });
    props.getCategories(fiterQs, filter);
  }, []);
  /*Set Category data in select for filter*/
  useEffect(() => {
    if (props.category.getCategoriesAuth) {
      const { categories } = props.category.categories;
      let categories_ = [];
      categories.forEach((category, index) => {
        categories_.push({
          label: category.name,
          key: category._id,
          value: category._id,
        });
      });
      setCategoryOptions(categories_);

      props.beforeCategory();
    }
  }, [props.category.getCategoriesAuth]);

  useEffect(() => {
    if (Object.keys(props.getRoleRes).length > 0) {
      setPermissions(props.getRoleRes.role);
    }
  }, [props.getRoleRes]);

  useEffect(() => {
    if (props.product.delProductAuth) {
      const qs = ENV.objectToQueryString({ page: Page, limit: 10 });
      props.getProducts();
    }
  }, [props.product.delProductAuth]);

  useEffect(() => {
    if (products) {
      setLoader(false);
    }
  }, [products]);

  const deleteProducts = (productId) => {
    Swal.fire({
      title: "Are you sure you want to delete?",
      html: "If you delete an item, it would be permanently lost.",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.value) {
        setLoader(true);
        props.deleteProduct(productId);
      }
    });
  };
  useEffect(() => {
    if (props.product.getProductsAuth) {
      const { products, pagination } = props.product.productsList;
      setProducts(products);
      setPagination(pagination);
      setPage(pagination.page);
      setLimit(pagination.limit);
      props.beforeProduct();
      setLoader(false);
    }
  }, [props.product.getProductsAuth]);

  const onPageChange = async (page) => {
    const filter = {};
    if (searchName && searchName !== "") {
      filter.title = searchName;
    }

    if (category) filter.category = category;
    if (searchType && searchType !== "") filter.type = searchType;
    if (searchStatus !== "") {
      filter.status = searchStatus === "true" ? true : false;
    }

    setPage(page);
    setLoader(true);
    const qs = ENV.objectToQueryString({ page: page, limit: limit });
    props.getProducts(qs, filter);
  };

  const itemsPerPageChange = (newLimit) => {
    setLimit(newLimit);
    const filter = {};
    if (searchName && searchName !== "") {
      filter.title = searchName;
    }
    if (category) filter.category = category;
    if (searchType && searchType !== "") filter.type = searchType;
    if (searchStatus !== "") {
      filter.status = searchStatus === "true" ? true : false;
    }

    const qs = ENV.objectToQueryString({ page: 1, limit: newLimit });
    props.getProducts(qs, filter);
    setLoader(true);
  };

  const applyFilters = () => {
    const filter = {};
    if (searchName && searchName !== "") {
      filter.title = searchName;
    }
    if (category) filter.category = category;
    if (searchType && searchType !== "") filter.type = searchType;
    if (searchStatus && searchStatus !== "") {
      filter.status = searchStatus;
    }

    setPage(1);
    const qs = ENV.objectToQueryString({ page: 1, limit: limit });
    props.getProducts(qs, filter);
    setLoader(true);
  };

  const reset = () => {
    setSearchName("");
    setSearchType("");
    setSearchStatus("");
    setCategory("");
    setPage(1);
    setLimit(10);
    const qs = ENV.objectToQueryString({ page: 1, limit: 10 });
    props.getProducts(qs);
    setLoader(true);

    localStorage.removeItem("showProductFilter");
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };
  console.log(products);
  return (
    <>
      <Helmet>
        <title>Scotani | Admin Panel | Products </title>
      </Helmet>
      {loader ? (
        <FullPageLoader />
      ) : (
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
                        <Form.Label
                          style={{ color: "black" }}
                          className="d-block mb-2"
                        >
                          Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          onKeyPress={handleKeyPress}
                          value={searchName}
                          placeholder="Name"
                          onChange={(e) =>
                            setSearchName(e.target.value)
                          } /*onKeyDown={} */
                        />
                      </Form.Group>
                    </Col>

                    <Col xl={3} sm={6}>
                      <Form.Group>
                        <Form.Label
                          style={{ color: "black" }}
                          className="d-block mb-2"
                        >
                          Category
                        </Form.Label>
                        <select
                          value={category}
                          onKeyPress={handleKeyPress}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {categoryOptions && categoryOptions.length > 0
                            ? categoryOptions.map((option, key) => {
                                return (
                                  <option key={key} value={option.value}>
                                    {option.label}
                                  </option>
                                );
                              })
                            : ""}
                        </select>
                      </Form.Group>
                    </Col>
                    <Col xl={3} sm={6}>
                      <Form.Group>
                        <Form.Label
                          style={{ color: "black" }}
                          className="d-block mb-2"
                        >
                          Type
                        </Form.Label>
                        <select
                          value={searchType}
                          onKeyPress={handleKeyPress}
                          onChange={(e) => setSearchType(e.target.value)}
                        >
                          <option value="">Select Type</option>
                          <option value={0}>Inspiration</option>
                          <option value={1}>Discover</option>
                          <option value={2}>Tattoos</option>
                          <option value={3}>Configurable Product</option>
                          <option value={4}>Fashion</option>
                        </select>
                      </Form.Group>
                    </Col>
                    <Col xl={3} sm={6}>
                      <Form.Group>
                        <Form.Label
                          style={{ color: "black" }}
                          className="d-block mb-2"
                        >
                          Status
                        </Form.Label>
                        <select
                          value={searchStatus}
                          onKeyPress={handleKeyPress}
                          onChange={(e) => setSearchStatus(e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </Form.Group>
                    </Col>
                    <Col xl={3} sm={6}>
                      <Form.Group className="btnGroup">
                        <Form.Label className="d-block mb-2">&nbsp;</Form.Label>
                        <div className="d-flex filter-btns-holder">
                          <Button
                            variant="info"
                            disabled={
                              !searchName &&
                              !category &&
                              !searchType &&
                              !searchStatus
                            }
                            onClick={applyFilters}
                          >
                            Search
                          </Button>
                          <Button
                            variant="warning"
                            hidden={
                              !searchName &&
                              !category &&
                              !searchType &&
                              !searchStatus
                            }
                            onClick={reset}
                          >
                            Reset
                          </Button>
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
                  <div className="d-flex justify-content-end mb-2 pr-3">
                    <span
                      style={{ color: "black", fontWeight: "bold" }}
                    >{`Total : ${pagination?.total}`}</span>
                  </div>
                  <div className="d-block d-md-flex align-items-center justify-content-between">
                    <Card.Title as="h4">Products</Card.Title>
                    {permissions && permissions.addProduct && (
                      <Button
                        variant="info"
                        className="float-sm-right"
                        onClick={() => props.history.push(`/add-product`)}
                      >
                        Add Product
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Body className="table-full-width">
                  <div className="table-responsive">
                    <Table className="table-bigboy">
                      <thead>
                        <tr>
                          <th
                            className="text-center serial-col"
                            style={{ width: "10%" }}
                          >
                            #
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Product Image
                          </th>
                          <th className="text-center" style={{ width: "30%" }}>
                            Product Name
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Category
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Product Type
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Price($)
                          </th>
                          <th className="text-center" style={{ width: "10%" }}>
                            Status
                          </th>
                          <th className="text-center" style={{ width: "20%" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products && products.length ? (
                          products.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td className="text-center serial-col">
                                  {pagination &&
                                    pagination.limit * pagination.page -
                                      pagination.limit +
                                      index +
                                      1}
                                </td>

                                <td className="text-center">
                                  <div
                                    className="user-image text-center"
                                    style={{ margin: "auto" }}
                                  >
                                    <img
                                      className="img-fluid"
                                      alt="User Image"
                                      src={
                                        item.image ? item.image : userDefaultImg
                                      }
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = userDefaultImg;
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="text-center">{item.title}</td>
                                <td className="text-center">{item.category}</td>
                                <td className="text-center">
                                  {
                                    {
                                      0: "Inspiration",
                                      1: "Discover",
                                      2: "Tattoos",
                                      3: "Configurable Product",
                                      4: "Fashion",
                                    }[item.type.toString()]
                                  }
                                </td>
                                <td className="text-center">
                                  {item.price
                                    ? currencyFormat(item.price)
                                    : "N/A"}
                                </td>
                                <td className="text-center td-actions">
                                  <span
                                    className={` status ${
                                      item.status ? `bg-success` : `bg-danger`
                                    }`}
                                  >
                                    <span className="lable lable-success">
                                      {" "}
                                      {item.status ? "Active" : "Inactive"}
                                    </span>
                                  </span>
                                </td>

                                <td className="td-actions text-center">
                                  <ul className="list-unstyled mb-0">
                                    {permissions && permissions.editProduct && (
                                      <li className="d-inline-block align-top">
                                        <Button
                                          className="btn-action btn-warning"
                                          type="button"
                                          title="Edit"
                                          variant="success"
                                          onClick={() =>
                                            props.history.push(
                                              `/edit-product/${item._id}`
                                            )
                                          }
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                      </li>
                                    )}
                                    {item.type == 3 &&
                                      permissions &&
                                      permissions.editProduct && (
                                        <li className="d-inline-block align-top">
                                          <Button
                                            className="btn-action btn-warning"
                                            type="button"
                                            title="Edit Variations"
                                            variant="warning"
                                            onClick={() =>
                                              props.history.push(
                                                `/list-variations/${item._id}`
                                              )
                                            }
                                          >
                                            <i className="fas fa-bars"></i>
                                          </Button>
                                        </li>
                                      )}
                                    {permissions &&
                                      permissions.deleteProduct && (
                                        <li className="d-inline-block align-top">
                                          <Button
                                            className="btn-action btn-danger"
                                            type="button"
                                            variant="danger"
                                            title="Delete"
                                            onClick={() =>
                                              deleteProducts(item._id)
                                            }
                                          >
                                            <i className="fas fa-trash"></i>
                                          </Button>
                                        </li>
                                      )}
                                  </ul>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              <div className="alert alert-info" role="alert">
                                No Product Found
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                    {pagination && (
                      <div className="pb-4">
                        <div className="d-flex align-items-center justify-content-between pagination-wrapper">
                          <Pagination
                            className="m-3"
                            defaultCurrent={1}
                            pageSize // items per page
                            current={
                              Page > pagination.pages ? pagination.pages : Page
                            } // current active page
                            total={pagination.pages} // total pages
                            onChange={onPageChange}
                            locale={localeInfo}
                          />
                          <PaginationLimitSelector
                            limit={limit}
                            itemsPerPageChange={itemsPerPageChange}
                            currentPage={Page}
                            total={pagination.total}
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
  error: state.error,
  getRoleRes: state.role.getRoleRes,
  product: state.product,
  category: state.category,
});

export default connect(mapStateToProps, {
  beforeProduct,
  deleteProduct,
  getProducts,
  getRole,
  getCategories,
  beforeCategory,
})(Products);
