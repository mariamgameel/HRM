const paginate = async (model, filter = {}, reqQuery = {}, options = {}) => {
    const page = Math.max(parseInt(reqQuery.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(reqQuery.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const total = await model.countDocuments(filter);

    let query = model.find(filter).skip(skip).limit(limit);
    if (options.sort) query = query.sort(options.sort);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);

    const data = await query;

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        },
    };
};

module.exports = paginate;