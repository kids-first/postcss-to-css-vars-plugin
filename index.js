/* eslint-disable */
require("babel-polyfill");
var postcss = require("postcss");
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var flatten = require("flat");

const getVarsMapFromOpts = opts => {
  let varsMap = {};
  if (
    !_.isObject(opts.theme) &&
    fs.existsSync(path.resolve(process.cwd(), opts.theme))
  ) {
    let theme = require(path.resolve(process.cwd(), opts.theme));
    varsMap = theme;
  } else {
    varsMap = opts.theme;
  }
  // flaten our nest theme
  varsMap = flatten(_.omit(varsMap, opts.exclude), {
    delimiter: "-",
    safe: true
  });
  // join array with a ",": this is mostly for font stacks
  varsMap = _.mapValues(varsMap, val => (_.isArray(val) ? val.join(",") : val));
  // add css vars syntax to keys
  varsMap = _.mapKeys(
    varsMap,
    (v, k) => `--${opts.prefix ? opts.prefix + "-" : ""}${k}`
  );
  return varsMap;
};

module.exports = postcss.plugin("postcss-to-css-vars", function(opts) {
  opts = opts || {};
  let varsMap = getVarsMapFromOpts(opts);
  let logged = false;
  return function(root, result) {
    root.walkRules(function(rule) {
      rule.walkDecls(function(decl) {
        // We work with each `decl` object here.
        // normalize arrays
        const declVal = decl.value.includes(",")
          ? decl.value
              .split(",")
              .map(x => x.trim())
              .join(",")
          : decl.value;

        const cssVar = _.invert(varsMap)[declVal];
        decl.value = cssVar ? `var(${cssVar})` : decl.value;
        return decl;
      });
    });

    root.prepend(":root{}");

    let themeVars = _.toPairs(varsMap).forEach(decl => {
      root.first.prepend({ prop: decl[0], value: decl[1] });
    });
  };
});
