/* @requires
mapshaper-expressions
mapshaper-dataset-utils
*/

api.uniq = function(lyr, arcs, opts) {
  var n = internal.getFeatureCount(lyr),
      compiled = internal.compileValueExpression(opts.expression, lyr, arcs),
      maxCount = opts.max_count || 1,
      counts = {},
      keepFlags = [],
      verbose = !!opts.verbose,
      invert = !!opts.invert,
      records = lyr.data ? lyr.data.getRecords() : null,
      filter = function(d, i) {return keepFlags[i];};

  utils.repeat(n, function(i) {
    var val = compiled(i);
    var count = val in counts ? counts[val] + 1 : 1;
    var keep = count <= maxCount;
    if (invert) keep = !keep;
    keepFlags[i] = keep;
    counts[val] = count;
    if (verbose && !keep) {
      message(utils.format('Removing feature %i key: [%s]', i, val));
    }
  });

  if (lyr.shapes) {
    lyr.shapes = lyr.shapes.filter(filter);
  }
  if (records) {
    lyr.data = new DataTable(records.filter(filter));
  }
  if (opts.verbose !== false) {
    message(utils.format('Retained %,d of %,d features', internal.getFeatureCount(lyr), n));
  }
};
