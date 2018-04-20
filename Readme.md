# Event sourced shopping cart in node

This is a simple shopping cart API in node built using event sourcing. 

Events are sent to Redis and RabbitMQ.

## Concepts
https://www.npmjs.com/package/eventstore is used for the event store.

## Requirements
Redis
RabbitMQ

### Product

A product consists of:

- An ID
- A name
- A description
- A price

```
{
    "id": 1,
    "name": "Awesome Red Pen",
    "description": "The most awesome red pen you will ever see!",
    "price": 10
}
```

### Cart Item

A cart item consists of:

- An ID
- A quantity
- A product ID
- A product name
- A product description
- A unit price
- A line total

```
{
    "id": 2,
    "quantity": 2,
    "name": "Awesome Red Pen",
    "description": "The most awesome red pen you will ever see!",
    "price": 10,
    "total": 20
}
```

#### Cart Item Events

- CartItemCreated
- CartItemQuantityUpdate
- CartItemDeleted

#### Cart

A cart consists of:

- An ID
- A collection of cart items
- A total

```
{
    "id": 3,
    "total": 20
}
```

## Requests

### Add item to cart

`POST` to `http://localhost:3000/carts/:cartID/items`

```
{
  "id": 1,
  "quantity": 4
}
```

### Update a cart item

`PUT` to `http://localhost:3000/carts/:cartID/items/9999`

```
{
  "id": 1,
  "quantity": 4
}
```

### Get the items in a cart

`GET` to `http://localhost:3000/carts/1/items`