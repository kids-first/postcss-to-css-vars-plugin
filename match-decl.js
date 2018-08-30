/* eslint-disable */
var nlp = require("compromise");
var _ = require("lodash");

var matchDecl = function(selector, decl, terms, vocab) {
  let termsList = Object.keys(terms).join("  ");
  let selectorParts = selector
    .split("-")
    .map(x => x.replace(".", "").replace("\n", ""));
  let context = _.camelCase(`${selectorParts[0]}-${decl.prop}`);

  const lexicon = vocab || {};

  // match css var name that has either the declaration prop OR
  // the first part of the selector
  let matched = Object.keys(terms).filter(k => {
    if (k.includes(lexicon[selectorParts[0]])) {
      return true;
    } else if (
      k.includes(_.camelCase(decl.prop)) ||
      k.includes(selectorParts[0])
    ) {
      return true;
    }
  });

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
