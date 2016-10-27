////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////      ISSUES         /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Alphabetize channels before display. 
// 	Figure out a way to display channel after logos have all be saved

// ReDo Color Scheme

// Style input

// hide "channel errors" div until there is actually an error
////////////////////////////////////////////////////////////////////////////////////////
var channels = ["FreeCodeCamp", "BobRoss", "NoCopyrightSounds", "Food"];
var successResults = [];
var errorResults = [];

$(document).ready(function(e) {

    $("form").submit(function(event) {
        channels.push($("input:first").val());
        callChannels(channels, successResults);
        event.preventDefault();
    });

    callChannels(); //get online status and create/push object into successResults / errorResults
    //callChannels will call getLogos once all ajax requests have been completed
    //getLogos will make additional ajax requests to attain channel logo urls
    //once getLogos requests are finished, call displayChannel and displayError
    //display channel will clear the results from the page and re-print them in alphabetical order
    //displayError will also clear results from the page and reprint them (not in alphabetical order)

});

////////////////////////////////////////////////////////////////////////////////////////
//constructor
function Channel(name, url, stream) {
    this.name = name;
    this.url = url;
    this.stream = stream; //stream object, valued at null if channel is offline
    //Twitch.tv's default image (only filled if channel is online)
    this.logo = "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";
}

////////////////////////////////////////////////////////////////////////////////////////
// online status is not sent with channel logo,  a separate request must be made.

function callChannels() {
    successResults = []; //clear successful calls 
    errorResults = [];
    var finishedCount = 0;
    for (var i = 0; i < channels.length; i++) {
        $.ajax({
            url: "https://api.twitch.tv/kraken/streams/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f",
            dataType: 'jsonp',
            success: function(channelObj) {

                if (channelObj["error"]) { //error is typically user not found or inactive account
                	errorResults.push(channelObj);
                } else {
                    var stream = channelObj["stream"];
                    var name = channelObj["_links"]["self"].slice(channelObj["_links"]["self"].lastIndexOf("/") + 1).toLowerCase();
                    var url = "https://www.twitch.tv/" + name;
                    successResults.push(new Channel(name, url, stream)); //create channel object and push into Success Array
                } //close if statement 
            },
            error: function(errObj, errStr) { console.log("ERROR:  " + errStr);
                    console.log("ERRORobj:  " + errObj); } //possible problem with API url
        }).always(function() {
            finishedCount++;
            if (channels.length === finishedCount) {
                console.log("successResults.length " + successResults.length);
                getLogo(); // match on channel name and save logo url in Channel object
            }
        }); //close .always
    } // close for loop
} //close function

////////////////////////////////////////////////////////////////////////////////////////
// this function is dependent on callChannels being completed
//   it's purpose is to get logo URL for each channel requested

function getLogo() {
    var finishedCount = 0;
    for (var i = 0; i < channels.length; i++) {
        console.log("https://api.twitch.tv/kraken/channels/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f");
        $.ajax({
            url: "https://api.twitch.tv/kraken/channels/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f",
            dataType: 'jsonp', //jsonfm for debugging purposes. Change back to json when time to launch
            success: function(channelObj) {
                successResults.forEach(function(successChannel) {
                    if (!channelObj["error"]) { //there are no logos for results with an error
                        if (successChannel.name.toLowerCase() === channelObj["display_name"].toLowerCase()) { //find a match on "name" (ignore case)
                            successChannel.name = channelObj["display_name"]; //save "pretty" name
                            if (channelObj.logo) { //make sure logo isn't null
                                successChannel.logo = channelObj["logo"]; //save logo url		
                            }
                        }
                    }
                }); //close forEach
            },
            error: function(errObj, errStr) { console.log("ERROR:  " + errStr); }
        }).always(function() {
            finishedCount++;
            if (channels.length === finishedCount) { // all requests accounted for
                displayChannels(); //(re)print all channel
                displayError();
            } //close if
        }); //close .always
    } // close loop
} //close function

////////////////////////////////////////////////////////////////////////////////////////
// Reset page and loop through sorted channels
function sortArray(arr){
	return arr.sort(function(a, b) { //alphabetize object array
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1; }
        if (nameA > nameB) {
            return 1; }
        return 0; // names must be equal
    });
}
function displayChannels() {
    $("#success").html(""); //clear previous results
    sortArray(successResults).forEach(function(channelObj) { //reprint object by object
        appendChannel(channelObj);
    });
}

function appendChannel(channelObj) {
	//entire div is coded (though most of it is duplicat code) because if the div was separated,
	//  jQuery would automatically close div tag, which would separate online status from the rest of 
	//  the user data
    if (channelObj.stream == null) { // if offline...
        $("#success").append(
            '<div class = "channel">' +
            '<img src="' + channelObj.logo + '" alt="twitch.tv ' + channelObj.name + ' logo">' +
            '<i class="contents fa fa-circle-o fa-2x online" aria-hidden="true"></i>' +
            '<a class = "contents" href="https://www.twitch.tv/' + channelObj.name + '"><h2>' + channelObj.name + '</h2></a>' +
            '<p class = " status">OFFLINE</p> ');
    } else { //user is online, display status info
        $("#success").append(
            '<div class = "channel">' +
            '<img src="' + channelObj.logo + '" alt="twitch.tv ' + channelObj.name + ' logo">' +
            '<i class="contents fa fa-circle fa-2x online" aria-hidden="true"></i>' +
            '<a class = "contents" href="https://www.twitch.tv/' + channelObj.name + '"><h2>' + channelObj.name + '</h2></a>' +
            '<p class = "status">' + channelObj.stream.channel.status + '</p> </div>');
    }
}

////////////////////////////////////////////////////////////////////////////////////////
// display error messages to page

function displayError() {
	if(errorResults.length>0){ //only execute if there are actual error messages to execute
		$("div.channel.error").show(); //unhide error div
		$("#error").html(""); //clear previous results
	    errorResults.forEach(function(channelObj) { //reprint object by object
    		$("#error").append('<p class = "status">' + channelObj["message"] + '</p>');
    	});    
	}
}
