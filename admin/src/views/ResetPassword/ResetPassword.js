import React from "react";
import './ResetPassword.css'
import { Button, Card, Form, Container, Col } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import { beforeAdmin, resetPassword } from '../Admin/Admin.action';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import MainLogo from "../../assets/img/logo.png";
import validator from 'validator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function ResetPassword(props) {
  const [cardClasses, setCardClasses] = React.useState("card-hidden");
  const [password, setPassword] = React.useState({
    new: '',
    confirm: '',
    _id: window.location.pathname.split('/')[3],
    code: window.location.pathname.split('/')[4]
  })
  const [showPassword, setShowPassword] =  React.useState(false);
  const [showConfirmPassword, setConfirmPassword2] =  React.useState(false);
  const [msg, setMsg] = React.useState({
    new: '',
    confirm: ''
  })

  const Submit = (e) => {
    e.preventDefault()
    if (!validator.isEmpty(password.new) && !validator.isEmpty(password.confirm)) {
      if (password.new === password.confirm) {
        if (validator.isStrongPassword(password.new)) {
          setMsg({ new: '', confirm: '' })
          let params = new URLSearchParams(window.location.search)
          let token = params.get('resetPasswordToken')

          let formData = new FormData()
          formData.append('resetPasswordToken', token)
          formData.append('password', password.new)
          props.resetPassword(formData)

        }
        else {
          setMsg({ new: 'Password must contain Upper Case, Lower Case, a Special Character, a Number and must be at least 8 characters in length', confirm: '' })
        }
      }
      else {
        setMsg({ new: 'New password & confirm password are not same.', confirm: '' })
      }
    }
    else {
      let passNew = '', passConf = ''
      if (validator.isEmpty(password.new)) {
        passNew = 'Please fill new password field.'
      }
      if (validator.isEmpty(password.confirm)) {
        passConf = "Please fill confirm password field."
      }
      setMsg({ new: passNew, confirm: passConf })
    }
  }
  React.useEffect(() => {
    setTimeout(function () {
      setCardClasses("");
    }, 500);
  });
  React.useEffect(() => {
    if (props.admin.resetPasswordAuth) {
      setPassword({ ...password, new: '', confirm: '' })
      props.beforeAdmin()
    }
  }, [props.admin.resetPasswordAuth])

  const showPasswordMethod = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword)
  }
  const showConfirmPasswordMethod = (e) => {
    e.preventDefault();
    setConfirmPassword2(!showConfirmPassword)
  }

  return (
    <>
      <div
        className="full-page section-image"
        data-color="black"
        data-image={require("assets/img/full-screen-image-2.jpg").default}
      >
        <div className="content d-flex align-items-center p-0">
          <Container>
            <Col className="mx-auto" lg="4" md="8">
              <Form action="" className="form" method="">
                <Card className={"card-login " + cardClasses}>
                  <Card.Header className="text-center">
                    <div className="logo-holder d-inline-block align-top">
                      <img src={MainLogo} />
                    </div>
                    <h3 className="header text-center">Reset Password</h3>
                  </Card.Header>
                  <Card.Body>
                    <Card.Body>
                      <Form.Group>
                        <label>New Password</label>
                        <div className="form-password-eye-box">
                          <Form.Control
                            placeholder="New Password"
                            value={password.new}
                            onChange={(e) => setPassword({ ...password, new: e.target.value })}
                            type={showPassword ? "text" : "password"}
                          ></Form.Control>
                          <button onClick={(e) => showPasswordMethod(e)} className="form-password-eye">
                            <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                          </button>
                        </div>
                        <span className={msg.new ? `` : `d-none`}>
                          <label className="pl-1 text-danger">{msg.new}</label>
                        </span>
                      </Form.Group>
                      <Form.Group>
                        <label>Confirm Password</label>
                        <div className="form-password-eye-box">
                          <Form.Control
                            placeholder="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={password.confirm}
                            onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                          ></Form.Control>
                          <button onClick={(e) => showConfirmPasswordMethod(e)} className="form-password-eye">
                            <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                          </button>

                        </div>
                        <span className={msg.confirm ? `` : `d-none`}>
                          <label className="pl-1 text-danger">{msg.confirm}</label>
                        </span>
                      </Form.Group>
                      <NavLink to="/" className="btn-no-bg float-right" type="submit" variant="warning">
                        Login Page
                      </NavLink>

                    </Card.Body>
                  </Card.Body>
                  <Card.Footer className="card-footer ml-auto mr-auto">
                    <Button className="btn-wd btn-info" type="submit" onClick={Submit}>
                      Submit
                    </Button>
                  </Card.Footer>
                </Card>
              </Form>
            </Col>
          </Container>
        </div>
        <div
          className="full-page-background"
          style={{
            backgroundImage:
              "url(" +
              require("assets/img/full-screen-image-2.jpg").default +
              ")",
          }}
        ></div>
      </div>
    </>
  );
}

const mapStateToProps = state => ({
  admin: state.admin,
  error: state.error
});

export default connect(mapStateToProps, { beforeAdmin, resetPassword })(ResetPassword);
