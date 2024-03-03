import React from "react";

import './ForgotPassword.css'

// react-bootstrap components
import { Button, Card, Form, Container, Col } from "react-bootstrap";
import validator from 'validator';
import { forgotPassword, beforeAdmin } from '../Admin/Admin.action'
import { connect } from 'react-redux';
import { Alert } from "react-bootstrap";
import AnnexMainLogo from "../../assets/img/logo.png";

function ForgotPassword(props) {
	const [cardClasses, setCardClasses] = React.useState("card-hidden");
	const [email, setEmail] = React.useState('')
	const [emailCheck, setEmailCheck] = React.useState(false)
	const [msg, setMsg] = React.useState('')

	const resetPassword = (e) => {
		e.preventDefault();
		if(validator.isEmpty(email.trim())){
			setEmailCheck(true)
			setMsg("Email address is required")
		}
		else if (!validator.isEmail(email)) {
			setEmailCheck(true)
			setMsg("Enter a valid Email address")
		}
		else {
			setEmailCheck(false)
			props.forgotPassword({ email })
		}
	}
	React.useEffect(() => {
		setTimeout(function () {
			setCardClasses("");
		}, 500);
	});

	React.useEffect(() => {
		if (props.admin.forgotPasswordAuth) {
			setEmail('')
			setMsg(props.admin.forgotMsg)
			props.beforeAdmin()
		}
	}, [props.admin.forgotPasswordAuth])

	const getAlert = () => {
		if (msg) {
			return (
				<Alert variant="info">
					<span>{msg}</span>
				</Alert>
			)
		}
	}
	return (
		<>
			<div className="full-page section-image" data-color="black" data-image={require("assets/img/full-screen-image-2.jpg").default} >
				<div className="content d-flex align-items-center p-0">
					<Container>
						<Col className="mx-auto" lg="4" md="8">
							<Form action="" className="form" method="">
								<Card className={"card-login " + cardClasses}>
									<Card.Header className="text-center">
										<div className="logo-holder d-inline-block align-top">
											<img src={AnnexMainLogo} />
										</div>
									</Card.Header>
									<Card.Body>

									<label className="text-center">Enter the email address registered with your account. We'll send a password reset link to that address.</label>


										{getAlert()}
										<Form.Group>
											<label>Email address</label>
											<Form.Control placeholder="Enter email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
										</Form.Group>
										
										<div className="d-flex justify-content-between align-items-center">
											<Form.Check className="pl-0"></Form.Check>
											<a href="/admin" className="btn-no-bg" type="submit" variant="warning">Login</a>
										</div>
										
									</Card.Body>
									<Card.Footer className="ml-auto mr-auto">
										<Button className="btn-wd btn-info" type="submit" onClick={resetPassword} >Submit</Button>
									</Card.Footer>
								</Card>
							</Form>
						</Col>
					</Container>
				</div>
				<div className="full-page-background" style={{ backgroundImage: "url(" + require("assets/img/full-screen-image-2.jpg").default + ")", }}></div>
			</div>
		</>
	);
}

const mapStateToProps = state => ({
	admin: state.admin,
	error: state.error
});

export default connect(mapStateToProps, { forgotPassword, beforeAdmin })(ForgotPassword);
