import React, { useRef, useEffect, useState } from "react";
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { getRole } from "views/AdminStaff/permissions/permissions.actions";
import FullPageLoader from 'components/FullPageLoader/FullPageLoader';
import { beforeAdmin, getAdmin, updateAdmin, updatePassword } from '../Admin/Admin.action';
import userDefaultImg from '../../assets/img/default-profile.png'
// react-bootstrap components
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faHourglassEnd } from '@fortawesome/free-solid-svg-icons'
var CryptoJS = require("crypto-js");
import { toast } from 'react-toastify';
import validator from 'validator';


function profile(props) {
  const [permissions, setPermissions] = useState({})
  const [adminRole, setAdminRole] = useState('')
  const [loader, setLoader] = useState(true)
  const [adminId, setAdminId] = useState(localStorage.getItem('userID'))

  // const [siteLogo, setSiteLogo] = useState('')
  // const [image, setImage] = useState('')
  const [msg, setMsg] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    status: '',
    image: ''
  })

  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    status: '',
    image: '',
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
    _id: adminId
  })


  useEffect(() => {
    let adminId = localStorage.getItem('userID')
    setPassword({ ...password, _id: adminId });
    window.scroll(0, 0)
    // setLoader(false);
    props.getAdmin(adminId)
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
      setAdminRole(props.getRoleRes.role)
    }
  }, [props.getRoleRes])

  useEffect(() => {
    if (props.admin.getAuth) {
      //setLoader(false)
      const { admin } = props.admin
      setAdmin(admin)
      props.beforeAdmin()
    }
  }, [props.admin.getAuth])


  useEffect(() => {
    if (props.admin.updateAdminAuth) {
      let adminId = localStorage.getItem('userID')
      setPassword({ ...password, _id: adminId });
      window.scroll(0, 0)
      props.getAdmin(adminId)

    }
  }, [props.admin.updateAdminAuth])


  useEffect(() => {
    if (props.admin.updatePasswordAuth) {
      let adminId = localStorage.getItem('userID')
      // setPassword({ ...password, _id: adminId });
      setPassword({
        current: '',
        new: '',
        confirm: '',
        _id: adminId
      })

      window.scroll(0, 0)
      props.getAdmin(adminId)

    }
  }, [props.admin.updatePasswordAuth])


  useEffect(() => {
    if (admin) {
      setLoader(false)
    }
  }, [admin])
  // when an error is received
  useEffect(() => {
    if (props.error.error)
      setLoader(false)
  }, [props.error.error])


  const [passwordMsgCheck, setPasswordMsgCheck] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword2] = useState(false);
  const [showNewPassword, setNewPassword] = useState(false);

  const showPasswordMethod = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword)
  }
  const showConfirmPasswordMethod = (e) => {
    e.preventDefault();
    setConfirmPassword2(!showConfirmPassword)
  }
  const showNewPasswordMethod = (e) => {
    e.preventDefault();
    setNewPassword(!showNewPassword)
  }

  // useEffect(() => {
  //   if (password.new === password.confirm) {
  //     setPasswordMsgCheck(false)
  //   }
  //   else {
  //     setPasswordMsg('New passord & confirm password are not same.')
  //     setPasswordMsgCheck(true)
  //   }
  // }, [password])




  /**Update 06-10-2023 
    * Add image upload function for validation before upload image on server
    ***/
  const submitPic = async (e) => {
    const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
    const selectedFile = e.target.files[0];

    if (allowedFormats.includes(selectedFile.type)) {
      try {
        const res = await ENV.uploadImage(e);
        setAdmin({ ...admin, image: res ? ENV.uploadedImgPath + res : "" })

        // Clear the image validation error if it was previously set
        if (msg.image === 'Invalid file format. Only PNG and JPG images are allowed.') {
          setMsg({ ...msg, image: '' });
        }

      } catch (error) {

      }
    } else {
      setMsg({ ...msg, image: 'Invalid file format. Only PNG and JPG images are allowed.' });

    }
  };



  const submitCallBack = (e) => {

    e.preventDefault()


    const validationMessages = {};
    if (validator.isEmpty(admin.name)) {
      validationMessages.name = 'Full Name is required';
    }


    if (validator.isEmpty(admin.email)) {
      validationMessages.email = 'Email is required';
    }

    if (admin.name) {
      const trimmedValue = admin.name.trim(); // Remove leading and trailing spaces

      // Check if the trimmedValue contains any characters other than alphabetic characters
      if (/[^A-Za-z\s]/.test(trimmedValue)) {
        validationMessages.name = 'Full name can only contain alphabetic characters and spaces.';
      } else if (trimmedValue.length === 0) {
        validationMessages.name = 'Full name cannot be empty.';
      } else if (trimmedValue.length < 3 || trimmedValue.length > 35) {
        validationMessages.name = 'Full name length must be 3 to 35 characters long';
      }
    }



    if (admin.address && (admin.address.length < 3 || admin.address.length > 250)) {
      validationMessages.address = 'Address length must be 3 to 250 characters long'
    }



    if (admin.phone) {
      const numericValue = admin.phone.replace(/[^0-9+]/g, '');
      if (numericValue.length < 7 || numericValue.length > 15) {
        validationMessages.phone = 'Phone number must be between 7 and 15 digits.'


      } else if (numericValue[0] === '0' || (numericValue[0] !== '+' && numericValue[0] === '0')) {
        validationMessages.phone = 'Phone number cannot start with zero'

      }
      else if (/[^0-9+\s]/.test(admin.phone)) {
        validationMessages.phone = 'Phone number can only contain numbers, plus (+).';
      }
    }



    if (Object.keys(validationMessages).length > 0) {
      setMsg({ ...msg, ...validationMessages });

      return;
    }

    setLoader(true)
    setMsg({ ...msg, image: '' });
    props.updateAdmin(admin);
  }

  const passwordForm = (e) => {
    e.preventDefault()

    if (!validator.isEmpty(password.current) && !validator.isEmpty(password.new)
      && !validator.isEmpty(password.confirm)
    ) {
      if (password.new === password.confirm) {
        if (validator.isStrongPassword(password.new)) {
          setPasswordMsgCheck(false)
          setLoader(true)

          let formData = new FormData()
          for (const key in password)
            formData.append(key, password[key])
          props.updatePassword(formData)

          setPassword({
            current: '',
            new: '',
            confirm: '',
            _id: adminId
          })


          e.target[0].value = ''
          e.target[1].value = ''
          e.target[2].value = ''
          e.target[3].value = ''
          e.target[4].value = ''
          e.target[5].value = ''

        }
        else {

          setPasswordMsg('Password needs to be a minimum of 8 characters long with uppercase, lowercase, a number, and a special character')
          setPasswordMsgCheck(true)
        }
      }
      else {
        setPasswordMsg('New password & confirm password are not same.')
        setPasswordMsgCheck(true)
      }
    }
    else {
      setPasswordMsg('You have to fill all fields to change password.')
      setPasswordMsgCheck(true)
    }
  }



  // const submitPic = (e) => {
  //   e.preventDefault()
  //   if (admin.image) {
  //     props.updateAdmin(admin);
  //     window.location.reload();
  //   }
  //   else {
  //     toast.error('Please upload pic before updating.')
  //   }

  // }

  return (
    <>

      {
        loader ?
          <FullPageLoader />
          :
          <Container fluid>
            <div className="section-image" data-image="../../assets/img/bg5.jpg">
              {/* you can change the color of the filter page using: data-color="blue | purple | green | orange | red | rose " */}
              <Container>
                <Row>
                  <Col md="8" className="mb-5">
                    <Form action="" className="form" onSubmit={(e) => submitCallBack(e)}>
                      <Card className="mb-0 pb-4 table-big-boy">
                        <Card.Header>
                          <Card.Header className="pl-0">
                            <Card.Title as="h4">Profile Details</Card.Title>
                          </Card.Header>
                        </Card.Header>
                        <Card.Body>

                          <Row>
                            <Col md="6">
                              <Form.Group>
                                <label>Full Name<span className="text-danger"> *</span></label>
                                <Form.Control
                                  value={admin?.name}
                                  onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                                  placeholder="Full Name"
                                  type="text"

                                  maxLength={35}
                                  onInput={() => setMsg((prevMsg) => ({ ...prevMsg, name: '' }))}
                                ></Form.Control>
                                <span className={msg.name ? `` : `d-none`}>
                                  <label className="pl-1 text-danger">{msg.name}</label>
                                </span>

                              </Form.Group>
                            </Col>
                            <Col className="pl-3" md="6">
                              <Form.Group>
                                <label>Email<span className="text-danger"> *</span></label>
                                <Form.Control
                                  value={admin?.email}
                                  placeholder="Email"
                                  type="email"
                                  readOnly
                                ></Form.Control>
                                <span className={msg.email ? `` : `d-none`}>
                                  <label className="pl-1 text-danger">{msg.email}</label>
                                </span>

                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md="12">
                              <Form.Group>
                                <label>Address</label>
                                <Form.Control
                                  value={admin?.address}
                                  onChange={(e) => setAdmin({ ...admin, address: e.target.value })}
                                  placeholder="Address"
                                  type="text"

                                  maxLength={250}
                                  onInput={() => setMsg((prevMsg) => ({ ...prevMsg, address: '' }))}
                                ></Form.Control>
                                <span className={msg.address ? `` : `d-none`}>
                                  <label className="pl-1 text-danger">{msg.address}</label>
                                </span>

                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md="6">
                              <Form.Group>
                                <label>Phone Number</label>
                                <Form.Control
                                  value={admin?.phone}
                                  onChange={(e) => setAdmin({ ...admin, phone: e.target.value })}
                                  onKeyDown={e => ["e", "E", "-", "."].includes(e.key) && e.preventDefault()}
                                  placeholder="+1234567890"
                                  type="text"
                                  onInput={() => setMsg((prevMsg) => ({ ...prevMsg, phone: '' }))}
                                ></Form.Control>
                                <span className={msg.phone ? `` : `d-none`}>
                                  <label className="pl-1 text-danger">{msg.phone}</label>
                                </span>
                              </Form.Group>
                            </Col>
                            {/* <Col className="pl-3" md="6">
                              <Form.Group>
                                <label>Status<span className="text-danger"> *</span></label>
                                <Form.Check
                                  type="switch"
                                  id="custom-switch"
                                  className="p-1"
                                  checked={admin?.status}
                                  onChange={(e) => setAdmin({ ...admin, status: e.target.checked })}
                                />
                              </Form.Group>
                            </Col> */}
                            <Col md="6">
                              <Form.Group>
                                <label>Role</label>
                                <Form.Control
                                  readOnly
                                  value={adminRole?.title}
                                  type="text"
                                ></Form.Control>
                              </Form.Group>
                            </Col>
                          </Row>
                          {/* <Row>
                            <Col md="6">
                              <Form.Group>
                                <label>Role</label>
                                <Form.Control
                                  readOnly
                                  value={adminRole?.title}
                                  type="text"
                                ></Form.Control>
                              </Form.Group>
                            </Col>
                          </Row> */}


                          <Button
                            className="btn-fill pull-right"
                            type="submit"
                            variant="info"

                          >
                            Update Details
                          </Button>
                          <div className="clearfix"></div>
                        </Card.Body>
                      </Card>
                    </Form>
                  </Col>
                  <Col md="4" className="mb-5">
                    <Card className="card-user table-big-boy profile-card-box">
                      <Card.Body>
                        <div className="author">
                          <img
                            alt="..."
                            className="avatar border-gray"
                            src={admin.image ? admin.image : userDefaultImg}
                          ></img>

                          {/* <Card.Title as="h5">{admin.name}</Card.Title> */}
                          <p className="card-description"></p>
                        </div>


                        <Form>
                          <Form.Group className="d-flex flex-wrap align-items-center justify-content-center mb-0 form-control-file-wrapper">
                            <label htmlFor="imageUploader" className="btn btn-info">
                            {admin.image ? `Update Picture`:`Upload Picture`}
                           
                            </label>
                            <Form.Control
                              placeholder="Company"
                              id="imageUploader"
                              type="file"
                              varient="info"
                              accept=".png,.jpeg,.jpg"
                              onChange={async (e) => {
                                // const res = await ENV.uploadImage(e);
                                // setAdmin({ ...admin, image: res ? ENV.uploadedImgPath + res : "" })
                                submitPic(e)
                              }}
                            ></Form.Control>
                            {/* <span className={msg.image ? `` : `d-none`}>
                              <label className="pl-1 text-danger">{msg.image}</label>
                            </span> */}
                            <div className="text-center">
                              <span className={msg.image ? `` : `d-none`}>
                                <label className="pl-1 text-danger">{msg.image}</label>
                              </span>
                              {/* <Button
                                className="btn-fill profileBtn m-0 pull-right update-pic-btn"
                                type="submit"
                                variant="info"

                              >
                                Update Picture
                              </Button> */}
                            </div>

                          </Form.Group>
                        </Form>

                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col sm="12">
                    <Form action="" className="form profile-admin-form" onSubmit={(e) => passwordForm(e)}>
                      <Card className="table-big-boy pb-4">
                        <Card.Header>
                          <Card.Header className="pl-0">
                            <Card.Title as="h4">Change Password</Card.Title>
                          </Card.Header>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md="4">
                              <Form.Group>
                                <label>Current Password<span className="text-danger"> *</span></label>
                                <div className="form-password-eye-box">
                                  <Form.Control
                                    placeholder="Current Password"
                                    type={showPassword ? "text" : "password"}
                                    onChange={(e) => {
                                      setPassword({ ...password, current: e.target.value });
                                    }

                                    }
                                    onInput={() => setPasswordMsgCheck((prevMsg) => (false))}
                                  ></Form.Control>
                                  <button onClick={(e) => showPasswordMethod(e)} className="form-password-eye">
                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                  </button>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md="4">
                              <Form.Group>
                                <label>New Password<span className="text-danger"> *</span></label>
                                <div className="form-password-eye-box">
                                  <Form.Control
                                    placeholder="New Password"
                                    type={showNewPassword ? "text" : "password"}
                                    onChange={(e) => {
                                      setPassword({ ...password, new: e.target.value });
                                    }

                                    }
                                    onInput={() => setPasswordMsgCheck((prevMsg) => (false))}
                                  ></Form.Control>
                                  <button onClick={(e) => showNewPasswordMethod(e)} className="form-password-eye">
                                    <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
                                  </button>
                                </div>
                              </Form.Group>
                            </Col>
                            <Col md="4">
                              <Form.Group>
                                <label>Confirm Password<span className="text-danger"> *</span></label>
                                <div className="form-password-eye-box">
                                  <Form.Control
                                    placeholder="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                                    onInput={() => setPasswordMsgCheck((prevMsg) => (false))}
                                  ></Form.Control>
                                  <button onClick={(e) => showConfirmPasswordMethod(e)} className="form-password-eye">
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                                  </button>
                                </div>
                              </Form.Group>
                            </Col>

                            <span className={passwordMsgCheck ? `` : `d-none`}>
                              <label className="pl-3 text-danger">{passwordMsg}</label>
                            </span>
                          </Row>
                          <Button
                            className="btn-fill pull-right"
                            type="submit"
                            variant="info"
                          >
                            Update Password
                          </Button>
                          <div className="clearfix"></div>
                        </Card.Body>
                      </Card>
                    </Form>
                  </Col>
                </Row>
              </Container>
            </div>
          </Container>
      }


    </>
  );
}

const mapStateToProps = state => ({
  admin: state.admin,
  error: state.error,
  getRoleRes: state.role.getRoleRes
});

export default connect(mapStateToProps, { beforeAdmin, getAdmin, updateAdmin, updatePassword, getRole })(profile);