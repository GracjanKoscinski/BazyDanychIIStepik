# Express-MongoDB API

This API is built using Express and MongoDB. It is hosted on Render at [https://bazydanychiistepikmongo.onrender.com/products](https://bazydanychiistepikmongo.onrender.com/products).

## Available Endpoints

- **Get All Products:** `/products`
- **Add Product:** `/products/:id`
- **Delete Product:** `/products/:id`
- **Generate Report:** `/products/raport`

### Sorting by Price

You can sort the products by price using the `sort` query parameter. For example:

- Ascending Order: `/products?sort=asc`
- Descending Order: `/products?sort=desc`

### Filtering by Price

You can filter products based on price using the `minCena` and `maxCena` query parameters. For example:

- Price between 5 and 10: `/products?minCena=5&maxCena=10&sort=asc`
