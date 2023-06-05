const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Orderschema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'user'},
    cart: {  
        type: Object,
        require: true
    },
    address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        require: true
    },
    paymentId: { 
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('order', Orderschema)