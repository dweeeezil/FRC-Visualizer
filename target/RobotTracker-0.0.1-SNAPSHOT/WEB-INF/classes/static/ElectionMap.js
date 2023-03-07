var map;
var Votes;
var Counties;
var CurrentYear = 2020;
var DrawMode = 2;

function SetMode(Mode)
{
    DrawMode = Mode;
    SetDataYear(CurrentYear);
}

function initMap() 
{
    SetupSlider();
    CreateMap();

    Votes = GetVotes();

    Counties = GetCounties();
    map.data.addGeoJson(Counties);

    var infowindow = new google.maps.InfoWindow();
            
    map.data.addListener('click', function(event) 
    {
        var FIPS = event.feature.getProperty('GEOID');
        var Name = event.feature.getProperty('NAME');
        if (FIPS.startsWith("0"))
        FIPS = FIPS.substring(1, FIPS.length);

        if (FIPS == "46102")
            FIPS = "46113";

        var Content = "";

        for (var i = 0; i < Votes.length; i++)
        {
          if (Votes[i].fips == FIPS)
          {
            var Total = Votes[i].votes_total_2020;
            var Dem = Votes[i].votes_democrat_2020;
            var Rep = Votes[i].votes_republican_2020;
            var Oth = Votes[i].votes_other_2020;

            Content += "<h2>" + Name + "<p>FIPS: " + FIPS + 
                       " <p>Total Votes: " + Total +
                       " <p>Dem Votes: " + Dem + "  (" + (100*Dem/Total).toFixed(0) + "%)" + 
                       " <p>Rep Votes: " + Rep + "  (" + (100*Rep/Total).toFixed(0) + "%)" + 
                       " <p>Other Votes: " + Oth + "  (" + (100*Oth/Total).toFixed(0) + "%)" + 
                       "</h2>";
            break;
          }
        }

        infowindow.setContent(Content);
        infowindow.setPosition(event.latLng); 
        infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
        infowindow.open(map);
    });    

    SetDataYear(2020);
}

function SetDataYear(DataYear)
{
    CurrentYear = DataYear;
    map.data.setStyle(function(feature) 
    {
        var FIPS = feature.getProperty('GEOID');

        if (FIPS.startsWith("0"))
            FIPS = FIPS.substring(1, FIPS.length);

        if (FIPS == "46102")
            FIPS = "46113";

        for (var i = 0; i < Votes.length; i++)
        {
            if (Votes[i].fips == FIPS)
            {
                var Total = Votes[i].votes_total_2020;
                var Dem = Votes[i].votes_democrat_2020;
                var Rep = Votes[i].votes_republican_2020;
                var Oth = Votes[i].votes_other_2020;

                Dem = Math.floor((Dem * 255) / Total);
                Rep = Math.floor((Rep * 255) / Total);
                Oth = Oth / Total * 10;

                if (DrawMode == 2)
                {
                    var Hex = rgbaToHex(Rep, 0, Dem, 255);
                    return {fillColor: Hex, strokeWeight: 1, fillOpacity: 1.0} 
                }
                else if (DrawMode == 1)
                {
                    var Hex = "";
                    if (Rep > Dem)
                        Hex = rgbaToHex(255, 0, 0, 255);
                    else
                        Hex = rgbaToHex(0, 0, 255, 255);
                        
                    return {fillColor: Hex, strokeWeight: 1, fillOpacity: 1.0} 
                }
                else
                {
                    var Hex = rgbaToHex(0, 255, 0, 255);
                    return {fillColor: Hex, strokeWeight: 1, fillOpacity: Oth}  
                }                
          }
        }
        
        return {fillColor: "#0000000",strokeWeight: 1, fillOpacity: 0.0}
    });

    var TotalVotes = 0;      
    var SortedVotes = [];
    for (var i = 0; i < Votes.length; i++)
    {
      if (Votes[i].votes_total_2020 > 0)
      {
          SortedVotes.push(Votes[i]);
          TotalVotes += parseInt(Votes[i].votes_total_2020);
      }
    }

    SortedVotes.sort((a, b) => {
        var DemA = parseInt(a.votes_democrat_2020);
        var RepA = parseInt(a.votes_republican_2020);
        var TotalA = DemA + RepA;
        DemA = Math.floor((DemA * 255) / TotalA);
        
        var DemB = parseInt(b.votes_democrat_2020);
        var RepB = parseInt(b.votes_republican_2020);
        var TotalB = DemB + RepB;
        DemB = Math.floor((DemB * 255) / TotalB);
      
        return DemA - DemB;
    });



    var Bucket = Math.floor((parseInt(SortedVotes[0].votes_democrat_2020) * 255) / (parseInt(SortedVotes[0].votes_democrat_2020) + parseInt(SortedVotes[0].votes_republican_2020)));    
    var BucketTotal = 0;

    var VoteGradient = "linear-gradient(90deg, #FF0000FF 0%, ";
    var CountyGradient = "linear-gradient(90deg, #FF0000FF 0%, ";
    var SimpleGradient = "linear-gradient(90deg, #FF0000FF 0%, ";
    var WeightedGradient = "linear-gradient(90deg, #FF0000FF 0%, ";
    var VotePercent = 0;
    var FoundSimpleCutoff = false;
    var FoundWeightedCutoff = false;
 
    for (var i = 0; i < SortedVotes.length; i++)
    {       
        var Dem = parseInt(SortedVotes[i].votes_democrat_2020);
        var Rep = parseInt(SortedVotes[i].votes_republican_2020);
        var Total = Dem + Rep;
        Dem = Math.floor((Dem * 255) / Total);

        if (Dem > Bucket)
        {
            VotePercent +=  BucketTotal * 100 / TotalVotes;
            VoteGradient += rgbaToHex(255 - Bucket, 0, Bucket, 255) + " " + Math.floor(VotePercent).toString() + "%, "; 

            BucketTotal = 0;
            Bucket = Dem;

            if (Bucket > 128 && !FoundWeightedCutoff)
            {
                FoundWeightedCutoff = true;
                WeightedGradient += rgbaToHex(255, 0, 0, 255) + " " + Math.floor(VotePercent - 1).toString() + "%, "; 
                WeightedGradient += rgbaToHex(0, 0, 255, 255) + " " + Math.floor(VotePercent).toString() + "%, "; 
            }
        }

        BucketTotal += Total;

        var CountyPercent = i * 100 / SortedVotes.length;
        CountyGradient += rgbaToHex(255 - Dem, 0, Dem, 255) + " " + Math.floor(CountyPercent).toString() + "%, "; 

        if (Dem > 128 && !FoundSimpleCutoff)
        {
            FoundSimpleCutoff = true;
            SimpleGradient += rgbaToHex(255, 0, 0, 255) + " " + Math.floor(CountyPercent - 1).toString() + "%, "; 
            SimpleGradient += rgbaToHex(0, 0, 255, 255) + " " + Math.floor(CountyPercent).toString() + "%, "; 
        }
    } 
    
    var VoteSpectrum = document.getElementById("VoteSpectrum");
    VoteGradient += "#0000FFFF 100%)";
    VoteSpectrum.style.background = VoteGradient;

    var CountySpectrum = document.getElementById("CountySpectrum");
    CountyGradient += "#0000FFFF 100%)";
    CountySpectrum.style.background = CountyGradient;

    var SimpleSpectrum = document.getElementById("SimpleSpectrum");
    SimpleGradient += "#0000FFFF 100%)";
    SimpleSpectrum.style.background = SimpleGradient;

    var WeightedSpectrum = document.getElementById("WeightedSpectrum");
    WeightedGradient += "#0000FFFF 100%)";
    WeightedSpectrum.style.background = WeightedGradient;
}

function SetupSlider()
{
    var slider = document.getElementById("YearSlider");
    slider.oninput = function() 
    {
      SetDataYear(2000 + (this.value * 4));
    }
};

function CreateMap()
{

    const styledMapType = new google.maps.StyledMapType(
        [
            { elementType: "geometry", stylers: [{ color: "#DDDDDD" }] },
            { elementType: "labels.text.stroke", stylers: [{ visibility: "off" }]},
            { elementType: "labels.text.fill", stylers: [{ visibility: "off" }]},
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ visibility: "off" }],
            },            
            {
                featureType: "administrative.locality",
                elementType: "labels.text.stroke",
                stylers: [{ visibility: "off" }],
            },
            {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#EEEEEE"}],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#000000" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.stroke",
                stylers: [{ visibility: "off" }],
            },
            {
                featureType: "transit",
                stylers: [{  visibility: "off" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#DDEEFF" }],
            }
        ],
        { name: "Styled Map" }
    );
    
    map = new google.maps.Map(document.getElementById("map"), 
    {
        center: { lat: 37.5, lng: -96.0 },
        zoom: 5.5,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        mapTypeControlOptions: 
        {
            mapTypeIds: ["styled_map"],
        }
    });

    map.mapTypes.set("styled_map", styledMapType);
    map.setMapTypeId("styled_map"); 
};

function GetCounties()
{
    return GetData("http://localhost:8080/GetData/?SET=COUNTIES");
};

function GetVotes()
{
    return GetData("http://localhost:8080/GetData/?SET=2020");
};

function GetData(FileName)
{
    var query_request = "";
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', FileName, false);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(query_request);

    if (xhr.status === 200) 
    {
        return JSON.parse(xhr.response);
    }
};

function componentToHex(c) 
{
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

function rgbaToHex(r, g, b, a) 
{
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
};



