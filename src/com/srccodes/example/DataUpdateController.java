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
import com.sun.tools.javac.util.List;

/**
 * Servlet implementation class 
 */
@WebServlet("/DataUpdateController")
public class DataUpdateController extends HttpServlet {
	private static final long serialVersionUID = 1L;
        
	public SensorData sensor1Data = null;
	
	public DataUpdateController() {
		Random rand = new Random();
		sensor1Data = new SensorData();
		
		sensor1Data.data[0] = (rand.nextDouble()) * 6;
	}
	

	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		DataUpdateController d1 = new DataUpdateController();
		String json = new Gson().toJson(d1.sensor1Data);
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write(json);
	}
}
