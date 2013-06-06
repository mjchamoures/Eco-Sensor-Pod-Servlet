package com.srccodes.example;

import java.io.IOException;
import java.util.Date;
import java.util.Random;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.rbnb.sapi.SAPIException;
import com.srccodes.example.SensorData;
import com.srccodes.example.SensorDataRetriever;
import com.sun.tools.javac.util.List;

/**
 * Servlet implementation class DataFacilitator
 */
@WebServlet("/DataFacilitator")
public class DataFacilitator extends HttpServlet {
	private static final long serialVersionUID = 1L;
        
	public SensorData sensor1Data = null;
	
	public DataFacilitator() {
		/* I've maxed this out at 20,000 (~3.5 days at 15sec intervals) 
		 * before, but it's pretty slow. 
		 * Note: Number must match of js front-end side for now (drawHcart.js)
		 */
		int initialDataPoints = 3000; 
		Random rand = new Random();
		sensor1Data = new SensorData(initialDataPoints);
		
		for(int j = 0; j < initialDataPoints; j++) {
			if(j%50 == 0) {	
				sensor1Data.data[j] = (rand.nextDouble()) * 6;
			}
			else {
				sensor1Data.data[j] = 5.2;
			}
			// time is every 15 seconds right now
			// This assumes that the initial fetch has compressed
			// the data down so that each point represents 15 seconds worth of data
			// and therefore each time index is 15 seconds apart
			//date = new Date(java.lang.System.currentTimeMillis() - (initialDataPoints-j)*15000);
			//sensor1Data.timeStamp[j] = date;
		}
	}
	
	public DataFacilitator(int numDataPoints) {
		sensor1Data = new SensorData(numDataPoints);
		//Date date;
		Random rand = new Random();
		
		for(int j = 0; j < numDataPoints; j++) {
			if(j%50 == 0) {	
				sensor1Data.data[j] = (rand.nextDouble()) * 6;
			}
			else {
				sensor1Data.data[j] = 5.2;
			}
			// time is every 15 seconds right now
			// This assumes that the initial fetch has compressed
			// the data down so that each point represents 15 seconds worth of data
			// and therefore each time index is 15 seconds apart
			//date = new Date(java.lang.System.currentTimeMillis() - (numDataPoints-j)*15000);
			//sensor1Data.timeStamp[j] = date;
		}
	}
	
	
	/*public double getNewData(int index) {
		Date date;
		SensorData sensor1Data = new SensorData();
		
			sensor1Data.data[j] = j;
			// time is every 15 seconds right now
			// This assumes that the initial fetch has compressed
			// the data down so that each point represents 15 seconds worth of data
			// and therefore each time index is 15 seconds apart
			date = new Date(java.lang.System.currentTimeMillis());
			sensor1Data.timeStamp[j] = date;
		}
	}*/
	
	/*public Date getDates(int index) {
		return sensor1Data.timeStamp[index];
	}*/
	

	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		/* TODO: Un-comment this code out when we have sensor readings */
		 // SensorDataRetriever sdr = new SensorDataRetriever(); 
		/* This var reps the initial number of data points to be fetched */
		// int numInitialDataPoints = 2000; //about 30 minutes at 1 second apart
		// int timeBetweenDataPoints = 2000; //milliseconds
		
		 //SensorData[] sensorData = sdr.goFetchData();

		
		DataFacilitator d1 = new DataFacilitator();
		String json = new Gson().toJson(d1.sensor1Data);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		//System.out.println(request.getParameter("start"));
		String hostAddress = request.getParameter("hostAddress");
		String portNumber = request.getParameter("portNumber");
		int start = Integer.parseInt(request.getParameter("start"));
		int duration = Integer.parseInt(request.getParameter("duration"));
		String channelName = request.getParameter("channelName");
		String timeRef = request.getParameter("timeRef");
		
		/* Get sensor readings! */
		SensorDataRetriever sdr;
		try {
			sdr = new SensorDataRetriever(hostAddress, portNumber, channelName);
			/* Fill the SensorData instance var of sdr with data */
			sdr.goFetchData(start, duration, timeRef);
			//DataFacilitator d1 = new DataFacilitator(duration);
			
			/* Pass along the data back to front-end! */
			String json = new Gson().toJson(sdr.sensorData);
			//String json = new Gson().toJson(d1.sensor1Data);
			
			/* Close the connection */
			 sdr.EndConnection();
			
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			response.getWriter().write(json);
		} catch (SAPIException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
	}
}
