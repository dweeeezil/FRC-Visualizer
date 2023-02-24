package com.RobotTracker.Server;


import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.wpi.first.wpilibj.networktables.NetworkTable;


@RestController
public class DataController 
{
    NetworkTable Table;
    

    public DataController()
    {
        NetworkTable.setClientMode();
        NetworkTable.setIPAddress("10.37.49.222"); //Replace with RoboRio IP.
        Table = NetworkTable.getTable("datatable"); //Replace with Networktable table name.
    }
    
    
    @GetMapping(value = "GetData/", produces = { "application/json", "text/html" })
    public ResponseEntity <String> GetData(@RequestParam(value = "SET", 
                                                                 defaultValue = "") 
                                                                 final String Set) 
    {    
        double TX = Table.getNumber("X", 0.0); //THESE ARE THE ADDRESSES FOR THE DATA
        double TY = Table.getNumber("Y", 0.0);

        System.out.println("X: " + TX + "    Y: " + TY); //Use this to check if data is correct.
        
        JSONObject BaseResults = new JSONObject();

        Double Radius = 100.0;
        Integer Center = 200;

        Radius = Radius + 50.0 + 50.0 * Math.sin(System.currentTimeMillis() / 100.0);

        Double XVal = Radius * Math.cos(System.currentTimeMillis() / 1000.0);
        Double YVal = Radius * Math.sin(System.currentTimeMillis() / 1000.0);
        
        Integer X = Center + XVal.intValue();
        Integer Y = Center + YVal.intValue();
        
        BaseResults.put("camx", X);
        BaseResults.put("camy", Y);

        Double ErrorRadius = Radius + 10.0 * Math.sin(System.currentTimeMillis() / 20.0);
        XVal = ErrorRadius * Math.cos(System.currentTimeMillis() / 1000.0);
        YVal = ErrorRadius * Math.sin(System.currentTimeMillis() / 1000.0);
        
        X = Center + XVal.intValue();
        Y = Center + YVal.intValue();

        BaseResults.put("encx", X); //This outputs to the HTML file
        BaseResults.put("ency", Y);

        return ResponseEntity.ok(BaseResults.toString());
    } 
}
