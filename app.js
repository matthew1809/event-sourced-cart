const express = require('express')
const app = express()

let products = require('./data/products.json')
let carts = require('./data/carts.json')

app.use(express.json({
    extended: true
}));

// Get products
app.get('/products', (req, res) => {
    return res.json(products);
})

// Get a cart
app.get('/carts/:cartID', (req, res) => {
    let cart = carts.find((el) => {
        return el.id == req.params.cartID
    })

    if (!cart) {
        return res.json({error: "Cart not found"}, 404)
    }

    return res.json(cart)
})

// Get the items in a cart
app.get('/carts/:cartID/items', (req, res) => {
    let cart = carts.find((el) => {
        return el.id == req.params.cartID
    })

    if (!cart) {
        return res.json({error: "Cart not found"}, 404)
    }

    return res.json(cart.items)
})

// Add product to cart
// {
//     "id": 1,
//     "quantity": 2
// }
app.post('/carts/:cartID/items', (req, res) => {
    
    // Does the cart exist?
    let cart = carts.find((el) => {
        return el.id == req.params.cartID
    })

    if (!cart) {
        return res.status(404).json({error: "Cart not found"})
    }

    // Does the product exist?
    let product = products.find((el) => {
        return el.id == req.body.id
    })

    if (!product) {
        return res.status(404).json({error: "Product not found"})
    }


    // Does the product exist in the cart?
    let cartItem = cart.items.find((el) => {
        return el.product_id == req.body.id
    })

    if (cartItem) {
        cartItem.quantity += req.body.quantity
        cartItem.line_total = cartItem.quantity * cartItem.unit_price
    
        emit('CartItemQuantityIncreased', {id: cartItem.id, quantity: req.body.quantity})
        return res.status(200).json(cartItem)
    }

    // Create a new item
    cartItem = {
        id: 9999,
        quantity: req.body.quantity,
        product_id: product.id,
        name: product.name,
        description: product.description,
        unit_price: product.price,
        line_total: product.price * req.body.quantity
    }

    cart.items.push(cartItem)

    emit('CartItemAddedToCart', cartItem)
    return res.status(201).json(cartItem)
})

app.put('/carts/:cartID/items/:itemID', (req, res) => {
    
    // Does the cart exist?
    let cart = carts.find((el) => {
        return el.id == req.params.cartID
    })

    if (!cart) {
        return res.status(404).json({error: "Cart not found"})
    }

    // Does the cart item exist?
    let cartItem = cart.items.find((el) => {
        return el.id == req.params.itemID
    })

    if (!cartItem) {
        return res.status(404).json({error: "Cart item not found"})
    }

    // How was the item updated?
    switch (true) {
        case (cartItem.quantity < req.body.quantity):
            // Qty was increased
            emit('CartItemQuantityIncreased', {id: cartItem.id, quantity: req.body.quantity - cartItem.quantity})
            break;
        case (cartItem.quantity > req.body.quantity):
            // Qty was decreased
            emit('CartItemQuantityDecreased', {id: cartItem.id, quantity: cartItem.quantity - req.body.quantity})
            break;
        default:
            return res.status(200).json(cartItem)
    }

    cartItem.quantity = req.body.quantity
    cartItem.line_total = cartItem.quantity * cartItem.unit_price
    
    return res.status(200).json(cartItem)
})

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

function emit(event, data) {
    console.log('Event: %s / Data: %s', event, JSON.stringify(data))
}