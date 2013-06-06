/* GLOBAL */
var chartData = [];
var newData;
			
/* Start here...controller that's called when someone accesses the page */
$(document).ready(function() { 
		/* Ask user how far back they would like to view  */	
       	var initialTimeInMinutes = parseInt(prompt("Select the initial duration of time (in minutes) you " +
       			"would like to view (must be whole number): "));
       	var numInitialDataPoints; /* 3000 with the below numbers (6000/60000) */
		var timeBetweenDataPoints = 6000; /* In milliseconds. 10 data points per minute */
		var msPerMinute = 60000; /* Milliseconds per minute */
		
		numInitialDataPoints = parseInt((initialTimeInMinutes*msPerMinute) / timeBetweenDataPoints);

       	/* Get started - fill all the tables with the default time-spans worth of initial data */
       	if(numInitialDataPoints != null) {
           	GetInitialData(numInitialDataPoints, timeBetweenDataPoints);
       	}
 });
//$(document).ready(function() { 
//	$("#internalVoltage").click(function() {
//		/* Ask user how far back they would like to view  */	
//		var initialTimeInMinutes = 0;
//		if( parseInt($("#InitialDurationTime").val()) != null) {
//			initialTimeInMinutes = parseInt($("#InitialDurationTime").val());
//			alert(initialTimeInMinutes);
//		}
//		
//	  	var numInitialDataPoints; /* 3000 with the below numbers (6000/60000) */
//		var timeBetweenDataPoints = 6000; /* In milliseconds. 10 data points per minute */
//		var msPerMinute = 60000; /* Milliseconds per minute */
//	
//		numInitialDataPoints = parseInt((initialTimeInMinutes*msPerMinute) / timeBetweenDataPoints);
//	
//	   	/* Get started - fill all the tables with the default time-spans worth of initial data */
//	   	if(numInitialDataPoints != null) {
//	       	GetInitialData(numInitialDataPoints, timeBetweenDataPoints);
//	   	}
//	});
//});

/* Fills all the tables with the user chosen time-spans worth of initial data */
function GetInitialData(numInitialDataPoints, timeBetweenDataPoints) {
	var initialData = [];
	var secondsWorthOfData = numInitialDataPoints * timeBetweenDataPoints; /*To replace numInit.. in post */
	/* Set the default chart options that all charts share */
	setChartOptions();
	/* AJAX call to go fetch data from a back-end 
	 * Java class - DataSetupController.java 
	 */
	// Send the request for  units to fetch in seconds
	$.post("http://localhost:8080/DataControllerServlet/DataFacilitator", 
			{numUnits: numInitialDataPoints}, function(sensorData) {
				    // Do something with the request
					var time = (new Date()).getTime(), i;
					/* Just got the current time so go back in time
					 * to get numInitialDataPoints worth of data,
					 * spaced by a given amount of seconds. Then add 
					 * them to the array to be passed to the charts.
					 */
					for	(i = -(numInitialDataPoints-1); i <= 0; i++) {
						initialData.push([
							new Date(time + i * timeBetweenDataPoints), 
							sensorData.data[(numInitialDataPoints-1)+i]
						]);
					}
					/* Pass each sensors data on to the charts to be organized and drawn */
					organizeDataToBeDrawn(initialData);
	}, 'json');
}

/* Organize and setup each channels data to be passed off to be drawn 
 * on its corresponding chart. Any additional charts that are desired
 * will be given a case in the switch statement
 */
function organizeDataToBeDrawn(initialData) {
	 /* i represents the channelNumber. See table key for matching names.
	 *  Might have to be changed (more descriptive) in the future.
	 */
	var i = 0;
	// Number of channels (sensors) with data to be charted
	//var numChannels = initialData.length; 
	
	while(i < 1) {
		switch(i) {
		case 0: // Voltage Level
			drawChart(i, initialData, 'Sensor 1 - Internal Voltage Level', 'Time', 
					'Voltage (Volts)', 'Internal Voltage');
			break;
		case 1: // Temperature
			drawChart(i, initialData, 'Sensor 2 - Internal System Temperature', 'Time', 
					'Temperature (degrees celsius)', 'Internal Temp');
			break;
		case 2: // Humidity
			drawChart(i, initialData, 'Sensor 3 - Internal System Humidity', 'Time', 
					'Humidity (%)', 'Internal Humidity');
			break;
		default:
			break;
		}
		i++;
	}
}

/* Generic chart drawing function. Might end up using actual language commands instead
 * It takes the following paramaters:
 * 		channelNum    - A sensor's channel numbe. int 
 * 		data	      - The initial set of data for a particular sensor. double[]
 * 		title	      - Title name of the chart. String
 * 	    xAxis 	   	  - X-axis title name
 * 	    yAxis 	   	  - Y-axis title name
 * 	    seriesName    - Name of the data series
 * 	    containerName - Name of the div container chart is to be placed in (see html)
 */
function drawChart(channelNum, data, title, xAxis, yAxis, seriesName) {
	var timeBetweenDataRequests = 2000; //in milliseconds. Match on java side - dataUpdateController
	
	var initialData = [];
	initialData = data;
	var chart = {
			events : {
				load : function() {
					// set up the updating of the chart every timeBetweenDataPoints seconds
					var series0 = this.series[0];
					var series1 = this.series[1];
					setInterval(function() {
						var time = (new Date()).getTime(); // current time
						/* Go get new data using getJSON from server with given channel number 
						 * Separated into a different function due to a concept called "closure"
						 * */
						newLocalData = getNewData(channelNum);
						series0.addPoint([time, newLocalData], true, true);
						//this.series[1].addPoint([time, newData], false, true);
					}, timeBetweenDataRequests);
					chart.redraw();
				}
			}
		};
	// define the options
    var options = {
		chart : chart,
		xAxis: {
	    	title: {
	    		text: xAxis
	    	}
	    },
	    yAxis: {
	    	title: {
	    		text: yAxis
	    	}
	    },
		
		title : {
			text : title
		},
		
		exporting: {
			enabled: false
		},
		
		series : [{
			name : seriesName,
			data : initialData
    		//allowPointSelect: true,
    		//connectNulls: true,
    		//gapSize: 5
		}]
    };
    
	// Create the chart
	$('#container0').highcharts('StockChart', options);
}

/* Event called by each drawChart function to query the server for new data
 * and update the chart.
 * TODO: - Change it so that it's doRequest not doGet so we can send channelNumber param to it
 * 		 - Change servlet from DataUpdateController to DataFacilitator (4/30)
 */
function getNewData(channelNumber) {
	/* Send the request for  units to fetch in seconds */
	$.post("http://localhost:8080/DataControllerServlet/DataFacilitator", 
			{numUnits: 1}, function(sensorData) {
				newData = sensorData.data[0];
	}, 'json');

	return newData;
}

/* Sets the default chart options and themes that all charts share */
function setChartOptions() {
	Highcharts.setOptions({
    	global: {
    		useUTC: false
    	},
    	colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
    	rangeSelector: {
			buttons: [{
				count: 1,
				type: 'minute',
				text: '5M'
			}, {
				count: 1,
				type: 'hour',
				text: '1H'
			}, {
				type: 'all',
				text: 'All'
			}],
			//inputDateFormat: "%b %e, %Y", /* Don't use yet (5/1) */
			//inputEditDateFormat:"%b %e, %Y", /* Don't use yet (5/1) */
			inputEnabled: true,
			selected: 2,
		},
	    chart: {
	      backgroundColor: {
	        linearGradient: [0, 0, 500, 500],
	        stops: [
	          [0, 'rgb(255, 255, 255)'],
	          [1, 'rgb(240, 240, 255)']
	        ]
	      },
	      borderWidth: 2,
	      plotBackgroundColor: 'rgba(255, 255, 255, .9)',
	      plotShadow: true,
	      plotBorderWidth: 1,
	      panning: true, /*If something is in zoomType, this sets false */
	      zoomType: 'x'
	    },
	    navigator : {
	    	  adaptToUpdatedData: true, /*Not sure about this. Prevents circular loading if false*/
	    	  type: 'column'
	    },
	    title: {
	      style: {
	        color: '#000',
	        font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
	      },
	    },
	    subtitle: {
	      style: {
	        color: '#666666',
	        font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
	      }
	    },
	    xAxis: {
	      gridLineWidth: 1,
	      lineColor: '#000',
	      tickColor: '#000',
	      labels: {
	        style: {
	          color: '#000',
	          font: '11px Trebuchet MS, Verdana, sans-serif'
	        }
	      },
	      title: {
	        style: {
	          color: '#333',
	          fontWeight: 'bold',
	          fontSize: '12px',
	          fontFamily: 'Trebuchet MS, Verdana, sans-serif'
	        },
	      }
	    },
	    yAxis: {
	      alternateGridColor: null,
	      minorTickInterval: 'auto',
	      lineColor: '#000',
	      lineWidth: 1,
	      tickWidth: 1,
	      min: 0, // not the default, fix TODO
	      max: 6, //not the default, fix TODO
	      tickColor: '#000',
	      labels: {
	        style: {
	          color: '#000',
	          font: '11px Trebuchet MS, Verdana, sans-serif'
	        },
	      },
	      title: {
	        style: {
	          color: '#333',
	          fontWeight: 'bold',
	          fontSize: '12px',
	          fontFamily: 'Trebuchet MS, Verdana, sans-serif'
	        },
	      }
	    },
	    scrollbar: {
			barBackgroundColor: 'gray',
			barBorderRadius: 7,
			barBorderWidth: 0,
			buttonBackgroundColor: 'gray',
			buttonBorderWidth: 0,
			buttonBorderRadius: 7,
			trackBackgroundColor: 'none',
			trackBorderWidth: 1,
			trackBorderRadius: 8,
			trackBorderColor: '#CCC'
	    },
	    adaptToUpdatedData : false, /*Maybe delete */
	    exporting: {
	        enabled: false
	    },
	    legend: {
	      itemStyle: {
	        font: '9pt Trebuchet MS, Verdana, sans-serif',
	        color: 'black'

	      },
	      itemHoverStyle: {
	        color: '#039'
	      },
	      itemHiddenStyle: {
	        color: 'gray'
	      }
	    },
	    credits: {
	      style: {
	        right: '10px'
	      }
	    },
	    labels: {
	      style: {
	        color: '#99b'
	      }
	    }
    });
}