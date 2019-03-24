var projection = d3.geoAlbersUsa();
var path = d3.geoPath().projection(projection);
var results, color;

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

var getRDPointSpread = function(year, state_abbrev) {
	var votesR = getVotes(year, state_abbrev, CANDIDATES[year]['Republican']);
	var votesD = getVotes(year, state_abbrev, CANDIDATES[year]['Democratic']);
	var total = getStateVoteTotal(year, state_abbrev);

	return (votesD - votesR) / total * 100;
};

var createMap = function(mapData) {
	const geoJson = mapData.geojson;
	const results2004 = mapData.json2004;
	const results2008 = mapData.json2008;
	const results2012 = mapData.json2012;

	var u = d3.select('#container g.map')
		.selectAll('path')
		.data(geoJson.features);

	u.enter()
  .append('path')
  .attr('d', path);

  const years = ['2004', '2008', '2012'];
  var yearCounter = 0;

  defineColor();
  createLegend();
  updateMap(years[yearCounter % 3]);

  d3.select('.backwards').on('click', function() {
  	yearCounter -= 1;
  	updateMap(years[yearCounter % 3]);
  })

  d3.select('.forwards').on('click', function() {
  	yearCounter += 1;
  	updateMap(years[yearCounter % 3]);
  })
};

var defineColor = function() {
	color = d3.scaleSequential(d3.interpolateRdBu).domain([-50, 50]);
};

var updateMap = function(year) {
	colorStates(year);
	updateLegend(year);
};

var createLegend = function() {
  var barWidth = 300;
  var barHeight = 30;

  var colorBar = d3.select('.color-bar')
    .attr('width', barWidth)
    .attr('height', barHeight)
    .append('g');

  colorBar.selectAll('lines')
  		.data(d3.range(barWidth), function(d) { return d; })
  	.enter().append('rect')
  		.attr('class', 'line')
  		.attr('x', function(d, i) { return i; })
  		.attr('y', 0)
  		.attr('height', barHeight)
  		.attr('width', 1)
  		.style('fill', function(d, i) { return color(d / 3 - 50); });
};

var updateLegend = function(year) {
	d3.select('.year').text(year);
};

var colorStates = function(year) {
  d3.selectAll('path').style('fill', function(d) {
  	var pointSpread = getRDPointSpread(year, STATE_NTOA[d.properties.NAME]);
  	return color(pointSpread);
  });
};

var getMapData = function() {
	// if (localStorage.getItem('mapData')) {
	// 	var mapData = JSON.parse(localStorage.getItem('mapData'));
	// 	createMap(mapData);
	// } else {
		var geojson = d3.json('states.json');
		var json2004 = d3.json('results_2004.json');
		var json2008 = d3.json('results_2008.json');
		var json2012 = d3.json('results_2012.json');
		Promise.all([geojson, json2004, json2008, json2012]).then(function(data) {
			var mapData = {
				geojson: data[0],
				json2004: cleanResults(data[1]),
				json2008: cleanResults(data[2]),
				json2012: cleanResults(data[3])
			}

			results = Object.assign({}, mapData.json2004, mapData.json2008, mapData.json2012);

			// localStorage.setItem('mapData', JSON.stringify(mapData));
			createMap(mapData); 
		});
	// }
};

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

getMapData();