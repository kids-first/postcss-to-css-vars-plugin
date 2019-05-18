/* eslint-disable */
require("babel-polyfill");
var postcss = require("postcss");
var _ = require("lodash");
var getVarsMapFromOpts = require("./build-theme.js");
var matchVar = require("./matchVar");

var fs = require("fs");

module.exports = postcss.plugin("postcss-to-css-vars", function(opts) {
  opts = opts || {};
  let varsMap = getVarsMapFromOpts(opts);

  console.log("**** created css vars ***");

  return function(root, result) {
    root.walkRules(function(rule) {
      let selector = rule.selector;

      rule.walkDecls(function(decl) {
        const varsMatch = matchVar(decl, varsMap);

        decl.value = varsMatch
          ? `var(${varsMatch[0]}, ${varsMatch[1]})`
          : decl.value;

        return decl;
      });
    });
    // ADD vars to head of css doc
    root.prepend(":root{}");

    // add theme vars to sytlesheet
    _.toPairs(varsMap).forEach(decl => {
      root.first.append({ prop: decl[0], value: decl[1] });
    });
    let index = 0;
    root.walkRules(":root", function(rule) {
      if (index == 0) {
        rule.parent
          .insertBefore(0, { text: "vars:start" })
          .insertAfter(1, { text: "vars:end" });
        index++;
      }
    });
  };
  console.log("**** css vars created ***");
});
