# Technocrats storefront

Add or update a product in `assets/product-catalog.js`. A new entry needs a unique `id`, `name`, review `group`, Amazon `link`, and product `image` path or URL:

```js
{
  id: "example-product",
  name: "Example Product",
  group: "More tech",
  link: "https://www.amazon.com/dp/EXAMPLE",
  image: "/assets/example-product.png",
}
```

New entries appear in Trending Products and in the review form by default. Each trending card links to the form with that product selected. Optional `featured`, `categoryCard`, and `weekly` settings also place products in the hero, category cards, and weekly rotation. Use `trending: false` only for items shown in another section. Keep the same product ID when editing a listing so existing reviews stay associated with that product.
