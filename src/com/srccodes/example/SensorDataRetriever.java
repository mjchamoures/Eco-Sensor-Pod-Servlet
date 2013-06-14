

package com.srccodes.example;

import com.rbnb.sapi.ChannelMap;
import com.rbnb.sapi.ChannelTree;
import com.rbnb.sapi.SAPIException;
import com.rbnb.sapi.Sink;

/** 
 * BACKEND: SensorDataRetriever Class
 * 
 * Purpose: Contains all the DataTurbine retrieval tasks.
 * 			Listens for requests from the DataFacilitator
 * 			Servlet. Fetches data for the requested channel
 * 			from the requested sensor pod deployment
 * 
 * Author: Michael Chamoures
 * 
 * Date: 6/11/2013
 */
public class SensorDataRetriever {
	private ChannelMap rMap; /**< Keeps track of channels requested */
	private Sink sink; /**< Sink object to open a connection with*/
	public SensorData sensorData; /**< Holds a sensors data and timestamps*/
	public int requestedChannelIndex; /**< Keeps track of the index returned to rMap*/
	public String[] channelNames; /**< Not used right now (6/11) */
	public int unitsPerFetch; /**< Duration worth of data to fetch*/
	
	/**
	 * Constructor.
	 * In the future this will be extended to construct a list
	 * of current available channel names.
	 * @param hostAddress Host address of deployed sensor pod
	 * @param portNumber Port number of deployed sensor pod 
	 */
	public SensorDataRetriever(String hostAddress, String portNumber) {
		try {
			ChannelTree ct;
			/* Initialize allSensorData array to known number of channels */
			sensorData = new SensorData();
			
	        /* Create the new sink object and open/setup connection */
	        sink=new Sink();
	        sink.OpenRBNBConnection(hostAddress + ":" + portNumber, "UCSDpier_mirror");
	        if(!sink.VerifyConnection()) {
	        	/* Try again? */
	        	System.err.println("Bad connection!\n");
	        }
	        /* Attempt to get all available Channel names from server */
	        rMap = new ChannelMap();
	        sink.RequestRegistration(rMap);
	        ct = ChannelTree.createFromChannelMap(rMap);
	        channelNames = rMap.GetChannelList();
	       
	        //while(ct.iterator().hasNext()) {
	        	System.out.println(ct.toString());
	        	//ct.iterator().next();
	       // }

	    } 
		catch (SAPIException se) {
			se.printStackTrace(); 
		}
	}
	
	/**
	 * Constructor if a channel name for a particular sensor 
	 * is all that's requested.Opens a connection with the desired sensor pod
	 * and adds the channelName to get data from to the channel map
	 * @param hostAddress Host address of deployed sensor pod
	 * @param portNumber Port number of deployed sensor pod 
	 * @param channelName Requested channel to get data from
	 */
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
	        /* Check to see the connection succeeded */
	        if(!sink.VerifyConnection()) {
	        	/* Try again? */
	        	System.err.println("Bad connection!\n");
	        }
	        
	        /* Set up request channel map */
	        rMap = new ChannelMap();
	        /* Add requested channel name to the channel map */
	        requestedChannelIndex = rMap.Add(channelName);
	    } 
		catch (SAPIException se) {
			se.printStackTrace(); 
		}
	}

	/** 
	 * Main method in this class
	 * Responsible for requesting and retrieving sensor data from the RBNB server
	 * Fills a SensorData object to DataFacilitator to be passed along
	 * to the front-end to be charted
	 * @param start Time in ms from Jan 1, 1970
	 * @param duration Duration of data to fetch, in ms
	 * @param timeRef "newest" or "absolute" depending on typee of fetch
	 */
	public void goFetchData(int start, int duration, String timeRef) throws SAPIException {
		ChannelMap aMap = new ChannelMap();
		this.unitsPerFetch = duration;
		double[] BAD_DATE_REQUEST = {-404}; /* Bad Data Request */
		
		try {
	        sink.Request(rMap, start, duration, timeRef);
	        
	        /* Wait half a second for the server to return data */
			if ((aMap = sink.Fetch(500)) == null) {
			    System.err.println("Data not received!");
			}

			/* GetDataAsFloat64 returns an array type double
			 * Get the data and use SensorData */	        
	        if (aMap.NumberOfChannels() != 0) {
	        	sensorData.setData(aMap.GetDataAsFloat64(requestedChannelIndex));   
		        sensorData.setTimeStamp(aMap.GetTimes(requestedChannelIndex));
	        }
	        else {
	        	sensorData.setData(BAD_DATE_REQUEST);   
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
	
	/**
	 *  Closes the connection to the server
	 *  To be called at ending of DataFacilitator
	 */  
	public void EndConnection() {
		sink.CloseRBNBConnection();
	}
}
