package com.srccodes.example;

import com.rbnb.sapi.ChannelMap;
import com.rbnb.sapi.SAPIException;
import com.rbnb.sapi.Sink;


public class SensorDataRetrieverV2 {
	//private static final int MAX_CHANNELS = 20;
	//private static final float NUM_TIME_UNITS_PER_FETCH = 60; //Default
	private ChannelMap rMap;
	private Sink sink;
	/* The number of data points needed to represent the 
	 * entire amt of time requested. Each sensor data array wont actuall be 
	 * this long*/ 
	private int unitsPerFetch;
	public static int numChannels = 3; /* 3 for now b/c thats all internal */
	public SensorData sensorData;
	
	public SensorDataRetrieverV2(int channelNum) {
		try {
			
			/* Initialize allSensorData array to known number of channels */
			sensorData = new SensorData();
			
	        /* Create the new sink object and open/setup connection */
	        sink=new Sink();
	        sink.OpenRBNBConnection();

	        /* Pull data from the server */
	        rMap = new ChannelMap();
	        
	        /* TODO: ChannelName parameter still needs to be defined 
	         * and there will be multiple to add, one for each sensor type*/
	        rMap.Add("HelloWorld/HelloWorld");
	        
	    } 
		catch (SAPIException se) {
			se.printStackTrace(); 
		}
	}
	
	/* 
	 * Main method in this class
	 * Responsible for requesting and retrieving sensor data from the RBNB server
	 * @param - unitsPerFetch is the number of data time units (ms) to be fetched.
	 * Returns a SensorData[] to the ChartFormatter to be added to a set of charts.
	 */
	public void goFetchData(int start, int duration, int channelNUm) {
		ChannelMap aMap = new ChannelMap();
		int numChannels = 0;
		this.unitsPerFetch = unitsPerFetch;
		
		try {
			// The  duration parameter (provided in seconds) will need to be calibrated/decided
			// still. Default here.
			// startTime param too? Yes, will need to be -unitsPerFetch*secondsBetweenDataPoints 
	        sink.Request(rMap, -unitsPerFetch, unitsPerFetch, "newest");
	        
			if ((aMap = sink.Fetch(-1)) == null) 
			{
			    System.err.println("Data not received!");
			}
			
			/* May not be needed if number of channels are predefined. 
			   But it could be a good check nonetheless */
//			numChannels = aMap.NumberOfChannels();
			/* if(numChannels != NUMBER_OF_SENSORS) {
			 *    //do something
			 * }
			 */ 
			if(!GetAndSetSensorData(aMap)) {
				/* Try again? */
				GetAndSetSensorData(aMap);
			}    
		} catch (SAPIException e) {
			e.printStackTrace();
		}
	}

	/*
	 *  Gets the sensor data from each channel and adds it to an array of SensorData
	 * objects to be made available for the DataFacilitator Class
	 *
	 * @param - aMap is the ChannelMap representing the map of all lines to the server
	 */
	private boolean GetAndSetSensorData(ChannelMap aMap) {	   
		for(int i = 0; i < numChannels; i++) {
			/* Time not used for now... */
			//allSensorData[i].timeStamp = aMap.GetTimeStart(i);
			allSensorData[i] = new SensorData(unitsPerFetch);
			/* GetDataAsFloat64 returns an array type double
			 * Get the data and use SensorData */
			allSensorData[i].setData(aMap.GetDataAsFloat64(i));
		}
		
		return true;
	}

	// 	If the duration would like to altered for any reason 
	//	public void ChangeDuration(int duration) {
	//		sink.subscribe(rMap,-10.0, duration, "newest");
	//	}
	
	// Instead of killing and creating a new SensorDataRetriever object in ChartFormatter
	// when you want the subscription duration to change, this will close and 
	// reopen the connection with the desired unitsPerFetch for duration.
	//
	// Note: Might want other parameters representing desired subscription params
	public void ResetConnection(int unitsPerFetch) {
		try {
			EndConnection();
	        sink.OpenRBNBConnection();
	
	        // Pull data from the server:
	        ChannelMap rMap = new ChannelMap();
	        // TODO: ChannelName parameter still needs to be defined
	        rMap.Add("HelloWorld/HelloWorld");
	        
	        // The  duration parameter will need to be calibrated/decided still. Default here.
	        this.unitsPerFetch = unitsPerFetch;
	        sink.Subscribe(rMap,-10.0, this.unitsPerFetch, "newest");
	    } 
		catch (SAPIException se) {
			se.printStackTrace(); 
		}
	}
	
	/*
	 *  Closes the connection to the server
	 *  To be called at ending of DataFacilitator
	 */  
	public void EndConnection() {
		sink.CloseRBNBConnection();
	}
}
