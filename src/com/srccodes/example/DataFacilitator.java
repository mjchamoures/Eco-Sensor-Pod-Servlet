


package com.srccodes.example;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.rbnb.sapi.SAPIException;
import com.srccodes.example.SensorDataRetriever;

/**
 * Servlet implementation class DataFacilitator
 * 
 * Purpose: The "MIDDLE-END". Acts as the middle man between front
 * 			and back end. Communicates requests and replies
 * 			to and from each. Parses results into JSON
 * 
 * Author: Michael Chamoures
 * 
 * Date: 6/11/2013
 */
@WebServlet("/DataFacilitator")
public class DataFacilitator extends HttpServlet {
	private static final long serialVersionUID = 1L;
        
	/**
	 * Intercepts JQuery/AJAX Post() requests from the front-end draw.js 
	 * @param request The various request variables passed from draw.js
	 * @param response Used to write back the JSON response to the front-end
	 * 	 	  to be charted
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		//System.out.println(request.getParameter("start"));
		String hostAddress = request.getParameter("hostAddress");
		String portNumber = request.getParameter("portNumber");
		int start = Integer.parseInt(request.getParameter("start"));
		int duration = Integer.parseInt(request.getParameter("duration"));
		String channelName = request.getParameter("channelName");
		String timeRef = request.getParameter("timeRef");
		SensorDataRetriever sdr;
		int i;
		try {
			/* Create a new SDR to open connection to RBNB server */
			sdr = new SensorDataRetriever(hostAddress, portNumber, channelName);
			/* Fill the SensorData instance var of sdr with data */
			sdr.goFetchData(start, duration, timeRef);
			
			
			
			/* Convert the arr[][] to JSON formatting for JQuery */
			String json = new Gson().toJson(sdr.sensorData);
			
			/* Close the connection */
			 sdr.EndConnection();
			
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			/* Pass along the data back to front-end! */
			response.getWriter().write(json);
		}
		catch(SAPIException e) {
			
		}
	}
}
