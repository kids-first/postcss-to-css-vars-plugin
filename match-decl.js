/* eslint-disable */
var nlp = require("compromise");
var _ = require("lodash");

// TODO: test below function
// explore nlp matching with lexicon

// var keyMatch = function(decl, selectorParts, cssVar) {
//   let declAbv = decl.prop
//     .split("-")
//     .map(x => x.charAt(0))
//     .join("");

//   if (
//     cssVar.includes(_.camelCase(decl.prop)) ||
//     cssVar.includes(selectorParts[0])
//   ) {
//     return true;
//   }

//   if (selectorParts[0] === declAbv) {
//     return true;
//   } else if (decl.prop.split("-")[0] === selectorParts[0]) {
//     return true;
//   } else {
//     return false;
//   }
// };

var matchDecl = function(selector, decl, terms) {
  let termsList = Object.keys(terms).join("  ");
  let selectorParts = selector
    .split("-")
    .map(x => x.replace(".", "").replace("\n", ""));
  let context = _.camelCase(`${selectorParts[0]}-${decl.prop}`);
  // match css var name that has either the declaration prop OR
  // the first part of the selector
  let matched = Object.keys(terms).filter(
    k => k.includes(_.camelCase(decl.prop)) || k.includes(selectorParts[0])
  );

  // console.log(`
  //   selector: ${selector}
  //   decl: '${decl}'
  //   context: ${context}
  //   matched: ${matched[0]}

  // `);

  let varsContext = matched.length ? _.pick(terms, matched) : null;
  if (varsContext) {
    varsContext = _.mapValues(varsContext, v => {
      if (_.isString(v)) {
        let vals = v.match(/,(.*)\)/);
        if (vals) return vals[1].trim();
      }
      return v;
    });
  }
  return varsContext;
};

module.exports = matchDecl;
