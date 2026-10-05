// helpers/shipping.js
// Shipping rules — same as the website checkout (frontend/app/checkout/page.tsx):
// orders containing sneakers: 100 inside Dhaka / 150 outside, otherwise 80 / 120.

const SHIPPING_RATES = {
    sneakers: { inside: 100, outside: 150 },
    default: { inside: 80, outside: 120 },
};

const SHIPPING_TYPES = Object.keys(SHIPPING_RATES.default);

const calculateShippingCharge = (products, shippingType = 'inside') => {
    const hasSneakers = products.some(
        (p) => (p.subCategory || '').toLowerCase() === 'sneakers'
    );
    const rates = hasSneakers ? SHIPPING_RATES.sneakers : SHIPPING_RATES.default;
    return rates[shippingType] ?? rates.inside;
};

module.exports = { SHIPPING_RATES, SHIPPING_TYPES, calculateShippingCharge };
