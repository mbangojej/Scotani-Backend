import { useState, useEffect } from "react";
import { ENV } from '../../config/config';
import { getSettings, beforeSettings, editSettings } from './settings.action';
import { connect } from 'react-redux';
import { getRole } from "views/AdminStaff/permissions/permissions.actions";
import FullPageLoader from "components/FullPageLoader/FullPageLoader";
var CryptoJS = require("crypto-js");
import validator from 'validator';

// react-bootstrap components
import {
	Button,
	Card,
	Form,
	Container,
	Row,
	Col,
} from "react-bootstrap";


const SocialSettings = (props) => {

	const [links, setLinks] = useState({
		facebook: '', 
		google:'', 
		linkedin:'',
		twitter: '',

	})
	const [permissions, setPermissions] = useState({})
	const [loader, setLoader] = useState(true)
	const [msg, setMsg] = useState({
		facebook: '', 
		google:'', 
		linkedin:'',
		twitter: '',

	})

	useEffect(() => {
		window.scroll(0, 0)
		const callback=()=>{
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

	useEffect(()=>{
        if (Object.keys(props.getRoleRes).length > 0) {
            setPermissions(props.getRoleRes.role)
        }
    },[props.getRoleRes])

	useEffect(() => {
		if (props.settings.settingsAuth) {
			if (props.settings.settings) {
				setLoader(false)
				setLinks({ ...links, ...props.settings.settings })
			}
			props.beforeSettings()
		}
	}, [props.settings.settingsAuth])

	const save = () => {
		let check = true
		if(!validator.isEmpty(links.facebook) && !validator.isURL(links.facebook)){
			setMsg({facebook : 'Invalid Facebook Url'})
			check = false
		}
		if(!validator.isEmpty(links.twitter) && !validator.isURL(links.twitter)){
			setMsg({twitter : 'Invalid Twitter Url'})
			check = false
		}
		if(!validator.isEmpty(links.google) && !validator.isURL(links.google)){
			setMsg({google : 'Invalid Google Url'})
			check = false
		}
		if(!validator.isEmpty(links.linkedin) && !validator.isURL(links.linkedin)){
			setMsg({linkedin : 'Invalid LinkedIn Url'})
			check = false
		}

		if(check){
			setMsg({})
			let formData = new FormData()
			for (const key in links)
				formData.append(key, links[key])
			const qs = ENV.objectToQueryString({ type: '2' })
			props.editSettings(formData, qs)
			setLoader(true)
		}
	}


	return (
		<>
		{

		loader? <FullPageLoader/> : 
			<Container fluid>
				<Row>
					<Col md="12">
						<Form action="" className="form-horizontal" id="TypeValidation" method="">
							<Card className="table-big-boy">
								<Card.Header>
									<div className="d-block d-md-flex align-items-center justify-content-between">
										<Card.Title as="h4">Social Settings</Card.Title>
									</div>
								</Card.Header>
								
									<Card.Body>
									<Row>  
										
										<Col xl={4} sm={6}>
											<Form.Group>
												<Form.Label className="d-block mb-2">Twitter</Form.Label>
												<Form.Control type="text" value={links.twitter} onChange={(e) => setLinks({ ...links, twitter: e.target.value })}></Form.Control>
											</Form.Group>
											<span className={msg.twitter ? `` : `d-none`}>
												<label className="pl-1 pt-0 text-danger">{msg.twitter}</label>
											</span>

										</Col>
										<Col xl={4} sm={6}>
											<Form.Group>
												<Form.Label className="d-block mb-2">Facebook</Form.Label>
												<Form.Control type="text" value={links.facebook} onChange={(e) => setLinks({ ...links, facebook: e.target.value })}></Form.Control>
											</Form.Group>
											<span className={msg.facebook ? `` : `d-none`}>
												<label className="pl-1 pt-0 text-danger">{msg.facebook}</label>
											</span>

										</Col>
										<Col xl={4} sm={6}>
											<Form.Group>
												<Form.Label className="d-block mb-2">Google</Form.Label>
												<Form.Control type="text" value={links.google} onChange={(e) => setLinks({ ...links, google: e.target.value })}></Form.Control>
											</Form.Group>
											<span className={msg.google ? `` : `d-none`}>
												<label className="pl-1 pt-0 text-danger">{msg.google}</label>
											</span>

										</Col>
										<Col xl={4} sm={6}>
											<Form.Group>
												<Form.Label className="d-block mb-2">LinkedIn</Form.Label>
												<Form.Control type="text" value={links.linkedin} onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}></Form.Control>
											</Form.Group>
											<span className={msg.linkedin ? `` : `d-none`}>
												<label className="pl-1 pt-0 text-danger">{msg.linkedin}</label>
											</span>

										</Col>

										
									</Row>
								</Card.Body>
								<Card.Footer>
									<Row className="float-right">
										{
											permissions && permissions.editSetting &&
												<Col sm={12}>
													<Button variant="info" onClick={save} > Save Settings </Button>
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

export default connect(mapStateToProps, { getSettings, beforeSettings, editSettings, getRole })(SocialSettings);
