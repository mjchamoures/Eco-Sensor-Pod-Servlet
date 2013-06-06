package com.srccodes.example;

/* SensorData Class
 * Created 2/17/2013 by Michael Chamoures
 * 
 * Purpose:
 * 		Each object represents a type of Sensor Data (i.e. wind direction, ph, etc.) 
 * 		Contains a double type value for the sensor reading itself, and a double (maybe Date) value 
 * 		for representing the timeStamp of that data
 */




public class SensorData {
	public double[] data;
	/* If 6, means take every 6th point (6th second), so that 10 indices worth 
	   of data represents a full minute */
	public static int timeBetweenDataPoints = 1;
	/* To make sure all the data made it here before being compressed. 
	Should match on SensorDataRetriever side */
	private static int unitsPerFetch;
	
	public double[] timeStamp; /* Sec after 1970, jan 1st for each data pt*/
	
	public SensorData() {
		data = new double[1];
		//timeStamp = new Date[1];
	}
	
	public SensorData(int numUnits) {
		unitsPerFetch = numUnits;
		/* Could have some sort of integer division error */
		data = new double[numUnits/*/timeBetweenDataPoints*/]; // commented for now (5/1)
		timeStamp = new double[numUnits];
	}
	
	public double[] getData() {
		return this.data;
	}
	
	public double[] getTimeStamp() {
		return this.timeStamp;
	}
	
	/*
	 * Very simplified for now, just compresses and sets data
	 * If someone wants to set the data some other way
	 * in the future this could act as a starting place
	 * for other ways of compressing data maybe
	 */
	public void setData(double[] newData) {
		int i = 0;
		this.data = new double[newData.length/*/timeBetweenDataPoints*/]; // commented for now (5/1)

		for(i = 0; i < newData.length; i++) {
			this.data[i] = newData[i]; 
		}
		/*if(newData.length != unitsPerFetch)
		{
			System.err.println("Incorrect Number of Data units!" + newData.length + " " + unitsPerFetch); 
		}
		compressThenSetSensorData(newData);*/
	}
	
	public void setTimeStamp(double[] timeStamp) {
		int i;
		this.timeStamp = new double[timeStamp.length];
		for(i = 0; i < timeStamp.length; i++) {
			this.timeStamp[i] = timeStamp[i]; 
		}
	}
	
	/* 
	 * Initial method of compressing data.
	 * Takes every 6th seconds data points for each channels data so it 
	 * can be stored so that it fits the time between data points desired 
	 * on the initial data request. Only called upon initial setup since
	 *  that's the only time there will be multiple data points
	 */ 
	private void compressThenSetSensorData(double[] newSensorData) {
		int i, j=0;
		
		for(i = 0; i < newSensorData.length; i++) {
			if(i % timeBetweenDataPoints == 0)
				if(i == 0) {
					this.data[j++] = newSensorData[i];
				}
				else if (i >= timeBetweenDataPoints) {
					this.data[j++] = newSensorData[i];
				}
		}
	}
}	
	
	
	
	