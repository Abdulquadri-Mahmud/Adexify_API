import Products from "../model/products_models.js";
// import User from "../model/userModel.js";
// import Order from "../model/orderModel.js";

export const searchController = async (req, res) => {
  try {
    const {
      collection = "products",
      query = "",
      fields,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      filters,
      minPrice,
      maxPrice,
      size,
      deal
    } = req.query;

    // ✅ Decide model
    let Model;
    switch (collection.toLowerCase()) {
      // case "users": Model = User; break;
      // case "orders": Model = Order; break;
      default:
        Model = Products;
    }

    // ✅ Build search condition
    let searchCondition = {};
    if (query) {
      if (fields) {
        const fieldArr = fields.split(",");
        searchCondition["$or"] = fieldArr.map((f) => ({
          [f.trim()]: { $regex: query, $options: "i" },
        }));
      } else {
        searchCondition = {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        };
      }
    }

    // ✅ Price filter
    if (minPrice || maxPrice) {
      searchCondition.price = {};
      if (minPrice) searchCondition.price.$gte = Number(minPrice);
      if (maxPrice) searchCondition.price.$lte = Number(maxPrice);
    }

    // ✅ Size filter
    if (size) {
      searchCondition.size = size;
    }

    // ✅ Deal filter
    if (deal) {
      searchCondition.deal = deal;
    }

    // ✅ Extra filters (JSON)
    if (filters) {
      const parsedFilters = JSON.parse(filters);
      searchCondition = { ...searchCondition, ...parsedFilters };
    }

    // ✅ Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Query DB
    const results = await Model.find(searchCondition)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Model.countDocuments(searchCondition);

    // ✅ Highlight matches
    let highlightedResults = results.map((item) => {
      let highlightedItem = item.toObject();
      if (query) {
        Object.keys(highlightedItem).forEach((key) => {
          if (
            typeof highlightedItem[key] === "string" &&
            highlightedItem[key].toLowerCase().includes(query.toLowerCase())
          ) {
            highlightedItem[key] = highlightedItem[key].replace(
              new RegExp(query, "gi"),
              (match) => `<mark>${match}</mark>`
            );
          }
        });
      }
      return highlightedItem;
    });

    res.json({
      success: true,
      collection,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      results: highlightedResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
