/* GLOBAL */
var newPoint = []; /**< A new point of data during real-time updates */
var numInitialDataPoints; /**< 3000 with the below numbers (6000/60000) */
var timeBetweenUpdates = 5000; /**< In milliseconds */
var msPerMinute = 60000; /**< Milliseconds per minute */
var startSeconds; /**< Calculated from start date and time */
var durationSeconds = 10;  /**< Default option in drop-down */
var hostAddress; /**<Host address of a deployed sensor pod*/
var portNumber; /**< Port num of a deployed sensor pod*/
var realTimeFlag = 0; /**< Keeps track of if real-time updates are on */
var lastAddedTimestamp = 0;
var BAD_DATA_REQUEST = -404;
var TIME_STAMP = 0;
var NEW_DATA = 1;
var loadInterval; /**< Keeps track of real-time update intervals */


/** 
 * 
 * FRONT-END Draw.js
 * 
 * Purpose: Performs the charting and data requesting
 * 			to the middle-end DataFacilitator Servlet.
 * 
 *		   Main function that gets triggered upon access to the home page.
 *		   Sits waiting for information to be entered into the Settings
 *		   forms or until someone clicks a channelName link
 * 
 * Author: Michael Chamoures
 * 
 * Modified: 6/11/2013
 */

$(document).ready(function() {
	
	/* This checks to see if a user clicks one of the
	 * sensor categories and toggles viewing channel
	 * types from that category
	 */
	$("#channelList > li > a[data-target]").parent('li').click(
	        function() { 
	            target = $(this).children('a[data-target]').data('target');
	            $(target).collapse('toggle');
	        }
	);
	
	/* This checks to see if a user clicks one
	 * of the channels and if so starts the charting process
	 */
	$("#channelList li").click(function() {
	    var attributeTitle = $(this).attr("title");
	    var attributeId = $(this).attr("id");
	    var channelName;
	    
	    if (attributeTitle == "channel") {
	    	channelName = attributeId;
	    	/* Ask user how far back they would like to view  */	
	    	var VALID_PRESET_INPUT = 1;
	    	/* Make sure user has entered inputs correctly */
	    	if(saveChartPresets() == VALID_PRESET_INPUT) {	
	    		if (loadInterval) {
	    			/* There's already a sensor updating in control
	    			 * of the interval. Clear it so it doesn't 
	    			 * overlap with the new one
	    			 */
	    			clearInterval(loadInterval);
	    		}
			   	/* Get started - fill chart with what's entered into the form */
				chartSetup(channelName);
			}
	    }
	    
	});
	
	/* Date picker stuff */
	getInputDate();
	
	/* If someone enters a bad date range and sees the alert error 
	 * and then clicks to dismiss, this is what hides it 
	 */
	badDataAlert();
	
});


/**
 * The first time a JQuery request is made to the middle-end (DataFacilitator).
 * If data is available for the request channelName, then the initial series
 * data is filled and sent off to be organized and charted
 * 
 * @param channelName Name of channel link that was clicked on to be charted
 */
function chartSetup(channelName) {
	var initialData = [];
	var timeRef ="absolute";	
	
	/* Show the pause button */
	if(!($("#PauseButton").is(':visible'))) {
		$("#PauseButton").show();
	}
	
	/* If real-time updates are on */
	if(realTimeFlag == 1) {
		timeRef = "newest";
	}
	
	/* Set the default chart options that all charts share */
	setChartOptions();
	
	/* AJAX call to go fetch data from a back-end 
	 * Java servlet - DataFacilitator.java for filling the initial
	 * series data
	 */
	$.post("http://localhost:8080/EcoSensorPodServlet/DataFacilitator", 
		{hostAddress: hostAddress,
		 portNumber: portNumber,
		 start: startSeconds, 
		 duration: durationSeconds,
		 channelName: channelName,
		 timeRef: timeRef
		}, 
		function(sensorData) {
			var MS_PER_SECOND = 1000;
			var i = 0;
			var data = sensorData.data;
			var length = data.length;
		    // Do something with the request
			/*if(realTimeFlag == 1) {
				time = (new Date()).getTime();
			}
			else {
				time = (startSeconds + durationSeconds) * MS_PER_SECOND;
			}*/
			if(sensorData.data[0] != BAD_DATA_REQUEST) {
				/* Just got the current time so go back in time
				 * to get numInitialDataPoints worth of data,
				 * spaced by a given amount of seconds. Then add 
				 * them to the array to be passed to the charts.
				 */
				for	(i = 0; i < length; i++) {
					initialData.push([
						sensorData.timeStamp[i] * MS_PER_SECOND,
						sensorData.data[i]
					]);
				}
				lastAddedTimestamp = sensorData.timeStamp[length-1];
				/* Got the data! Now send it back to be posted */
				organizeDataToBeDrawn(channelName, initialData);
			}
			else if (sensorData.timeStamp[0] != BAD_DATA_REQUEST) {
				$('.center').notify({
				    message: { text: "ERROR! Sorry, no data available for requested time period.  " +
									"Data is currently only available up until:  " + 
									new Date(sensorData.timeStamp[1]*1000) },
					fadeOut: { enabled: false }
				  }).show();
			}
			else {
				$('.center').notify({
				    message: { text: "ERROR! Sorry, there is no history of data on this channel."},
					fadeOut: { enabled: false }
				  }).show();
			}
	}, 'json');
	
}	
	

/**
 *  Organize and setup each channels data to be passed off to be drawn 
 * on its corresponding chart. Any additional charts that are desired
 * will be given a case in the switch statement.
 * 
 * @param channelName Name of channel link that was clicked on to be charted
 * @param data The initial series data  
 */
function organizeDataToBeDrawn(channelName, data) {
	switch(channelName) {
		case "6799_Pressure/Pressure" :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "F72D_Accelerometer/linear_acceleration_X" :
			drawChart(channelName, data, 'Time', 'Linear Acceleration');
			break;
		case "F72D_Accelerometer/linear_acceleration_Y" :
			drawChart(channelName, data, 'Time', 'Linear Acceleration');
			break;
		case "F72D_Accelerometer/linear_acceleration_Z" :
			drawChart(channelName, data, 'Time', 'Linear Acceleration');
			break;
		case "F72D_Accelerometer/x"	:
			drawChart(channelName, data, 'Time', 'Linear Acceleration');
			break;
		case "F72D_Accelerometer/y"	:
			drawChart(channelName, data, 'Time', 'Linear Acceleration');
			break;
		case "F72D_Accelerometer/z"	:
			drawChart(channelName, data, 'Time', 'Linear Acceleration');
			break;
		case "IMM/Battery"	  :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "IMM/ContTemp"	  :
			drawChart(channelName, data, 'Time', 'Tempetature');
			break;
		case "IMM/Date"		  :
			drawChart(channelName, data, 'Time', 'Date');
			break;
		case "IMM/Est_pH-ext" :
			drawChart(channelName, data, 'Time', 'pH');
			break;
		case "IMM/Est_pH-int" :
			drawChart(channelName, data, 'Time', 'pH');
			break;
		case "IMM/Time" 	  :
			drawChart(channelName, data, 'Time', 'Time');
			break;
		case "IMM/VBatt" 	  :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break; 
		case "IMM/VExt" 	  :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "IMM/Vint" 	  :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "IMM/Vpres" 	  : 
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "IMM/Vtherm"	  :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "IMM/pH_ext"     :
			drawChart(channelName, data, 'Time', 'pH');
			break;
		case "IMM/pH_int"	  :
			drawChart(channelName, data, 'Time', 'pH');
			break;
		case "IMM/x1" 		  :
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "IMM/x2" 		  : 
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "voltage/voltage":
			drawChart(channelName, data, 'Time', 'Voltage (Volts)');
			break;
		case "temperature/temperature": 
			drawChart(channelName, data, 'Time', 
					'Temperature (degrees celsius)');
			break;
		case "humidity/humidity": 
			drawChart(channelName, data, 'Time','Humidity (%)');
			break;
		default:
			break;
		}
}

/**
 * Generic chart drawing function. Draws the initial Series chart.
 * If real-time updates are on, the "events" option of the chart is set.
 * 
 * @param  channelName   A sensor's channel name. String 
 * @param  data	         The initial set of data for a particular sensor. double[]
 * @param  xAxis 	   	 X-axis title name
 * @param  yAxis 	   	 Y-axis title name
 */
function drawChart(channelName, data, xAxis, yAxis) {
	var MS_PER_SECOND = 1000; //in milliseconds. Match on java side - dataUpdateController
	var events = "";

	/* If real-time updates are "on", set up chart to request new data every
	 * timeBetweenUpdate seconds
	 */
	if ($('input[name="Real-Time Data Updates Checkbox"]:checked', "#PresetsForm").val() == 'ON') {
		events = {
			load : function() {
					/* set up the updating of the chart every timeBetweenDataPoints seconds */
					var series0 = this.series[0];
					var series1 = this.series[1];
					/* Set the global var loadInterval to keep track of which
					 * sensor is updating
					 */
					loadInterval = setInterval(function() {
						if (getNewData(channelName)) {
							if (newPoint[0]) {
								var flag = true;
								/* If the "Pause" checkbox is checked, buffer data but don't post it */
								if ($('input[name="PauseOrPlay"]:checked', "#PresetsForm").val() == 'PAUSE') {
		                        	flag = false;
		                        }
								series0.addPoint([
									newPoint[0] * MS_PER_SECOND,
									newPoint[1]
								], flag, flag);
								series1.addPoint([
									newPoint[0] * MS_PER_SECOND,
									newPoint[1]
								], flag, flag);	
							}
						}
					}, timeBetweenUpdates);
				}
			};
	}
		
	/* define the chart */
	options = {
		 chart: {
			type: 'spline',
			events : events
		},
		series : [{
			name : channelName,
			data : data
		}],
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
			text : channelName
		},
		tooltip: {
			stickyTracking:false, 
			/* This is for the box that appears when you hover over a point */
			formatter: function() {
				var s = '<b>'+ Highcharts.dateFormat('%A, %b %e, %Y <br/>  %H:%M:%S',
						this.x) +'</b>';
	
				$.each(this.points, function(point) {
					s += '<br/>' + yAxis + ": " + this.y;
				});
	        
				return s;
			}
        },
		exporting: {
			enabled: true
		}
    };
	/* Create the chart */
	$("#chartArea").highcharts('StockChart', options);
}

/** 
 * Event called by each drawChart function to query the server for new data
 * and update the chart.
 * 
 * @param  channelName   A sensor's channel name. String 
 */
function getNewData(channelName) {
	/* Send the request for  units to fetch in seconds, real-time most recent data */
	$.post("http://localhost:8080/EcoSensorPodServlet/DataFacilitator", 
			{hostAddress: hostAddress,
		 	 portNumber: portNumber,
		     start: 0, 
			 duration: 1,
			 channelName: channelName,
			 timeRef: "newest"
			}, 
			function(sensorData) {
				var BAD_DATA_REQUEST = -404;
				if (sensorData.timeStamp[0] <= lastAddedTimestamp) {
					/* Got an old time. Toss it */
					newPoint[1] = BAD_DATA_REQUEST;
					return false;
				}
				else if (sensorData.data[0] == BAD_DATA_REQUEST){
					/* Data was unavailable */
					newPoint[1]  = BAD_DATA_REQUEST;
					return false;
				}
				else {
					/* Assign new values to be added to chart */
					newPoint[0] = sensorData.timeStamp[0];
					newPoint[1]  = sensorData.data[0];
					lastAddedTimestamp = newPoint[0];
				}
	}, 'json');
	
	if (newPoint[NEW_DATA] == BAD_DATA_REQUEST) {
		return false;
	}
	return true;
}

/**
 *  Capture input from user regarding start date/time, duration and real-time 
 */
function saveChartPresets() {
	var BAD_PRESET_INPUT = 0;
	var VALID_PRESET_INPUT = 1;
	
	/* Parse the selected drop-down duration and convert it to seconds */
	durationSeconds = convertDurationToSeconds($("#dataDuration").val());
	
    if ($('input[name="Real-Time Data Updates Checkbox"]:checked', "#PresetsForm").val() == 'OFF') {
	   /* Real-time defaults to off so set to date and time here, then wait 
		 * for a change of the button */
		 if ($("#endDate").val() != "" && $("#endTime").val() != "") {
			 /* Parse the input date and time and convert to seconds */
			 startSeconds = Date.parse($("#endDate").val() + " " + $("#endTime").val()) / 1000;
			 startSeconds -= durationSeconds;
		 }
		 else {
			 $('.center').notify({
				    message: { text: "ERROR! Please Enter End Date and/or End Time" },
					fadeOut: { enabled: false }
				  }).show();
			 return BAD_PRESET_INPUT;
		 }
    }
    else {
    	/* Real-time updates are on. Set startTime to duration */
	   startSeconds = 0;
	   realTimeFlag = 1; /* Real-time updates are on */
    }
    
    /* Check to make sure they entered a correct host/port */
    if ($("#HostAddress").val() == "" || $("#PortNum").val() == "")  {
		$('.center').notify({
			   message: { text: "ERROR! Please Enter Host Address and/or Port Number" },
			   fadeOut: { enabled: false }
			 }).show();
		 return BAD_PRESET_INPUT;
	}
    else {
    	hostAddress = $("#HostAddress").val();
    	portNumber = $("#PortNum").val();
    }
    
    return VALID_PRESET_INPUT;
}

function convertDurationToSeconds(duration) {
	var seconds = 0;
	var SECONDS_PER_MINUTE = 60;
	var SECONDS_PER_HOUR = 3600;
	var SECONDS_PER_DAY = 86400;
	var SECONDS_PER_WEEK = 604800;
	var parsedDuration = duration.split(' ');
	
	switch (parsedDuration[1]) {
	case 'seconds':
		seconds = parseInt(parsedDuration[0]);
		break;
	case 'minute':	
    case 'minutes':
    	seconds = parseInt(parsedDuration[0]) * SECONDS_PER_MINUTE;
    	break;
    case 'hour':
    case 'hours':
    	seconds = parseInt(parsedDuration[0]) * SECONDS_PER_HOUR;
    	break;
    case 'day':
    case 'days':
    	seconds = parseInt(parsedDuration[0]) * SECONDS_PER_DAY;
    	break;
    case 'week':
    	seconds = parseInt(parsedDuration[0]) * SECONDS_PER_WEEK;
    	break;
	default:
		break;
	}
	return parseInt(seconds);
}

function convertDateTimeToSeconds(date, time) {
	var MS_PER_SECOND = 1000;
	/* No error checking on format right now... (5/18/13) 
	 * Seconds represents the number of seconds between 
	 * January 1, 1970 and entered date and time
	 */
	
	var seconds = Date.parse(date + " " + time) / MS_PER_SECOND;
	return parseInt(seconds);
}

/**
 * Gets the input data from the calendar datepicker
 */
function getInputDate() {
	/* Date Picker stuff */
	$('.myDatepicker').each(function() {
	    var maxDate = new Date();
	    
	    var $picker = $(this);
	    $picker.datepicker();
	    
	    var pickerObject = $picker.data('datepicker');
	    
	    $picker.on('changeDate', function(ev){
	        if (ev.date.valueOf() > maxDate.valueOf()){
	            
	            /* Handle previous date */
	        	$('.center').notify({
				    message: { text: 'ERROR! Invalid Date.' },
					fadeOut: { enabled: false }
				  }).show();
	            pickerObject.setValue(maxDate);
	            
	            /* And this for later versions (in case) */
	            ev.preventDefault();
	            return false;
	        }
	        else {
	            pickerObject.setValue(ev.date.valueOf());
	        }    
	    });
	});
}
/**
 *  Sets the default chart options and themes that all charts share 
 */
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
			selected: 1,
			inputEnabled: false
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
	      plotBorderWidth: 1
//	      panning: true, /*If something is in zoomType, this sets false */
//	      zoomType: 'x'
	    },
	    navigator : {
	    	  baseSeries: 1,
	    	  adaptToUpdatedData: false, /*Not sure about this. Prevents circular loading if false*/
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
	      //min: -10, // not the default, fix TODO
	      //max: 10, //not the default, fix TODO
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
			trackBorderColor: '#CCC',
			liveRedraw: false
	    },
	    adaptToUpdatedData : false, /*Maybe delete */
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

/**
 * Called if someone tries to click a channelName without the necessaty
 * settings filled in
 */
function badDataAlert() {
	$(function(){
	    $('.center').on("click", function(){
	        $("." + $(this).attr("data-hide")).hide();
	        /*
	         * The snippet above will hide all elements with the class specified in data-hide,
	         * i.e: data-hide="alert" will hide all elements with the alert property.
	         *
	         * Xeon06 provided an alternative solution:
	         * $(this).closest("." + $(this).attr("data-hide")).hide();
	         * Use this if are using multiple alerts with the same class since it will only find the closest element
	         * 
	         * (From jquery doc: For each element in the set, get the first element that matches the selector by
	         * testing the element itself and traversing up through its ancestors in the DOM tree.)
	        */
	    });
	});
}	