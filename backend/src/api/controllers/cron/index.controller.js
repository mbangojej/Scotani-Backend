const Customer = require('../../models/customers.model');
const Settings = require('../../models/settings.model');

exports.markCustomersForDeletion = async (req, res, next) => {
  const thresholdDate = new Date();
  const settings = await Settings.findOne({},{userAccountDeletionDays:1}) 
  thresholdDate.setDate(thresholdDate.getDate() - settings.userAccountDeletionDays);

  // Find customers with accountDeactivationRequestDate difference more than 30 days
  const customersToDelete = await Customer.find({
    accountDeactivationRequestDate: { $lte: thresholdDate },
    isDeleted: { $ne: true },
  });

  // Update and mark customers as deleted
  customersToDelete.forEach(async (customer) => {
    customer.isDeleted = true;
    customer.email = `${customer.email}.delete${new Date()}`;
    await customer.save();
    console.log(`Customer marked as deleted: ${customer.email}`);
  });
  if (customersToDelete.length > 0) {
    console.log("many customer");
  } else {
    console.log(`no one`);
  }
  return res.status(200).send({customersToDelete})
}
