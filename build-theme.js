/* eslint-disable */
var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var flatten = require("flat");

const resolveTheme = opts => {
  let varsMap = {};

  if (
    !_.isObject(opts.theme) &&
    fs.existsSync(path.resolve(process.cwd(), opts.theme))
  ) {
    theme = require(path.resolve(process.cwd(), opts.theme));
    varsMap = theme;
  } else {
    varsMap = opts.theme;
  }
  return varsMap;
};

const normalizeTheme = (hash, theme) => {
  let varsHash = hash;
  // join array with a ",": this is mostly for font stacks
  varsHash = _.mapValues(
    varsHash,
    val => (_.isArray(val) ? val.join(",") : val)
  );

  // replace all color values with standard set of color vars
  if (Object.keys(theme).includes("colors")) {
    let colorsMap = _.fromPairs(
      _.toPairs(varsHash).filter(varArr => varArr[0].includes("-colors-"))
    );
    varsHash = _.mapValues(varsHash, (val, key) => {
      let existingVal = _.invert(colorsMap)[val];
      let colorKey = [key.split("-")[3], key.split("-")[2]].some(
        x => x === "colors"
      );
      return existingVal && !colorKey ? `var(${existingVal}, ${val})` : val;
    });
  }
  return varsHash;
};

const getVarsMapFromOpts = opts => {
  let theme = resolveTheme(opts);
  let varsMap = (theme = _.omit(theme, opts.exclude));
  // overide theme vars with sub theme
  Object.assign(varsMap, opts.override ? opts.override : {});

  // flaten our nested theme
  varsMap = flatten(varsMap, {
    delimiter: opts.flattenDelimiter ? opts.flattenDelimiter : "-",
    safe: true // don't flatten array values
  });

  // add css vars syntax to keys
  varsMap = _.mapKeys(
    varsMap,
    (v, k) => `--${opts.prefix ? opts.prefix + "-" : ""}${k}`
  );
  varsMap = normalizeTheme(varsMap, theme);
  return varsMap;
};
module.exports = getVarsMapFromOpts;
