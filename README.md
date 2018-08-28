# PostCSS To Css Vars [![Build Status][ci-img]][ci]

[PostCSS] plugin to convert static css to css with variables based on a js theme file, such as tailwindcss' tailwind.js.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/bdolly/postcss-to-css-vars.svg
[ci]:      https://travis-ci.org/bdolly/postcss-to-css-vars

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-to-css-vars') ])
```

See [PostCSS] docs for examples for your environment.
