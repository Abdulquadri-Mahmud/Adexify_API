import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

/**
 * Search Controller
 * Supports: 
 * - Multiple collections (products, users, orders)
 * - Partial search (regex)
 * - Field-specific filters
 * - Sorting
 * - Pagination
 * - Highlighting matches
 */
export const searchController = async (req, res) => {
  try {
    const {
      collection = "products", // default collection
      query = "",
      fields, // specific fields to search e.g. "name,description"
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
      filters, // JSON string e.g. {"status":"active","category":"abaya"}
    } = req.query;

    // ✅ Decide which model to search
    let Model;
    switch (collection.toLowerCase()) {
      case "users":
        Model = User;
        break;
      case "orders":
        Model = Order;
        break;
      default:
        Model = Product;
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
        // Default: search common fields
        searchCondition = {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        };
      }
    }

    // ✅ Apply extra filters
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
