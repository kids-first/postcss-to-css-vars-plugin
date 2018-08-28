/* eslint-disable */
require("babel-polyfill");
var postcss = require("postcss");
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var flatten = require("flat");

const getVarsMapFromOpts = opts => {
  let varsMap = {};
  let theme = {};
  if (
    !_.isObject(opts.theme) &&
    fs.existsSync(path.resolve(process.cwd(), opts.theme))
  ) {
    theme = require(path.resolve(process.cwd(), opts.theme));
    varsMap = theme;
  } else {
    varsMap = opts.theme;
  }
  varsMap = _.omit(varsMap, opts.exclude);
  // overide theme vars with sub theme
  Object.assign(varsMap, opts.override ? opts.override : {});

  // flaten our nested theme
  varsMap = flatten(varsMap, {
    delimiter: opts.flattenDelimiter ? opts.flattenDelimiter : "-",
    safe: true // don't flatten array values
  });
  // join array with a ",": this is mostly for font stacks
  varsMap = _.mapValues(varsMap, val => (_.isArray(val) ? val.join(",") : val));

  // add css vars syntax to keys
  varsMap = _.mapKeys(
    varsMap,
    (v, k) => `--${opts.prefix ? opts.prefix + "-" : ""}${k}`
  );

  // replace all color values with standard set of color vars
  if (Object.keys(theme).includes("colors")) {
    let colorsMap = _.fromPairs(
      _.toPairs(varsMap).filter(varArr => varArr[0].includes("-colors-"))
    );
    varsMap = _.mapValues(varsMap, (val, key) => {
      let existingVal = _.invert(colorsMap)[val];
      return existingVal && !key.includes("-colors-")
        ? `var(${existingVal}, ${val})`
        : val;
    });
  }

  return varsMap;
};

module.exports = postcss.plugin("postcss-to-css-vars", function(opts) {
  opts = opts || {};
  let varsMap = getVarsMapFromOpts(opts);
  let logged = false;
  let idx = 0;
  return function(root, result) {
    root.walkRules(function(rule) {
      let selector = rule.selector;
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

        decl.value = cssVar ? `var(${cssVar}, ${declVal})` : decl.value;
        idx++;
        return decl;
      });
    });
    // ADD vars to head of css doc
    root.prepend(":root{}");

    let themeVars = _.toPairs(varsMap).forEach(decl => {
      root.first.append({ prop: decl[0], value: decl[1] });
    });

    root.walkRules(":root", function(rule) {
      rule.parent
        .insertBefore(0, { text: "vars:start" })
        .insertAfter(1, { text: "vars:end" });
    });
  };
});
