import { useState, useEffect, useRef } from "react";
import { ENV } from '../../config/config';
import { getSettings, beforeSettings, editSettings } from './settings.action';
import { connect } from 'react-redux';
import { getRole } from "views/AdminStaff/permissions/permissions.actions";
import FullPageLoader from "components/FullPageLoader/FullPageLoader";
var CryptoJS = require("crypto-js");
import validator from 'validator';
import userDefaultImg from '../../assets/img/default-user-icon-13.jpg';
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { Helmet } from 'react-helmet';

const SiteSettings = (props) => {
	const myRef = useRef(null)
	const [permissions, setPermissions] = useState({})
	const [loader, setLoader] = useState(true)
	const [siteLogo, setSiteLogo] = useState('')
	const [splashScreen, setSplashScreen] = useState([])
	const [msg, setMsg] = useState({
		splashScreen: '',
		email: '',
		phone: '',
		mobile: '',
		address: '',
		vatPercentage: '',
		orderEmailRecipients: '',
		backgroundRemovalKey: '',
		userAccountDeletionDays: '',
		registrationEmailRecipients: '',
		instagram: '',
		facebook: '',
		twitter: '',
		linkedin: '',
	})
	useEffect(() => {
		window.scroll(0, 0)
		const callback = () => {
			setLoader(false);
		}
		props.getSettings(callback)
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
	}, [props.getRoleRes])
	useEffect(() => {
		if (props.settings.settingsAuth) {
			if (props.settings.settings) {
				setLoader(false)
				const settingsData = props.settings.settings
				setSettings({
					email: settingsData?.email,
					phone: settingsData?.phone,
					mobile: settingsData?.mobile,
					address: settingsData?.address,
					vatPercentage: settingsData?.vatPercentage,
					orderEmailRecipients: settingsData?.orderEmailRecipients,
					// backgroundRemovalKey: settingsData?.backgroundRemovalKey,
					userAccountDeletionDays: settingsData?.userAccountDeletionDays,
					registrationEmailRecipients: settingsData?.registrationEmailRecipients,
					instagram: settingsData?.instagram,
					facebook: settingsData?.facebook,
					twitter: settingsData?.twitter,
					linkedin: settingsData?.linkedin,
				})
				setSplashScreen(arr => [...settingsData.splashScreen])
				if (siteLogo === '') {
					setSiteLogo(settingsData.siteLogo)
				}
			}
			props.beforeSettings()
		}
	}, [props.settings.settingsAuth])
	const [settings, setSettings] = useState({
		email: '',
		phone: '',
		mobile: '',
		address: '',
		vatPercentage: '',
		orderEmailRecipients: '',
		// backgroundRemovalKey: '',
		userAccountDeletionDays: '',
		registrationEmailRecipients: '',
		instagram: '',
		facebook: '',
		twitter: '',
		linkedin: ''
	})
	function isValidUrl(string) {
		try {
			new URL(string);
			return true;
		} catch (err) {
			return false;
		}
	}
	const submit = () => {
		let errors = {}
		let check = true
		let emailcheck = true
		let emailcheck1 = true
		let splashScreenDataCheck = true


		if (splashScreen.length > 0) {
			splashScreen.map((splash, index) => {
				if (validator.isEmpty(splash.image) || validator.isEmpty(splash.text)) {
					splashScreenDataCheck = false
				}
			})
		}
		let mobileMsg = ''
		let phoneMsg = ''
		if (settings.mobile) {
			const numericMobileNo = settings.mobile.replace(/[^0-9+]/g, '');
			if (numericMobileNo.length < 7 || numericMobileNo.length > 15) {
				mobileMsg = 'Mobile number must be between 7 and 15 digits.'
				check = false
			} else if (numericMobileNo[0] === '0' || (numericMobileNo[0] !== '+' && numericMobileNo[0] === '0')) {
				mobileMsg = 'Mobile number cannot start with zero'
				check = false
			}
		}
		if (settings.phone) {
			const numericPhoneNo = settings.phone.replace(/[^0-9+]/g, '');
			if (numericPhoneNo.length < 7 || numericPhoneNo.length > 15) {
				phoneMsg = 'Phone number must be between 7 and 15 digits.'
				check = false
			} else if (numericPhoneNo[0] === '0' || (numericPhoneNo[0] !== '+' && numericPhoneNo[0] === '0')) {
				phoneMsg = 'Phone number cannot start with zero'
				check = false
			}
		}
		errors = {
			splashScreen: splashScreenDataCheck === false ? 'Splash Data is required' : '',
			email: validator.isEmpty(settings.email) ? 'Email is required' : !validator.isEmpty(settings.email) && !validator.isEmail(settings.email) ? 'Please input valid email' : '',
			phone: validator.isEmpty(settings.phone) ? 'Phone is required' : !validator.isEmpty(settings.phone) ? phoneMsg : '',
			mobile: validator.isEmpty(settings.mobile) ? 'Mobile is required' : !validator.isEmpty(settings.mobile) ? mobileMsg : '',
			address: validator.isEmpty(settings.address) ? 'Address is required' : '',
			// backgroundRemovalKey: validator.isEmpty(settings.backgroundRemovalKey) ? 'Background Removal Key is required' : '',
			userAccountDeletionDays: settings.userAccountDeletionDays == ""  ? 'Account Deletion Days are required' : '',
			vatPercentage: !settings.vatPercentage ? 'Vat Percentage is required' : !validator.isFloat(settings.vatPercentage) ? 'Please input correct format.' : (settings.vatPercentage < 0 || settings.vatPercentage > 100 ? "VAT Percentage must be between 0 and 100" : ''),
			instagram: !validator.isEmpty(settings.instagram) && !isValidUrl(settings.instagram) ? 'Invalid URL' : '',
			facebook: !validator.isEmpty(settings.facebook) && !isValidUrl(settings.facebook) ? 'Invalid URL' : '',
			twitter: !validator.isEmpty(settings.twitter) && !isValidUrl(settings.twitter) ? 'Invalid URL' : '',
			linkedin: !validator.isEmpty(settings.linkedin) && !isValidUrl(settings.linkedin) ? 'Invalid URL' : '',
		}
		const match = settings.orderEmailRecipients.split(',')
		for (var a in match) {
			var variable = match[a]
			if (!validator.isEmail(variable)) {
				errors = { ...errors, orderEmailRecipients: !validator.isEmail(variable) ? 'Please input valid email' : '' }
				emailcheck = false
				myRef.current.scrollIntoView()
			}
		}
		const match1 = settings.registrationEmailRecipients.split(',')
		for (var a in match1) {
			var variable = match1[a]
			if (!validator.isEmail(variable)) {
				errors = { ...errors, registrationEmailRecipients: !validator.isEmail(variable) ? 'Please input valid email' : '' }
				emailcheck1 = false
				myRef.current.scrollIntoView()
			}
		}
		setMsg(errors)
		if (Object.values(errors).some(value => value.length > 0)) {
			check = false
			myRef.current.scrollIntoView()
			return;
		}
		if (check && emailcheck && emailcheck1 && splashScreenDataCheck) {

			let payload = {
				splashScreen: splashScreen,
				email: settings.email,
				phone: settings.phone,
				mobile: settings.mobile,
				address: settings.address,
				vatPercentage: settings.vatPercentage,
				orderEmailRecipients: settings.orderEmailRecipients,
				backgroundRemovalKey: parseInt(settings.backgroundRemovalKey),
				userAccountDeletionDays: settings.userAccountDeletionDays,
				registrationEmailRecipients: settings.registrationEmailRecipients,
				instagram: settings.instagram,
				facebook: settings.facebook,
				twitter: settings.twitter,
				linkedin: settings.linkedin,
			}
			const qs = ENV.objectToQueryString({ type: '1' })
			props.editSettings(payload, qs)
			setLoader(true)
		}
		else {
			myRef.current.scrollIntoView()
		}
	}
	const addSplash = () => {
		setSplashScreen(arr => [...arr, {
			text: "",
			image: ""
		}]);
	}
	const removeSplash = (index) => {
		let splashScreen_ = splashScreen
		splashScreen_.splice(index, 1)
		setSplashScreen(arr => [...splashScreen_]);
	}
	const updateSplash = (data, type, index) => {
		let splashScreen_ = splashScreen
		splashScreen_[index][type] = data
		setSplashScreen(arr => [...splashScreen_]);
	}

	return (
		<>
			<Helmet>
				<title>Scotani | Admin Panel | Site Settings</title>
			</Helmet>
			{
				loader ? <FullPageLoader /> :
					<Container fluid>
						<Row >
							<Col md="12">
								<Form action="" className="form-horizontal settings-form" id="TypeValidation" method="">
									<Card className="table-big-boy">
										<Card.Header>
											<div className="d-block d-md-flex align-items-center justify-content-between">
												<Card.Title as="h4">Site Settings</Card.Title>
											</div>
										</Card.Header>
										<Card.Body>
											<Row>
												<Col sm={12}>
													<p className="mb-4">
														<strong>Mobile Welcome Screens Text</strong>
														<span
															className="btn-action btn-success"
															type="button"
															variant="success" title="Add Splash Text"
															onClick={() => addSplash()}
														>
															<i className="fas fa-plus"></i>
														</span>
													</p>
												</Col>
												<Col sm={12}>
													<Form.Group className="form-cache-error">
														<table style={{ width: "100%" }}>
															{
																splashScreen.length > 0 ? splashScreen.map((splash, index) => {
																	return (
																		<tr key={index}>
																			<td style={{ width: "70%" }}>
																				<Form.Control type="text" value={splash.text} onChange={(e) => { updateSplash(e.target.value, 'text', index) }}
																					onInput={() => setMsg((prevMsg) => ({ ...prevMsg, splashScreen: '' }))}
																				></Form.Control>
																			</td>
																			<td style={{ width: "20%" }}>
																				<Form.Group className="text-center">
																					<div className='mb-2'>
																						{<img className="img-thumbnail" src={splash.image ? ENV.uploadedImgPath + splash.image : userDefaultImg} onError={(e) => { e.target.onerror = null; e.target.src = userDefaultImg }} style={{ width: '100px' }} />}
																					</div>
																					<Form.Control
																						className='text-white'
																						onChange={async (e) => {
																							const res = await ENV.uploadImage(e);
																							updateSplash(res ? res : '', 'image', index)
																						}}
																						accept="image/*"
																						type="file"
																					></Form.Control>
																				</Form.Group>
																			</td>
																			<td style={{ width: "30%" }}>
																				<ul className="d-inline-block list-unstyled mb-0">
																					{splashScreen.length > 1 &&
																						<li className="d-inline-block align-top">
																							<Button
																								className="btn-action btn-danger"
																								type="button"
																								variant="danger" title="Delete onBoarding Text"
																								onClick={() => removeSplash(index)}
																							>
																								<i className="fas fa-trash"></i>
																							</Button>
																						</li>
																					}
																					{(splashScreen.length - 1) == index &&
																						<li className="d-inline-block align-top">
																							<Button
																								className="btn-action btn-success"
																								type="button"
																								variant="success" title="Add onBoarding Text"
																								onClick={() => addSplash()}
																							>
																								<i className="fas fa-plus"></i>
																							</Button>
																						</li>
																					}
																				</ul>
																			</td>
																		</tr>
																	)

																})
																	:
																	<Form.Label className="d-block mb-2">Kindly add onBoarding screen text </Form.Label>
															}
														</table>
														<span className={msg.splashScreen ? `` : `d-none field-info-error`}>
															<label className="pl-1 text-danger">{msg.splashScreen}</label>
														</span>
													</Form.Group>

												</Col>
												<Col sm={12} ref={myRef}>
													<p className="mb-4"><strong>Contact Information</strong></p>
												</Col>
												<Col sm={12}>
													<Row >
														<Col xl={4} sm={6}>
															<Form.Group>
																<Form.Label className="d-block mb-2">Email<span className="text-danger"> *</span></Form.Label>
																<Form.Control type="email" value={settings.email} onChange={(e) => { setSettings({ ...settings, email: e.target.value }) }}
																	onInput={() => setMsg((prevMsg) => ({ ...prevMsg, email: '' }))}
																></Form.Control>
																<span className={msg.email ? `` : `d-none`}>
																	<label className="pl-1 text-danger">{msg.email}</label>
																</span>
															</Form.Group>


														</Col>
														<Col xl={4} sm={6}>
															<Form.Group>
																<Form.Label className="d-block mb-2">Phone Number<span className="text-danger"> *</span></Form.Label>
																<Form.Control type="tel" value={settings.phone} onChange={(e) => { setSettings({ ...settings, phone: e.target.value }) }}
																	onInput={() => setMsg((prevMsg) => ({ ...prevMsg, phone: '' }))}
																></Form.Control>
																<span className={msg.phone ? `` : `d-none`}>
																	<label className="pl-1 text-danger">{msg.phone}</label>
																</span>
															</Form.Group>


														</Col>
														<Col xl={4} sm={6}>
															<Form.Group>
																<Form.Label className="d-block mb-2">Mobile Number<span className="text-danger"> *</span></Form.Label>
																<Form.Control type="tel" value={settings.mobile} onChange={(e) => { setSettings({ ...settings, mobile: e.target.value }) }}
																	onInput={() => setMsg((prevMsg) => ({ ...prevMsg, mobile: '' }))}
																></Form.Control>
																<span className={msg.mobile ? `` : `d-none`}>
																	<label className="pl-1 text-danger">{msg.mobile}</label>
																</span>
															</Form.Group>


														</Col>
														<Col xl={8} sm={6}>
															<Form.Group>
																<Form.Label className="d-block mb-2"> Address<span className="text-danger"> *</span></Form.Label>
																<Form.Control type="text" value={settings.address} onChange={(e) => { setSettings({ ...settings, address: e.target.value }) }}
																	onInput={() => setMsg((prevMsg) => ({ ...prevMsg, address: '' }))}
																></Form.Control>
																<span className={msg.address ? `` : `d-none`}>
																	<label className="pl-1 text-danger">{msg.address}</label>
																</span>
															</Form.Group>

														</Col>
														<Col xl={4} sm={6}>
															<Form.Group>
																<Form.Label className="d-block mb-2">VAT Percentage<span className="text-danger"> *</span></Form.Label>
																<Form.Control type="number" min={0} max={100} value={settings.vatPercentage} onChange={(e) => { setSettings({ ...settings, vatPercentage: e.target.value }) }}
																	onInput={() => setMsg((prevMsg) => ({ ...prevMsg, vatPercentage: '' }))}
																></Form.Control>
																<span className={msg.vatPercentage ? `` : `d-none`}>
																	<label className="pl-1 text-danger">{msg.vatPercentage}</label>
																</span>
															</Form.Group>

														</Col>
													</Row>
												</Col>
											</Row>
											<hr />
											<Row>
												<Col sm={12}>
													<p className="mb-4"><strong>Social Media Information</strong></p>
												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Instagram</Form.Label>
														<Form.Control type="url" value={settings.instagram} onChange={(e) => { setSettings({ ...settings, instagram: e.target.value }) }}></Form.Control>
														<span className={msg.instagram ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.instagram}</label>
														</span>
													</Form.Group>

												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Facebook</Form.Label>
														<Form.Control type="url" value={settings.facebook} onChange={(e) => { setSettings({ ...settings, facebook: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, facebook: '' }))}
														></Form.Control>
														<span className={msg.facebook ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.facebook}</label>
														</span>
													</Form.Group>

												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Twitter</Form.Label>
														<Form.Control type="url" value={settings.twitter} onChange={(e) => { setSettings({ ...settings, twitter: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, twitter: '' }))}
														></Form.Control>
														<span className={msg.twitter ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.twitter}</label>
														</span>
													</Form.Group>

												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Linkedin</Form.Label>
														<Form.Control type="url" value={settings.linkedin} onChange={(e) => { setSettings({ ...settings, linkedin: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, linkedin: '' }))}
														></Form.Control>
														<span className={msg.linkedin ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.linkedin}</label>
														</span>
													</Form.Group>

												</Col>

											</Row>
											<hr />
											<Row>
												<Col sm={12}>
													<p className="mb-4"><strong>Email Settings</strong></p>
												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Order Email Recipients<span className="text-danger"> *</span></Form.Label>
														<Form.Control type="email" value={settings.orderEmailRecipients} onChange={(e) => { setSettings({ ...settings, orderEmailRecipients: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, orderEmailRecipients: '' }))}
															placeholder="Enter Email1,Email2,Email3…"
														></Form.Control>
														<span className={msg.orderEmailRecipients ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.orderEmailRecipients}</label>
														</span>
													</Form.Group>

												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Registration Email Recipients<span className="text-danger"> *</span></Form.Label>
														<Form.Control type="email" value={settings.registrationEmailRecipients} onChange={(e) => { setSettings({ ...settings, registrationEmailRecipients: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, registrationEmailRecipients: '' }))}
															placeholder="Enter Email1,Email2,Email3…"
														></Form.Control>
														<span className={msg.registrationEmailRecipients ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.registrationEmailRecipients}</label>
														</span>
													</Form.Group>


												</Col>


											</Row>
											<hr />
											{/* <Row>
												<Col sm={12}>
													<p className="mb-4"><strong>Background Removal API Key</strong></p>
												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Key <span className="text-danger"> *</span>  <small> <a href="https://www.remove.bg/" target="_blank">Remove Background App</a> </small></Form.Label>
														<Form.Control type="email" value={settings.backgroundRemovalKey} onChange={(e) => { setSettings({ ...settings, backgroundRemovalKey: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, backgroundRemovalKey: '' }))}
															placeholder="Enter Api Key"
														></Form.Control>
														<span className={msg.backgroundRemovalKey ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.backgroundRemovalKey}</label>
														</span>
													</Form.Group>

												</Col>
												<Col xl={6} sm={6}>
												</Col>
											</Row> */}
											<Row>
												<Col sm={12}>
													<p className="mb-4"><strong>User Account Deletion Request</strong></p>
												</Col>
												<Col xl={6} sm={6}>
													<Form.Group>
														<Form.Label className="d-block mb-2">Delete after request in days <span className="text-danger"> *</span>   </Form.Label>
														<Form.Control type="number" value={settings.userAccountDeletionDays} onChange={(e) => { setSettings({ ...settings, userAccountDeletionDays: e.target.value }) }}
															onInput={() => setMsg((prevMsg) => ({ ...prevMsg, userAccountDeletionDays: '' }))}
															placeholder="Enter Days"
														></Form.Control>
														<span className={msg.userAccountDeletionDays ? `` : `d-none`}>
															<label className="pl-1 text-danger">{msg.userAccountDeletionDays}</label>
														</span>
													</Form.Group>

												</Col>
												<Col xl={6} sm={6}>
												</Col>
											</Row>
										</Card.Body>


										<Card.Footer>
											<Row className="float-right">
												{
													permissions && permissions.editSetting &&
													<Col sm={12}>
														<Button variant="info" onClick={submit}>Save Settings</Button>
													</Col>
												}
											</Row>
										</Card.Footer>


									</Card>
								</Form>
							</Col>
						</Row>
					</Container>
			}
		</>
	);
}

const mapStateToProps = state => ({
	settings: state.settings,
	error: state.error,
	getRoleRes: state.role.getRoleRes

});

export default connect(mapStateToProps, { getSettings, beforeSettings, editSettings, getRole })(SiteSettings);
