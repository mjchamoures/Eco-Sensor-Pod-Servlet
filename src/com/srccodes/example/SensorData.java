

package com.srccodes.example;

/** 
 * SensorData Class
 * 
 * Created 2/17/2013 by Michael Chamoures
 * 
 * Purpose:
 * 		Each object represents a type of Sensor Data (i.e. wind direction, ph, etc.) 
 * 		Contains a double type value for the sensor reading itself, and a double value 
 * 		for representing the timeStamp of that data
 */

public class SensorData {
	public double[] data; /**< Data array for a sensors fetched data */
	public double[] timeStamp; /**< Sec after 1970, jan 1st for each data pt*/

	/**
	 * Constructor
	 * Defaults to initialize each array to length 1
	 */
	public SensorData() {
		data = new double[1];
		timeStamp = new double[1];
	}
	
	/**
	 * Constructor
	 * Defaults to initialize each array to length 1
	 * @param numUnites Length to initialize instance variable arrays 
	 */
	public SensorData(int numUnits) {
		data = new double[numUnits];
		timeStamp = new double[numUnits];
	}
	
	/**
	 * @return Obect's current data array
	 */
	public double[] getData() {
		return this.data;
	}
	
	/**
	 * @return Obect's current timestamp array
	 */
	public double[] getTimeStamp() {
		return this.timeStamp;
	}
	
	/**
	 * @param newData Newly fetched data to fill data instance with 
	 */
	public void setData(double[] newData) {
		int i = 0;
		this.data = new double[newData.length];

		for(i = 0; i < newData.length; i++) {
			this.data[i] = newData[i]; 
		}
	}
	
	/**
	 * @param newData Newly fetched data to fill timestamp instance with 
	 */
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
	/*private void compressThenSetSensorData(double[] newSensorData) {
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
	}*/
}	
	
	
	
	