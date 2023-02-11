package com.RobotTracker.Server;

import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DataController 
{
    @GetMapping(value = "GetData/", produces = { "application/json", "text/html" })
    public ResponseEntity <String> GetData(@RequestParam(value = "SET", 
                                                                 defaultValue = "") 
                                                                 final String Set) 
    {     
        JSONObject BaseResults = new JSONObject();

        
        /*

        Comment out a bunch of the stuff below and replace it with camera & encoder data.

        I don't know how to pull data from the RoboRio or the Beelink, so this will need to be replaced with actual data.

        */


        Double Radius = 100.0;  //This isn't needed
        Integer Center = 200;   //This is needed, use this to set the world/coordinate origin.

        Radius = Radius + 50.0 + 50.0 * Math.sin(System.currentTimeMillis() / 100.0);   //This isn't needed

        Double XVal = Radius * Math.cos(System.currentTimeMillis() / 1000.0);   //This is needed, but the sin & cos stuff should be replaced with location data.
        Double YVal = Radius * Math.sin(System.currentTimeMillis() / 1000.0);   //^^^^^^^^
        
        Integer X = Center + XVal.intValue();   //This is probably needed, but XVal and YVal must be changed.
        Integer Y = Center + YVal.intValue();   //^^^^^^^^^
        
        BaseResults.put("camx", X); //Displays camera location x
        BaseResults.put("camy", Y); //Displays camera location y


        //This controls the encoder visualization, generally the same rules apply as to the camera data.
        Double ErrorRadius = Radius + 10.0 * Math.sin(System.currentTimeMillis() / 20.0);
        XVal = ErrorRadius * Math.cos(System.currentTimeMillis() / 1000.0); //Rplace with real data
        YVal = ErrorRadius * Math.sin(System.currentTimeMillis() / 1000.0); //Rplace with real data
        
        X = Center + XVal.intValue();
        Y = Center + YVal.intValue();

        BaseResults.put("encx", X);
        BaseResults.put("ency", Y);

        return ResponseEntity.ok(BaseResults.toString());
    } 
}