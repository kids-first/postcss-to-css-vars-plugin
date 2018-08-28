/* eslint-disable */
require("babel-polyfill");
var postcss = require("postcss");
var _ = require("lodash");
var getVarsMapFromOpts = require("./build-theme.js");

module.exports = postcss.plugin("postcss-to-css-vars", function(opts) {
  opts = opts || {};
  let varsMap = getVarsMapFromOpts(opts);

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

        let cssVar = _.invert(varsMap)[declVal];

        let selectorParts = selector.split("-").map(x => x.replace(".", ""));
        //  TODO better css vars lookup
        // if (selectorParts[0] === "text") {
        //   let scopedVars = _.fromPairs(
        //     _.toPairs(varsMap).filter(
        //       varArr =>
        //         varArr[0].includes(selectorParts[0]) &&
        //         varArr[0].includes(selectorParts[1])
        //     )
        //   );

        //   let scopedCssVar = _.invert(scopedVars)[declVal];

        //   console.log(`selector: ${selector}`);
        //   console.log(`decl.prop: ${decl.prop}`);
        //   console.log(`decl.value: ${decl.value}`);
        //   console.log(`cssVar: ${cssVar}`);
        //   console.log(`selectorParts[0]: ${selectorParts[0]}`);
        //   console.log(scopedVars);
        //   console.log("\n");
        // }

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
