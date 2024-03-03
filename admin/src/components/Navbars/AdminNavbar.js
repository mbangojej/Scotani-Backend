
import React, { useRef, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import userDefaultImg from '../../assets/img/profile-user.png';
import { beforeAdmin, getAdmin, updateAdmin, updatePassword } from "views/Admin/Admin.action";
var CryptoJS = require("crypto-js");
import { connect } from 'react-redux';
import { ENV } from '../../config/config';
import { getRole } from "views/AdminStaff/permissions/permissions.actions";

import {
	Button,
	Dropdown,
	Form,
	Navbar,
	Nav,
	Container
} from "react-bootstrap";

function AdminNavbar(props) {

	const [superAdmin, setSuperAdmin] = useState({
		name: '',
		email: '',
		address: '',
		phone: '',
		status: '',
		image: '',
	  })

	  
	  const [loader, setLoader] = useState(true)
	const [collapseOpen, setCollapseOpen] = React.useState(false);

	useEffect(async () => {
		let adminId = localStorage.getItem('userID')
		window.scroll(0, 0)
		// const callback=()=>{
		// 	setLoader(false);
		// }
		setLoader(false);
		// props.getSettings(callback)
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
		if (props.admin.getAuth) {
		  setLoader(false)
		  const { admin } = props.admin
		  setSuperAdmin(admin)
		  props.beforeAdmin()
		}
	  }, [props.admin.getAuth])

	  useEffect(() => {
		if (superAdmin) {
		  setLoader(false)
		}
	  }, [superAdmin])

	return (
		<>
			<Navbar expand="lg">
				<Container fluid>
					<div className="navbar-wrapper">
						<div className="navbar-minimize">
							<Button className="btn-fill btn-icon d-none d-lg-block" onClick={() => document.body.classList.toggle("sidebar-mini")}>
								<i className="fas fa-ellipsis-v visible-on-sidebar-regular"></i>
								<i className="fas fa-bars visible-on-sidebar-mini"></i>
							</Button>
							<Button className="btn-fill btn-icon d-block d-lg-none" onClick={() => document.documentElement.classList.toggle("nav-open")}>
								<i className="fas fa-ellipsis-v visible-on-sidebar-regular"></i>
								<i className="fas fa-bars visible-on-sidebar-mini"></i>
							</Button>
						</div>
					</div>
					<div className="d-flex">
						<Dropdown as={Nav.Item}>
							<Dropdown.Toggle as={Nav.Link} id="dropdown-41471887333" className="user-profile-img" variant="default">
								<img src={superAdmin?.image ? superAdmin.image : userDefaultImg} className="img-fluid"/>
							</Dropdown.Toggle>
							<Dropdown.Menu alignRight aria-labelledby="navbarDropdownMenuLink" >
								<NavLink to="/profile" className="dropdown-item">
									<i className="nc-icon nc-settings-90"></i>
									Profile
								</NavLink>
								<a style={{ "cursor": "pointer" }} className="dropdown-item" onClick={() => { localStorage.removeItem("accessToken"); window.location.replace('/admin'); }}>
									<i className="nc-icon nc-button-power"></i>
									Log out
								</a>
							</Dropdown.Menu>
						</Dropdown>
						<button className="navbar-toggler navbar-toggler-right border-0" type="button" onClick={() => setCollapseOpen(!collapseOpen)}>
							<span className="navbar-toggler-bar burger-lines"></span>
							<span className="navbar-toggler-bar burger-lines"></span>
							<span className="navbar-toggler-bar burger-lines"></span>
						</button>
						{/* <Navbar.Collapse className="justify-content-end" in={collapseOpen}>
					<Nav className="nav mr-auto" navbar>
						<Form className="navbar-form navbar-left navbar-search-form ml-3 ml-lg-0" role="search">
						</Form>
					</Nav>
					<Nav navbar> */}
						{/* <NavLink to="/profile" className="dropdown-item">
							<i className="nc-icon nc-settings-90"></i>
							Profile
						</NavLink>
						<NavLink to="/login" className="dropdown-item">
							<i className="nc-icon nc-button-power"></i>
							Log out
						</NavLink> */}
						{/* </Nav>
				</Navbar.Collapse> */}
					</div>
				</Container>
			</Navbar>
		</>
	);
}

const mapStateToProps = state => ({
	admin: state.admin,
	error: state.error,
	getRoleRes: state.role.getRoleRes
  });
  
  export default connect(mapStateToProps, { beforeAdmin, getAdmin, updateAdmin, updatePassword, getRole })(AdminNavbar);