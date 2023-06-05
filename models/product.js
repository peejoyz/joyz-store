const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema ({

    full_title: {
        type: String,
        require: true
    },

    title: {
        type: String,
        require: true
    },

    slug: {
        type: String
    },

    desc: {
        type: String,
        require: true
    },

    category: {
        type: String,
        require: true
    },

    price: {
        type: Number,
        require: true
    },

    image: {
        type: String,
        require: true
    },

    discount_price: {
        type: Number
    },

    discount_percentage: {
        type: String
    },

    ratings: {
        type: Number
    },

    rated_by: {
        type: Number
    }
});

module.exports = mongoose.model('product', ProductSchema);
