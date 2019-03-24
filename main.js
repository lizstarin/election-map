var map = (function() {
	var projection = d3.geoAlbersUsa();
	var path = d3.geoPath().projection(projection);
	var results, color;
	var year = '2004';


	// DOING THE VOTE MATH

	var getResults = function(state) {
		var key = year + '_' + constants.STATE_NTOA[state];
		return results[key];	
	};

	var getVotes = function(state, candidate) {
		return getResults(state)[candidate].votes;
	};

	var getStateVoteTotal = function(state) {
		var stateResults = getResults(state);
		var total = 0
		for (candidate in stateResults) {
			total += stateResults[candidate].votes;
		}
		return total;
	};

	var getRDPointSpread = function(state) {
		var votesR = getRVotes(state);
		var votesD = getDVotes(state);
		var total = getStateVoteTotal(state);

		return (votesD - votesR) / total * 100;
	};

	var getRVotes = function(state) {
		return getVotes(state, constants.CANDIDATES[year]['Republican']);
	};

	var getDVotes = function(state) {
		return getVotes(state, constants.CANDIDATES[year]['Democratic']);
	};


	// DRAWING THE MAP

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

	  defineColor();
	  createLegend();
	  updateMap();
	  addEventListeners();
	};

	var defineColor = function() {
		color = d3.scaleSequential(d3.interpolateRdBu).domain([-50, 50]);
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

	var updateMap = function() {
		colorStates();
		updateLegend();
	};

	var colorStates = function() {
	  d3.selectAll('path').style('fill', function(d) {
	  	var pointSpread = getRDPointSpread(d.properties.NAME);
	  	return color(pointSpread);
	  });
	};

	var updateLegend = function() {
		d3.select('.year').text(year);
	};

	var addEventListeners = function() {
		addYearControls();
		addStateMouseovers();
	};

	var addYearControls = function() {
		const years = ['2004', '2008', '2012'];
		yearIndex = years.indexOf(year);

		d3.select('.backwards').on('click', function() {
			yearIndex = (yearIndex - 1) % 3;
			year = years[yearIndex];
			updateMap();
	  })

	  d3.select('.forwards').on('click', function() {
	  	yearIndex = (yearIndex + 1) % 3;
	  	year = years[yearIndex];
	  	updateMap();
	  })
	};

	var addStateMouseovers = function() {
		var popup = d3.select('.popup');

		d3.selectAll('path').on('mouseover', function(d) { 
			var state = d.properties.NAME;
			var stateResults = getResults(state);

			popup
				.style('display', 'block')
				.select('.state-name').text(state);

			for (candidate in stateResults) {
				var stats = stateResults[candidate];
				popup.select('.results').append('p').text(candidate + '(' + stats.parties + '): ' + stats.votes);
			}
		});

		d3.selectAll('path').on('mouseout', function(d) { 
			popup.style('display', 'none'); 
			popup.select('.results').text('');
		});
	};


	// THINGS THAT SHOULD HAPPEN ON THE BACKEND

	var getMapData = function() {
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

				createMap(mapData); 
			});
	};

	// Handles inconsistencies in candidate names
	var cleanResults = function(resultsJson) {
		var resultsCopy = _.cloneDeep(resultsJson);

		for(k in resultsCopy) {
			var stateYear = resultsCopy[k];
			for(candidate in stateYear) {
				if (constants.CANDIDATE_NAMES.hasOwnProperty(candidate)) {
					var normalizedName = constants.CANDIDATE_NAMES[candidate];
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

	return { getMapData: getMapData };
})();

map.getMapData();