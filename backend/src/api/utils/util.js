var fs = require('fs');
const Order = require('../models/order.model')
const Settings = require('../models/settings.model')
const User = require('../models/customers.model')
const Notification = require('../models/notification.model');
var html_to_pdf = require('html-pdf-node');
const { uploadedImgPath, removeBgApiKey } = require("../../config/vars");
const moment = require('moment')
const mongoose = require('mongoose');
const { sendPushNotification } = require('../../config/firebase')
const FormData = require('form-data');
const axios = require('axios')

exports.removeBackground = async (image, pathToSave) => {
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_url', image);
    const settings = await Settings.findOne({}, { backgroundRemovalKey: 1 })
    console.log("🚀 ~ file: util.js:28 ~ exports.removeBackground= ~ settings:", settings)
    console.log("🚀 ~ file: util.js:30 ~ exports.removeBackground= ~ settings.removeBgApiKey:", settings.backgroundRemovalKey)
    // backgroundRemovalKey
    // try{
    let response = await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: formData,
        responseType: 'arraybuffer',
        headers: {
            ...formData.getHeaders(),
            'X-Api-Key': settings.backgroundRemovalKey,
        },
        encoding: null
    })
    await fs.writeFile(pathToSave, response.data, "binary", (err) => {
        if (!err) console.log(`${pathToSave} created successfully!`);
    })
    // }catch(e){
    //     console.log("🚀 ~ file: util.js:37 ~ exports.removeBackground= ~ e:")
    // }
}
//function to generate an invoice PDF
exports.invoicePDF = async (orderId) => {

    // Fetch the order data based on the orderId
    const order = await Order.findOne({ _id: mongoose.Types.ObjectId(orderId) })
        .populate({
            path: 'systemProducts.productId',
            model: 'Product',

        })
        .populate({
            path: 'nonSystemProducts.productId',
            model: 'Product',

        })
        .populate({
            path: 'customer',
            model: 'Customer',

        })
        .lean(true)

    //Update 31-10-2023
    //NOTE:Extracting the text before the first space character from the 'order.customer.email' string in case of deleted customer
    const emailBeforeExtract = order.customer.email
    const firstSpaceIndex = emailBeforeExtract.indexOf(' ');
    let extractedEmail;
    if (firstSpaceIndex !== -1) {
        extractedEmail = emailBeforeExtract.substring(0, firstSpaceIndex);
    } else {
        extractedEmail = emailBeforeExtract;
    }


    let invoice = {
        shipping: {
            name: order.customer.customername,
            email: extractedEmail,
            mobile: order.customer.mobile,
            address: order.customer.address,
        },
        systemProducts: [],
        nonSystemProducts: [],
        vatPercentage: order.vatPercentage,
        vatLabel: order.vatLabel,
        subtotal: order.subTotal,
        taxtTotal: order.taxTotal,
        discountTotal: order.discountTotal,
        grandTotal: order.grandTotal,
        refundedAmount: order.refundedAmount,
        paid: order.paidAmount,
        invoice_nr: "INV" + order.orderNumber.toString().padStart(5, 0),
        order_nr: "SC" + order.orderNumber.toString().padStart(5, 0),
        currency: { symbol: "$", code: "" },
        customerAddress: order.customerAddress,
        createdAt: moment(order.createdAt).format('MM-DD-YYYY'),
        transactionId: order.transactionId,
        transactionPlatform: order.transactionPlatform,
    };

    // Process system products
    order.systemProducts.forEach(async (product) => {
        //Update 31-10-2023
        //NOTE: Using a regular expression to capture the text before any specified day names (Mon, Tues, Wed, etc.) IN case of delete product
        let extractedTitle;
        let matchExtractedTitle = product.productId.title.match(/(.*?)\b(?:Mon|Tue|Wed|Thur|Fri|Sat|Sun)/);
        if (matchExtractedTitle) {
            extractedTitle = matchExtractedTitle[1];
        } else {
            extractedTitle = product.productId.title;
        }
        let obj_ = {
            item: extractedTitle,
            quantity: product.quantity,
            price: product.price,
            subTotal: product.subTotal,
            isRefunded: product.isRefunded,
        }

        invoice.systemProducts.push(obj_)
    })
    // Process non-system products
    order.nonSystemProducts.forEach(async (product) => {
        //Update 01-10-2023
        //NOTE: Using a regular expression to capture the text before any specified day names (Mon, Tues, Wed, etc.) IN case of delete product
        let extractedTitle = '';
        if (product.productId) {

            let matchExtractedTitle = product.productId.title.match(/(.*?)\b(?:Mon|Tue|Wed|Thur|Fri|Sat|Sun)/);
            if (matchExtractedTitle) {
                extractedTitle = matchExtractedTitle[1];
            } else {
                extractedTitle = product.productId.title;
            }
        }

        let obj_ = {
            item: product.productId ? extractedTitle : "",
            subTitle: product.designs[0].prompt,
            color: product.color,
            bodyPart: product.bodyPart,
            subTotal: product.subTotal,
            isRefunded: product.isRefunded,
            innerDesign: [],
        };

        product.designs.forEach((design) => {
            let inner_obj_ = {
                image: design.image,
                quantity: design.quantity,
                price: design.price,
            };
            obj_.innerDesign.push(inner_obj_);
        });

        invoice.nonSystemProducts.push(obj_);
    });


    const settings = await Settings.findOne().lean(true)
    // Define the HTML template for the PDF
    let options = {
        format: 'A4',
        path: `./src/uploads/invoices/INV${order.orderNumber.toString().padStart(5, 0)}.pdf`,
        displayHeaderFooter: true,
        headerTemplate: `<p></p>`,
        footerTemplate: `<div class="footer" style="width: 1000px; margin:0 50px;" ><p>
          <table style="width: 100%;border-collapse: collapse;font-size: 8px;line-height: normal; padding: 4px 8px;">
              <tbody>
                  <tr>
                      <td  style="background-color: #c1c4c7;border-radius: 20px;
                      height: 15px;width: 100%;">
                      </td>
                  </tr>
              </tbody>
          </table>
          </p></div>`,
        margin: {
            top: '40px',
            bottom: '200px',
            left: '40px',
            right: '40px'
        }
    };
    let html = `<!DOCTYPE html>
  <html lang="en">
    <body style="margin:0; font-size: 16px;line-height: 18px; background:#fff;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="width: 1000px; margin:0 auto; background:#fff; color:#000;">
              <table style="width: 1000px;margin: 30px 0 50px;">
                  <tbody><tr style="vertical-align:top;">
                      <td style="width: 1000px; text-align: left;vertical-align:middle; padding-bottom: 40px;">
                          <img src="${uploadedImgPath}logo.png" alt="main-logo" title="logo" width="150px">
                          
                          <h2 style="text-decoration: underline; font-size: 22px; font-weight: bold;text-transform: capitalize; text-align: center;margin-top: 0;">Invoice ${invoice.invoice_nr}</h2>
                      </td>
              
                  </tr>
                  <tr style="vertical-align:top;">
                      <td style="vertical-align:top;">
                          <table style="width: 100%;border-collapse: collapse;font-size: 16px;line-height: 18px; padding: 4px 8px;">
                              <tbody>
                                  <tr>
                                      
                                    <td style="width: 500px;padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 0;">
                                        <p style="margin:0 0 5px 0; border-bottom: 1px solid black;">${settings.address}</p>
                                          <p style="margin:0 0 5px 0;">${invoice.shipping.name}</p>
                                          <p style="margin:0 0 5px 0;">${invoice.shipping.mobile}</p>
                                          <p style="margin:0 0 5px 0;">${invoice.shipping.email}</p>
                                          <p style="margin:0 0 5px 0;">${invoice.shipping.address}</p>
                            
                                         
                                      </td>
                                      <td style="width: 500px;padding: 0.75rem;vertical-align: top;padding-bottom: 0;">
                                          <h2 style="text-decoration: underline; font-size: 22px; font-weight: bold;text-transform: capitalize; text-align: center;margin-top: 0;">Delivery note/invoice</h2>
                                          <table style="width: 100%;border-collapse: collapse;font-size: 16px;line-height: 18px; padding: 4px 8px; border: 2px solid #32383e;">
                                              <tr>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding: 10px 5px 0;font-size: 16px;">Invoice no.:</td>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;font-weight: bold;padding: 10px 5px 0;font-size: 16px;">${invoice.invoice_nr}</td>
                                              </tr>
                                              <tr>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding:5px 5px 5px;font-size: 16px;">Date of invoice:</td>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;font-weight: bold;padding:5px 5px 5px;font-size: 16px;">${invoice.createdAt}</td>
                                              </tr>

                                              <tr>
                                              <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding:5px 5px 5px;font-size: 16px;">Payment Status:</td>
                                              <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;font-weight: bold;padding:5px 5px 5px;font-size: 16px;">`
    invoice.paid == 0 ?
        html += `<span bg="danger" class="badge badge-danger">Unpaid</span>` : ``

    invoice.grandTotal - invoice.paid == 0 ?
        html += `<span bg="success" class="badge badge-success">Paid</span>` : ``

    invoice.paid > 0 && invoice.grandTotal > invoice.paid ?
        html += `<span bg="warning" class="badge badge-warning">Partially Paid</span>` : ``


    html += `</td> </tr>`
    invoice.transactionPlatform ?
        html += `<tr>
                                          <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding:5px 5px 5px;font-size: 16px;">Transaction Platform:</td>
                                          <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;font-weight: bold;padding:5px 5px 5px;font-size: 16px;">


    
        <span bg="warning" class="badge badge-warning">${invoice.transactionPlatform}</span></td> </tr>` : ''
    invoice.transactionId ?
        html += `<tr>
                                      <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding:5px 5px 5px;font-size: 16px;">Transaction ID:</td>
                                      <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;font-weight: bold;padding:5px 5px 5px;font-size: 16px;">


  
        <span bg="warning" class="badge badge-warning">${invoice.transactionId}</span></td> </tr>` : ''

    html += ` </table>
                                      </td>  
                                  </tr>

                                  <tr>
                                      <td style="width: 500px;padding: 0.75rem;vertical-align: top;padding-top: 0;padding-bottom: 40px;">
                                      </td>
                                      <td style="width: 500px;padding: 0.75rem;vertical-align: top;padding-top: 0;padding-bottom: 40px;">
                                          <table style="width: 100%;border-collapse: collapse;font-size: 16px;line-height: 18px;">
                                            
                                              <tr>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding:5px 5px 0;font-size: 16px;">Your Order:</td>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;padding:5px 5px 0;font-size: 16px;">${invoice.order_nr}</td>
                                              </tr>
                                              <tr>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: left;padding:5px 5px 0;font-size: 16px;">Ordered on:</td>
                                                  <td style="border-collapse: collapse;text-transform: capitalize;text-align: right;padding: 5px 5px 0;font-size: 16px;">${invoice.createdAt}</td>
                                              </tr>
                                          </table>
                                      </td> 
                                  </tr>
                                  <tr>`
    if (invoice.systemProducts.length > 0) {
        html += `               <tr>
                                  <td colspan="2" style="padding: 0 0 20px;">
                                      <h2 style="text-decoration: underline; font-size: 18px; font-weight: bold; text-transform: capitalize; text-align: left;">System Products</h2>
                                  </td>
                                 </tr>
                                  <tr>
                                      <td colspan="2" style="padding:0 0 20px">
                                          <table style="width: 100%;border-collapse: collapse;border: 1px solid #dee2e6;font-size: 16px;line-height: 18px; padding: 4px 8px;">
                                              <thead>
                                                  <tr>
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">#</th>

                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Product</th>
                                                      
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Unit Price</th>
                                                      
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Quantity</th>
                                                      

                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;fontQsize: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Sub Total</th>
                                                  </tr>
                                              </thead>
                                              <tbody>`

        invoice.systemProducts.map((item, index) => {
            html += `<tr>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${index + 1}</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${item.item} ${item.isRefunded ? '( Refunded )' : ''}</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${invoice.currency.symbol}${parseFloat(item.price).toFixed(2)} ${invoice.currency.code} </td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${item.quantity}</td>
                                                         
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${invoice.currency.symbol}${parseFloat(item.subTotal).toFixed(2)} ${invoice.currency.code}</td>
  
                                                  </tr>`
        })
        html += `</tbody> </table>
        </td>
    </tr>`
    }

    if (invoice.nonSystemProducts.length > 0) {

        html += `<tr>
                                  <td colspan="2" style="padding: 0 0 20px;">
                                      <h2 style="text-decoration: underline; font-size: 18px; font-weight: bold; text-transform: capitalize; text-align: left;">Non-System Products</h2>
                                  </td>
                                 </tr>
                                  <tr>
                                      <td colspan="2" style="padding:0 0 20px">
                                          <table style="width: 100%;border-collapse: collapse;border: 1px solid #dee2e6;font-size: 16px;line-height: 18px; padding: 4px 8px;">
                                              <thead>
                                                  <tr>
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">#</th>

                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Product</th>
                                                      
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Design</th>
                                                      
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;font-size: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Body Part</th>
                                                      
                                                     <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;fontQsize: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Color</th>
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;fontQsize: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Price</th>
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;fontQsize: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Quantity</th>
                                                      <th style="border-collapse: collapse;text-align: left;text-transform: capitalize; font-weight: 600;padding: 0.75rem;fontQsize: 16px;
                                                      background-color: #9e9e9e52;border-bottom: 2px solid #dee2e6; border-color: #9e9e9e52; border-top: 1px solid #dee2e6;">Sub Total</th>
                                                  </tr>
                                              </thead>
                                              <tbody>`

        invoice.nonSystemProducts.map((item, index) => {
            html += `<tr>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${index + 1}</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${item.item} Prompt: ${item.subTitle}  ${item.isRefunded ? '( Refunded )' : ''}</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">
                                                      <Table bordered size="sm">
                                                      <tbody>`
            item.innerDesign.map((design, index) => {
                html += `<tr><th style="font-weight: 600; margin-right: 5px; display: block;">Design ${index + 1}</th></tr>`
                html += `<tr>
                            <td style="text-align:center">Quantity: ${design.quantity} </td>
                        </tr>
                        <tr>
                            <td style="text-align:center">Price: ${invoice.currency.symbol}${design.price} ${invoice.currency.code} </td>
                        </tr>`
            })

            html += `</table>
                                                      </td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${exports.getMatchValue(item.bodyPart, 1)}</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;"> ${exports.getMatchValue(item.color, 2)}</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${item.price ? item.price : ""} </td>
                                                      <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${item.quantity ? item.quantity : ""} </td>
                                                     <td style="padding: 0.75rem;vertical-align: top;border-top: 1px solid #dee2e6;">${invoice.currency.symbol}${parseFloat(item.subTotal).toFixed(2)} ${invoice.currency.code}</td>
  
                                                  </tr>`
        })

        html += `</tbody>
                                          </table>
                                      </td>

                                      
                                  </tr>`
    }
    html += `                          <tr>
                                      <td style="width: 500px;"></td>
                                      <td style="width: 500px; padding:0 0 20px;">
                                          <table style="width: 100%;border-collapse: collapse;font-size: 16px;line-height: 18px; padding: 4px 8px;">
                                              <tbody>
                                                  <tr>
                                                      <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 0;text-align: right;">Sub Total:</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 0;text-align: right;">${invoice.currency.symbol}${parseFloat(invoice.subtotal).toFixed(2)} ${invoice.currency.code}</td>
                                                  </tr>

                                                  <tr>
                                                  <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 0;text-align: right;">Discount:</td>
                                                  <td style="padding: 0.75rem;vertical-align: top;padding-bottom: 5px;text-align: right;">${invoice.currency.symbol}${parseFloat(invoice.discountTotal).toFixed(2)} ${invoice.currency.code}</td>
                                              </tr>
                                              <tr>
                                                  <td style="padding: 0.75rem;vertical-align: top;padding-bottom: 5px;text-align: right;">VAT (${invoice.vatPercentage} %):</td>
                                                  <td style="padding: 0.75rem;vertical-align: top;padding-bottom: 5px;text-align: right;">${invoice.currency.symbol}${parseFloat(invoice.taxtTotal).toFixed(2)} ${invoice.currency.code}</td>
                                              </tr>


                                                  <tr>
                                                      <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 5px;text-align: right;">Grand Total:</td>
                                                      <td style="padding: 0.75rem;vertical-align: top;text-align: right;padding-bottom: 5px;border-top: 1px solid #000;border-bottom: 4px double #000;font-weight: bold;">${invoice.currency.symbol}${parseFloat(invoice.grandTotal).toFixed(2)} ${invoice.currency.code}</td>
                                                  </tr>`
    if (invoice.paid > 0) {
        html += `<tr>
                                                            <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 5px;text-align: right;">Paid Amount:</td>
                                                            <td style="padding: 0.75rem;vertical-align: top;text-align: right;padding-bottom: 5px;border-top: 1px solid #000;border-bottom: 4px double #000;font-weight: bold;">${invoice.currency.symbol}${parseFloat(invoice.paid).toFixed(2)} ${invoice.currency.code}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 5px;text-align: right;">Remaining Amount:</td>
                                                            <td style="padding: 0.75rem;vertical-align: top;text-align: right;padding-bottom: 5px;border-top: 1px solid #000;border-bottom: 4px double #000;font-weight: bold;">${invoice.currency.symbol}${parseFloat(invoice.grandTotal.toFixed(2) - invoice.paid).toFixed(2)} ${invoice.currency.code}</td>
                                                        </tr>`
    }
    if (invoice.refundedAmount > 0) {
        html += `<tr>
                                                        <td style="padding: 0.75rem;vertical-align: top;font-weight: bold;padding-bottom: 5px;text-align: right;">Refunded Amount:</td>
                                                            <td style="padding: 0.75rem;vertical-align: top;text-align: right;padding-bottom: 5px;border-top: 1px solid #000;border-bottom: 4px double #000;font-weight: bold;">${invoice.currency.symbol}${parseFloat(invoice.refundedAmount).toFixed(2)} ${invoice.currency.code}</td>
                                                        </tr>
        </tr>`
    }
    html += `</tbody> </table></body></html>`
    let file = { content: html };


    fs.mkdir('./src/uploads/invoices',
        { recursive: true }, (err) => {
            if (err) {
                return console.error(err);
            }
        });
    // Generate PDF using html_to_pdf 

    await html_to_pdf.generatePdf(file, options)
    // Return the path to the generated PDF
    return `./src/uploads/invoices/INV${order.orderNumber.toString().padStart(5, 0)}.pdf`
}
//Send notification and save it in db
exports.sendNotification = async (userId, title, description) => {
    try {
        let user = await User.findOne({ _id: mongoose.Types.ObjectId(userId) })
        const notification = new Notification({
            customerId: userId,
            title: title,
            description: description
        });
        await notification.save();
        if (user.sendNotification) {
            if (user.fcmToken) {
                sendPushNotification(user.fcmToken, title, description)
            }
        }
        return notification;
    } catch (error) {
        throw error;
    }
}
exports.removeCouponFromCart = (cart) => {
    let grandTotal = 0

    for (let i = 0; i < cart.systemProducts.length; i++) {
        grandTotal += parseFloat(cart.systemProducts[i].subTotal)
    }
    for (let i = 0; i < cart.nonSystemProducts.length; i++) {
        grandTotal += parseFloat(cart.nonSystemProducts[i].subTotal)
    }
    cart.promotionId = null
    cart.discountTotal = 0
    cart.couponDiscountAmount = 0
    cart.couponDiscountType = null
    cart.grandTotal = grandTotal
    return cart
}
/**
 * Applies a coupon code to a cart and calculates discounts based on coupon rules.
 *
 * @param {Object} cart - The cart 
 * @param {Object} coupon - The coupon code containing rules for discounts.
 * @returns {Object} The updated cart with discounts applied.
 */
exports.validateAndApplyCouponCode = async (cart, coupon, isAdminOrder = false, isEditOrder = false) => {
    let userCouponOrders = await Order.countDocuments({ customer: mongoose.Types.ObjectId(cart.customer), promotionId: mongoose.Types.ObjectId(coupon._id) })
    let isValidForCustomer = coupon.customers.some(customerId => customerId.equals(cart.customer));
    if (coupon.customers.length == 0) {
        isValidForCustomer = true
    }
    let response = {
        isValid: false,
        cart: cart
    }
    cart = exports.removeCouponFromCart(cart)

    const today = moment()
    const startDate = moment(coupon.startDate)
    const endDate = moment(coupon.endDate)


    const checkValidityTime = (startDate.isSameOrBefore(today) && endDate.isSameOrAfter(today))

    /* 
    update:01-11-2023
    condition : (userCouponOrders < coupon.noOfUsesPerCustomer || isAdminOrder) isAdminOrder  has been removed from for it .
    Note: This condition is causing issues in applying coupons while create sale.
    Issue: For instance, the 'p4t' code was  maximum usage of 4 times. However, we were able to create a fifth order using this code
    */

    if (isEditOrder == 1 || (isValidForCustomer && checkValidityTime && (cart.grandTotal > coupon.minPurchaseAmount || cart.grandTotal == coupon.minPurchaseAmount) && (userCouponOrders < coupon.noOfUsesPerCustomer))) {
        cart.couponDiscountType = coupon.discountType
        cart.couponDiscountAmount = coupon.discountAmount
        if (coupon.discountType == 1) {       // fixed Discount
            cart.discountTotal = coupon.discountAmount
            cart.grandTotal = cart.grandTotal - coupon.discountAmount
        } else {                              // Percentage

            cart.discountTotal = cart.grandTotal * coupon.discountAmount / 100
            cart.grandTotal = cart.grandTotal - cart.discountTotal
        }
        cart.discountTotal = cart.discountTotal.toFixed(2)
        cart.grandTotal = cart.grandTotal.toFixed(2)
        cart.promotionId = coupon._id;
        response = {
            isValid: true,
            cart: cart
        }
    }
    return response
};
// Function to get a label from an object based on a value and object typ
exports.getMatchValue = (value, objectype) => {
    let object;

    if (objectype === 2) {
        object = [
            {
                value: 1,
                label: "Black & White",
            },
            {
                value: 2,
                label: "Colored",
            },
            {
                value: 3,
                label: "Mixed",
            },
        ];
    } else {
        object = [
            {
                value: 1,
                label: "Left Arm",
            },
            {
                value: 2,
                label: "Right Arm",
            },
            {
                value: 3,
                label: "Chest",
            },
            {
                value: 4,
                label: "Neck",
            },
            {
                value: 5,
                label: "Back",
            },
            {
                value: 6,
                label: "Left Leg",
            },
            {
                value: 7,
                label: "Right Leg",
            },
            {
                value: 9,
                label: "Wrist",
            },
        ];
    }
    // Filter the object to find matching values and extract labels
    const matchingObject = object.filter(item => item.value === value);
    const matchingValue = matchingObject.map(item => item.label);
    return matchingValue;
};
const getRandomLowercase = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    return lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
}
const getRandomUppercase = () => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
}
const getRandomNumber = () => {
    return Math.floor(Math.random() * 10).toString();
}
const getRandomSpecialCharacter = () => {
    const specialChars = '!@#-';
    return specialChars[Math.floor(Math.random() * specialChars.length)];
}
exports.generateRandomString = (length) => {
    const randomString = [];

    // Add one of each required character
    randomString.push(getRandomLowercase());
    randomString.push(getRandomUppercase());
    randomString.push(getRandomNumber());
    randomString.push(getRandomSpecialCharacter());

    const remainingLength = length - randomString.length;

    for (let i = 0; i < remainingLength; i++) {
        const randomFuncIndex = Math.floor(Math.random() * 4);
        switch (randomFuncIndex) {
            case 0:
                randomString.push(getRandomLowercase());
                break;
            case 1:
                randomString.push(getRandomUppercase());
                break;
            case 2:
                randomString.push(getRandomNumber());
                break;
            case 3:
                randomString.push(getRandomSpecialCharacter());
                break;
        }
    }

    // Shuffle the characters to randomize the order
    for (let i = randomString.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomString[i], randomString[j]] = [randomString[j], randomString[i]];
    }

    return randomString.join('');
}


