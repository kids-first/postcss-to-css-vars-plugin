/* eslint-disable */
require("babel-polyfill");
var postcss = require("postcss");
var _ = require("lodash");
var getVarsMapFromOpts = require("./build-theme.js");
var matchDecl = require("./match-decl.js");
var fs = require("fs");

module.exports = postcss.plugin("postcss-to-css-vars", function(opts) {
  opts = opts || {};
  let varsMap = getVarsMapFromOpts(opts);
  console.log("**** mapping css to vars ...");
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

        let varsContext = matchDecl(selector, decl, varsMap, opts.vocab);
        let cssVar = _.invert(varsContext || varsMap)[declVal];

        decl.value = cssVar ? `var(${cssVar}, ${declVal})` : decl.value;
        idx++;
        return decl;
      });
    });
    // ADD vars to head of css doc
    root.prepend(":root{}");

    // add theme vars to sytlesheet
    _.toPairs(varsMap).forEach(decl => {
      root.first.append({ prop: decl[0], value: decl[1] });
    });

    root.walkRules(":root", function(rule) {
      rule.parent
        .insertBefore(0, { text: "vars:start" })
        .insertAfter(1, { text: "vars:end" });
    });
  };
});
