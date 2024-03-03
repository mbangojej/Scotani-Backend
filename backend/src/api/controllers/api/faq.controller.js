const FAQCategory = require('../../models/faqCategory.model')
// API to get FAQS
exports.list = async (req, res, next) => {
    try {
        let { searchQuery } = req.body

        let faqFilter = {
            status: true,
        }
        if (searchQuery) {
            // Update: 02-10-2023
            // Functionality: change ragular expression to avoid substring search.
          
            const regex = new RegExp(`(?:^|\\s)${searchQuery.trim()}(?:$|\\s)`, 'i');
            faqFilter = {
                $or: [
                    { title: { $regex: regex } },
                    { desc: { $regex: regex } }
                ]
            };
        }

        const categoryPipeline = [
            {
                $lookup: {
                    from: "faqs",
                    localField: "_id",
                    foreignField: "category",
                    pipeline: [
                        {
                            $match: faqFilter
                        }
                    ],
                    as: "faqs"
                }
            },
            {
                $project: {
                    name: 1,
                    display_order: 1,
                    faqs: {
                        $map: {
                            input: "$faqs",
                            as: "category",
                            in: {
                                _id: "$$category._id",
                                title: "$$category.title",
                                display_order: "$$category.display_order",
                                desc: "$$category.desc",
                            }
                        }
                    }
                }
            },
            {
                $unwind: "$faqs"
            },
            {
                $sort: {
                    "faqs.display_order": 1 // Sort FAQs within categories
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    display_order: { $first: "$display_order" },
                    faqs: { $push: "$faqs" }
                }
            },
            {
                $sort: {
                    "display_order": 1 // Sort categories by display_order
                }
            }
        ];

        const categories = await FAQCategory.aggregate(categoryPipeline);

        return res.status(200).send({
            status: 1,
            message: 'Faq fetched',
            data: {
                categories
            }
        });


    } catch (error) {
        return next(error)
    }
};

