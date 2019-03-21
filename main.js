var projection = d3.geoAlbersUsa();
var path = d3.geoPath().projection(projection);

// This would ideally happen on the backend
var cleanResults = function(resultsJson) {
	var resultsCopy = _.cloneDeep(resultsJson);

	for(k in resultsCopy) {
		var stateYear = resultsCopy[k];
		for(candidate in stateYear) {
			if (CANDIDATE_NAMES.hasOwnProperty(candidate)) {
				var normalizedName = CANDIDATE_NAMES[candidate];
				if (stateYear.hasOwnProperty(normalizedName)) {
					stateYear[normalizedName].votes += stateYear[candidate].votes;
				} else {
					stateYear[normalizedName] = stateYear[candidate];
				}
				delete stateYear[candidate];
			}
		}
	}

	return resultsCopy;
};

var getVotes = function(year, state_abbrev, candidate) {
	var key = year + '_' + state_abbrev;
	return results[key][candidate].votes;
};

var getStateVoteTotal = function(year, state_abbrev) {
	var key = year + '_' + state_abbrev;
	var total = 0
	for (candidate in results[key]) {
		total += results[key][candidate].votes;
	}
	return total;
};

var getAllVotes = function(json) {

};

var createMap = function(data) {
	const geoJson = data[0];
	const results2004 = data[1];
	const results2008 = data[2];
	const results2012 = data[3];

	const resultsMerged = Object.assign({}, results2004, results2008, results2012);

	var u = d3.select('#container g.map')
		.selectAll('path')
		.data(geoJson.features);

	u.enter()
  .append('path')
  .attr('d', path);

  // I feel okay about putting this in the global namespace!
  results = cleanResults(resultsMerged);

  colorStates();
};

var colorStates = function() {
  d3.selectAll('path').style('fill', function(d) {
  	var votes = getVotes('2004', STATE_NTOA[d.properties.NAME], 'Bush, George W.');
  	var total = getStateVoteTotal('2004', STATE_NTOA[d.properties.NAME]);
  	var color = d3.scaleSequential(d3.interpolateRdBu).domain([0.25, 0.75]);
  	return color(1 - votes/total);
  });
};

var getMapData = function() {
	var geojson = d3.json('states.json');
	var json2004 = d3.json('results_2004.json');
	var json2008 = d3.json('results_2008.json');
	var json2012 = d3.json('results_2012.json');
	Promise.all([geojson, json2004, json2008, json2012]).then(function(data) {createMap(data); });
};

getMapData();