const Role = require('../../models/roles.model');
const Admin = require('../../models/admin.model')
const User = require('../../models/admin.model');
const ObjectId = require('mongoose').Types.ObjectId;
// const { checkDuplicate } = require('../middlewares/error');

// API to create role
exports.create = async (req, res, next) => {
    try {
        let role = req.body;

        let roles = await Role.findOne({ title: role.title.toLowerCase() }).lean(true);

        if (roles) {
            return res.status(200).send({ success: false, message: 'Title already exists', role });
        }

        if (role._id === false) {
            delete role._id;
            delete role.createdAt;
            delete role.updatedAt;
        }
        await Role.create(role);
        res.status(200).send({ success: true, message: 'Role created successfully' });
    } catch (error) {
        // if (error.code === 11000 || error.code === 11001)
        // checkDuplicate(error, res, 'Role');
        // else
        next(error);
    }
}

// API to edit role
exports.edit = async (req, res, next) => {
    try {
        let { _id, status, title } = req.body;



        let roles = await Role.findOne({ title: title.toLowerCase() }).lean(true);
        let role = req.body

        if (roles && role._id != roles._id) {
            return res.json({ success: false, exist: true, message: 'Title already exist', role })

        }

        Role.findOne({ _id }, async (err, role) => {
            if (err) return res.status(400).send({ success: false, err });
            else if (role) {

                if (!status) {
                    Admin.updateMany({ roleId: ObjectId(_id) }, { $set: { status: false } }, (err, res) => {
                    });
                }

                for (let x in req.body) // making key value pair 
                    if (typeof req.body[x] != 'string' && req.body[x] != undefined)
                        role[x] = req.body[x]; // for type of array, boolean etc.
                    else if (typeof req.body[x] == 'string' && req.body[x] != '' && req.body[x] != undefined)
                        role[x] = req.body[x];
                await Role.findByIdAndUpdate({ _id }, { $set: role }, (err, result) => {
                    if (err) return res.status(422).send({ success: false, message: err });
                    else {
                        res.status(200).send({ result, success: true, message: 'Role updated successfully' });
                    }
                })
            } else return res.status(400).send({ success: false, message: 'No role found for given Id' });
        });
    } catch (error) {
        next(error);
    }
}

// API to delete role
exports.delete = async (req, res, next) => {
    try {
        let { _id } = req.query;

        let admin = await Admin.findOne({ roleId: _id }).lean(true)
        if (admin) {
            return res.status(400).send({ success: false, message: 'Cannot delete role. Admin found with given role', type: 'exists' });
        } else {
            Role.remove({ _id }, (err, result) => {
                if (err) return res.status(400).send({ success: false, err });
                else if (result.deletedCount > 0) {
                    res.status(200).send({ success: true, message: 'Role deleted successfully' });
                    // setting user role to null
                    User.updateMany({ role: ObjectId(_id) }, { $set: { role: null } }, (err, res) => {

                    });
                }
                else return res.status(400).send({ success: false, message: 'No role found with given id' });
            });
        }
    } catch (error) {
        next(error);
    }
}

// API to get role
exports.get = async (req, res, next) => {
    try {
        let { _id, adminId } = req.query;

        let role = await Role.findOne({ _id })
        let admin = null
        if (adminId) {
            admin = await Admin.findOne({ _id: ObjectId(adminId) }, { _id: 1, status: 1 })
        }
        if (role) {
            return res.status(200).send({ success: true, role, admin });
        } else {
            return res.status(400).send({ success: false, message: 'No role found for given Id' });
        }
    } catch (error) {
        next(error);
    }
}


// API to list all roles
exports.list = async (req, res, next) => {
    try {
        let { page, limit, title, status, all } = req.query;

        page = page != undefined && page != '' ? parseInt(page) : 1;
        limit = limit != undefined && limit != '' ? parseInt(limit) : 10;

        let query = {};

        if (title && title != undefined && title != 'undefined')
            query.title = new RegExp(title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')

        if (status && status != undefined && status != 'undefined')
            query.status = status && status == 'true' ? true : false

        const total = await Role.countDocuments({
            $and: [query, { title: { $ne: "super admin" } }]
        })

        if (all != undefined && all != '')
            limit = await Role.countDocuments({});

        let rolesData = await Role.aggregate([
            {
                $match: {
                    $and: [query, { title: { $ne: "super admin" } }]
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: limit * (page - 1) },
            { $limit: limit }
        ])
        return res.status(200).send({
            data: rolesData,
            page,
            pages: Math.ceil(total / limit) <= 0 ? 1 : Math.ceil(total / limit),
            total, limit,
            success: true
        });


    } catch (error) {
        next(error);
    }
}

// API to get roles list by name only
exports.getRolesByName = (req, res, next) => {
    try {
        let { isPartner } = req.query;
        let filter = { status: true };

        if (isPartner === 'true' || isPartner === true) {
            filter = {
                $and: [
                    { status: true },
                    { title: { $ne: 'admin' } }
                ]
            }
        }


        Role.find(filter, 'title', (err, roles) => {
            if (err) return res.status(400).send({ success: false, err });
            else if (roles)
                return res.status(200).send({ success: true, roles });
        }).sort('title');
    } catch (error) {
        next(error);
    }
}