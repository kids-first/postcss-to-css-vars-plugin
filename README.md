# PostCSS To Css Vars [![Build Status][ci-img]][ci]

[PostCSS] plugin to convert static css to css with variables based on a js theme file, such as tailwindcss' tailwind.js.

[postcss]: https://github.com/postcss/postcss
[ci-img]: https://travis-ci.org/bdolly/postcss-to-css-vars.svg
[ci]: https://travis-ci.org/bdolly/postcss-to-css-vars

```css
:root {
  --colors-primary: rgb(195, 90, 190.7);
}
.foo {
  color: var(--colors-primary);
}
```

```css
.foo {
  color: rgb(195, 90, 190.7);
}
```

## Usage

```js
postcss([ require('postcss-to-css-vars')({
  theme:< String | Object >,
  flattenDelimiter: <String>,
  exclude: <Array>,
  prefix: <String>
  override: <Object>
}) ])
```

## Options

* **`theme`**: file path to (cwd is the root of your project) OR js theme object (nested values get flattened)

* **`flattenDelimiter`**: string to use when flattening nested theme properties (defaults to '-')

* **`exclude`**: array of theme keys to exclude from the output css vars,

* **`prefix`**: string prefix for css vars (gets '-' appened to it by default)

* **`override`**: theme object to override original theme, gets called with `Object.assign` so new properties will be added if they do not exist

See [PostCSS] docs for examples for your environment.
