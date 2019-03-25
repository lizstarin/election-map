# Presidential election map, 2004-2012

## Overview
This map shows presidential election results for 2004, 2008, and 2012. It is a choropleth showing Republican/Democratic point spread with a diverging color scale, where strongly Republican states are deep red, strongly Democratic states are deep blue, and tossup states are a light gray. You click on arrows in the legend to move from year to year. When you mouse over a particular state, the sidebar shows vote tallies for all candidates in that state. You can add new results for the currently displayed year in a form at the bottom. The added results will show up in the sidebar (at least until you refresh!).

## Tools used
Mostly D3. The US states map file is GeoJSON. I used Mapshaper to simplify my paths (and decrease file size). I think the map would have looked cool even more simplified, but there is already an awkward discrepancy between the levels of detail in the borders of Alaska and Hawaii, since they are on difference zoom levels. 

I used Lodash for deep duplication, so I could write my data-cleaning function without overwriting the original object.

Otherwise, vanilla JS. I prefer to avoid overloading my dependencies, especially for small projects like this.

## How it works
On page load, the map kicks off by loading map GeoJSON data from `states.json` and election results JSON data from `results_*.json`. The JSON is loaded via D3, which uses promises for file loading; once all the promises are resolved, the map drawing function is called, using the loaded data. The election results are also merged into a single big object that lives in memory. The map frequently retrieves data from this results object. For the sake of simplicity and a quick project, no data currently persists in the browser (although it ought to—see below). Interactions are handled with event listeners.

## Todos
#### - implement local data storage
Right now all the map and elections data are just in memory. But really, they should be in client-side storage so the user doesn't have to re-upload all the data on every page refresh. I think the data needs to live client-side for the sake of performance, because the map JSON is bulky and the election data needs to be queried a lot. Right now, I'm managing okay with all the results in one big object, but the data is just complicated enough that it's unneccessarily awkward to access certain pieces of data. So it would be good to use something like GraphQL (which I don't know) to allow client-side queries. It might also be good to store certain retrieved or calculated values in localStorage.
#### - set up package management
to manage dependencies, compress assets...
#### - write a backend
Ideally the backend would handle data cleaning and keep track of any updates to the results data.
#### - improve layout
There's currently too much reliance on hard-coded pixel values, and the whole thing needs to be made mobile-friendly, in both layout and UI. (Maybe on a mobile device, you tap on a state to show its results, instead of mousing over.)
#### - improve cross-browser compatibility
#### - write tests
#### - more views!
I figured that showing the Republican/Democratic race was the MVP of this project but one thing I really wanted to do (if I'd had more time) was to give the user a way to explore third-party candidates. 

I envisioned a choropleth map showing percentage of state vote for one candidate at a time—you could select a candidate from the legend, which would show a list of significant third-party candidates. The list would contain any candidate who had passed a certain threshhold % of the vote in at least one state (or some similar criterion). The map would also highlight states (maybe using a thicker stroke?) in which that candidate was a potential election spoiler—say, states in which that candidate's vote percentage was higher than the R/D point spread.

I also thought it would be interesting to be able to pit any two candidates against each other.

#### - do something with the electoral college
I haven't yet actually highlighted the winner of each election! Nor does the map show how many EC votes each state yets. (But I have EC votes, including the special cases of Maine and Nebraska, in my constants, ready to use...)

#### - improve view of small states
An inset containing another projection of New England and the Mid-Atlantic would be helpful. You can't really see the District of Columbia.

#### - finesse the color scale a bit
And speaking of Washington, DC. The color scale maxes out at a 50-point margin on either side; in other words, any states with >50 point spread will be the same color as those with a 50-point spread. That's about the maximum spread in any of the elections, in any state...except for Washington, DC, which reliably votes like 80+% Democrat. I'm not sure the best way to adjust the points-to-color distribution; right now it's just linear.

#### - clarify the axis labels on the legend
They should be positive numbers in both directions, with percent signs, and it ought to say "R" on one side and "D" on the other.

#### - better form validations
The HTML form constraints do some of the work here, and you can't currently add data to the result set unless all the fields are non-empty. But...it could be more robust, and there should also be UI to guide the user when they've entered, or tried to enter, bad data.

#### - more refactoring
It wouldn't hurt to break out some of the functions into other modules, the data uploading/cleaning functions in particular. Also, the functions for "querying" the data object and making data-based calculations could probably go in a utility module.

#### - accessibility 
I'm not sure how much of a priority this is for the hypothetical user here. I've tried to be semantic in my HTML, and the color scale is colorblind-friendly(!), but other design choices (color, typography...) may not be so accessibility-focused. 
