////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////      ISSUES         /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Alphabetize channels before display. 
// 	Figure out a way to display channel after logos have all be saved

// ReDo Color Scheme

// Style input

// hide "channel errors" div until there is actually an error
////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(e){
   
  	var channels = ["brunofin", "FreeCodeCamp", "BobRoss", "NoCopyrightSounds", "Food", "MusicianPhysician", "comster404"];
    var successResults = [];
    var errorResults = [];

    $("form").submit(function(event) {
        var newChannels = [];
        newChannels.push($("input:first").val());
        //newChannels.sort();
        console.log(newChannels);
        isOnline(newChannels, successResults, errorResults);
        event.preventDefault();
    });

    isOnline(channels, successResults, errorResults); //get online status and create/push object into successResults / errorResults


    displayChannel(successResults[i]); // display completed channel object


}); 

////////////////////////////////////////////////////////////////////////////////////////
//constructor
function Channel(name, url, stream, logo) {
    this.name = name;
    this.url = url;
    this.stream = stream; //stream object, valued at null if channel is offline
    this.logo = logo; //URL (only filled if channel is online)
}

////////////////////////////////////////////////////////////////////////////////////////
// online status is not sent with channel logo,  a separate request must be made.

function isOnline(channels, successResults, errorResults) {
	console.log("getting stream status");
    for (var i = 0; i < channels.length; i++) {
    	console.log()
        console.log("https://api.twitch.tv/kraken/streams/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f");
        $.ajax({
            url: "https://api.twitch.tv/kraken/streams/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f",
            dataType: 'jsonp', //jsonfm for debugging purposes. Change back to json when time to launch
            success: function(channelObj) {
                if (channelObj["error"]) {
                    displayError(channelObj);
                } else {
                    var stream = channelObj["stream"];
                    var name = channelObj["_links"]["self"].slice(channelObj["_links"]["self"].lastIndexOf("/") + 1).toLowerCase();
                    var url = "https://www.twitch.tv/" + name;
                    var online = (channelObj["stream"] == null) ? "fa-circle-o" : "fa-circle";
                    var logo = ''; //to be filled at next API call
                    successResults.push(new Channel(name, url, stream, online, logo));
                    successResults.sort();
                } //close if statement 
            },
            error: function(errObj, errStr) {console.log("ERROR:  " + errStr); }
        });
    }
    getLogo(successResults, channels); // match on channel name and save logo url in Channel object
}

////////////////////////////////////////////////////////////////////////////////////////
// logos are not sent for for channels who are not currently online
//   but they are available in general channel information

function getLogo(successResults, channels) {
	console.log("getting logo");
    for (var i = 0; i < channels.length; i++) {
        console.log("https://api.twitch.tv/kraken/channels/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f");
        $.ajax({
            url: "https://api.twitch.tv/kraken/channels/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f",
            dataType: 'jsonp', //jsonfm for debugging purposes. Change back to json when time to launch
            success: function(channelObj) {
            	console.log(channelObj);
            	console.log(successResults[successResults.length-1]);
                if (!channelObj["error"]) { //there are no logos for results with an error

                    for (var i = 0; i < successResults.length; i++) { //loop through successResults 
                        if (successResults[i].name === channelObj["display_name"].toLowerCase()) { //to find a match on "name" 
                            successResults[i].logo = channelObj["logo"]; //save logo url
                        	successResults[i].name = channelObj["display_name"];
                        	displayChannel(successResults[i]);
                        }
                    }
                }
            },
            error: function(errObj, errStr) { console.log("ERROR:  " + errStr); }
        });
    }
}

////////////////////////////////////////////////////////////////////////////////////////
// dynamically create DOM elements to display Channels 

function displayChannel(channelObj) {
    console.log("Display Channel Function");
    console.log(channelObj.stream);
    if (channelObj.stream == null) {
        $("#success").append(
            '<div class = "channel">' +
            '<img src="' + channelObj.logo + '" alt="twitch.tv ' + channelObj.name + ' logo">' +
            '<i class="contents fa fa-circle-o fa-2x online" aria-hidden="true"></i>' +
            '<a class = "contents" href="https://www.twitch.tv/' + channelObj.name + '"><h2>' + channelObj.name + '</h2></a>' +
            '<p class = " status">OFFLINE</p> ');
    } else {
        $("#success").append(
            '<div class = "channel">' +
            '<img src="' + channelObj.logo + '" alt="twitch.tv ' + channelObj.name + ' logo">' +
            '<i class="contents fa fa-circle fa-2x online" aria-hidden="true"></i>' +
            '<a class = "contents" href="https://www.twitch.tv/' + channelObj.name + '"><h2>' + channelObj.name + '</h2></a>' +
            '<p class = "status">' + channelObj.stream.channel.status + '</p> </div>');

    }
}

////////////////////////////////////////////////////////////////////////////////////////
// dynamically create DOM elements to display Channels who were not found

function displayError(channelObj) {

    $("#error").append('<p class = "status">' + channelObj["message"] + '</p>');
}
