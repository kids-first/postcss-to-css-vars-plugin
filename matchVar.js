var stringSimilarity = require("string-similarity");

// add a leading zero to number values then
// convert to string
const leadingZeroToString = function(str) {
  let indx = str.indexOf(".");
  if (indx == 0) return `0${str}`;
  return String(str);
};

// find the best match css var that
// matches our css declaration
const matchVar = function(decl, terms) {
  // clean and normalize declaration value
  let declVal = leadingZeroToString(decl.value);
  // get list of  terms that have the same value as declaration value
  let termsVals = Object.entries(terms).filter(term =>
    String(term[1]).match(declVal)
  );

  // narrow list of terms that are similar to declaration props
  if (termsVals.length) {
    let match = stringSimilarity.findBestMatch(
      decl.prop,
      termsVals.map(x => x[0])
    );
    return termsVals[match.bestMatchIndex];
  }
};

module.exports = matchVar;
