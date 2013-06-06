package com.srccodes.example;

import com.rbnb.sapi.ChannelMap;
import com.rbnb.sapi.SAPIException;
import com.rbnb.sapi.Sink;


public class SensorDataRetriever {
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
	public int requestedChannelIndex;
	
	public SensorDataRetriever() {
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
	
	/* If a channel number for a particular sensor is all that's rewquested */
	public SensorDataRetriever(String hostAddress, String portNumber, String channelName)
			throws SAPIException{
		try {
			
			/* Initialize allSensorData array to known number of channels */
			sensorData = new SensorData();
			
	        /* Create the new sink object and open/setup connection */
	        sink=new Sink();
	        /* Parameters are the address of the server to connect to, and the 
	         * name used to identify this client on the server
	         */
	        sink.OpenRBNBConnection(hostAddress + ":" + portNumber, "UCSDpier_mirror");
	        //sink.OpenRBNBConnection();
	        /* Check to see the connection succeeded */
	        if(!sink.VerifyConnection()) {
	        	/* Try again? */
	        	System.err.println("Bad connection!\n");
	        	//sink.OpenRBNBConnection("50.18.112.125:4444", "OSDT");
	        }
	        
	        /* Set up request channel map */
	        rMap = new ChannelMap();
	        System.out.println("channelName Requested: " + channelName);
	        /* Add requested channel name to the channel map */
	        requestedChannelIndex = rMap.Add(channelName);
	        System.out.println("requestedChannelIndex: " + requestedChannelIndex);
	        System.out.println("rMap numChannels: " + rMap.NumberOfChannels());
	    } 
		catch (SAPIException se) {
			se.printStackTrace(); 
		}
	}
	
/*	private String getChannelName(int channelNum) {
		// TODO: Get rid of these Magic numbers 
		switch(channelNum) {
		case 0:
			//internalVoltage for now
			return "HelloWorld/HelloWorld";
		case 1:
			//internalTemp for now
			return "HelloWorld/HelloWorld";
		case 2:
			//internalHumidity for now
			return "HelloWorld/HelloWorld";
		default:
			 //Channel not found. Report it 
			System.err.println("Invalid channelNum or not available!"); 
			return null;
		}
	}*/

	/* 
	 * Main method in this class
	 * Responsible for requesting and retrieving sensor data from the RBNB server
	 * @param - 
	 * Returns a SensorData object to DataFacilitator to be passed along
	 * to the front-end to be charted
	 */
	public void goFetchData(int start, int duration, String timeRef) throws SAPIException {
		ChannelMap aMap = new ChannelMap();
		this.unitsPerFetch = duration;
		double[] BAD_DATE_REQUEST = {-404}; /* Bad Data Request */
		
		try {
			// The  duration parameter (provided in seconds) will need to be calibrated/decided
			// still. Default here.
			// startTime param too? Yes, will need to be -unitsPerFetch*secondsBetweenDataPoints 
	        sink.Request(rMap, start, duration, timeRef);
	        
	        /* Wait half a second for the server to return data */
			if ((aMap = sink.Fetch(500)) == null) {
			    System.err.println("Data not received!");
			}
	        System.out.println("aMap numChannels: " + aMap.NumberOfChannels());
	        System.out.println("start seconds: " + start);
	        System.out.println("duration seconds: " + duration);
	        System.out.println("timeref: " + timeRef);
//			sensorData = new SensorData(duration);
			/* GetDataAsFloat64 returns an array type double
			 * Get the data and use SensorData */
	        
	        if (aMap.NumberOfChannels() != 0) {
	        	sensorData.setData(aMap.GetDataAsFloat64(requestedChannelIndex));   
		        System.out.println("data: " + sensorData.data[0]);
		        sensorData.setTimeStamp(aMap.GetTimes(requestedChannelIndex));
	        }
	        else {
	        	sensorData.setData(BAD_DATE_REQUEST);   
		        System.out.println("data: " + sensorData.data[0]);
		        sink.Request(rMap, 0, 1, "newest");
		        /* Wait half a second for the server to return data */
				if ((aMap = sink.Fetch(500)) == null) {
				    System.err.println("Data not received!");
				}
				if (aMap.NumberOfChannels() != 0) {
					sensorData.setTimeStamp(aMap.GetTimes(requestedChannelIndex));
				}
				else {
					sensorData.setTimeStamp(BAD_DATE_REQUEST);
				}
	        }
			

		} catch (SAPIException e) {
			e.printStackTrace();
		}
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
