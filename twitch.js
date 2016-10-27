////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////      ISSUES         /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Alphabetize channels before display. 
// 	Figure out a way to display channel after logos have all be saved

// ReDo Color Scheme

// Style input

// hide "channel errors" div until there is actually an error
////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function(e) {

    var channels = ["brunofin", "FreeCodeCamp", "BobRoss", "NoCopyrightSounds", "Food", "comster404"];
    var successResults = [];

    $("form").submit(function(event) {
        var newchannels = [];
        newchannels.push($("input:first").val());
        callChannels(newchannels, successResults);
        event.preventDefault();
    });

    callChannels(channels, successResults); //get online status and create/push object into successResults / errorResults


    //displayChannel(successResults[i]); // display completed channel object


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

function callChannels(channels, successResults) {
    console.log("getting stream status");
    successResults = [];
    var finishedCount = 0;
    for (var i = 0; i < channels.length; i++) {
        //console.log("https://api.twitch.tv/kraken/streams/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f");

        $.ajax({
            url: "https://api.twitch.tv/kraken/streams/" + channels[i] + "?client_id=gnebhh24itgmuajfxv5sofgpu0uzz8f",
            dataType: 'jsonp', //jsonfm for debugging purposes. Change back to json when time to launch
            success: function(channelObj) {

                if (channelObj["error"]) {
                    displayError(channelObj); //typically user not found or inactive account
                } else {
                    var stream = channelObj["stream"];
                    var name = channelObj["_links"]["self"].slice(channelObj["_links"]["self"].lastIndexOf("/") + 1).toLowerCase();
                    var url = "https://www.twitch.tv/" + name;
                    successResults.push(new Channel(name, url, stream)); //create channel object and push into Success Array
                } //close if statement 
            },
            error: function(errObj, errStr) { console.log("ERROR:  " + errStr); } //problem with API url
        }).always(function() {
            finishedCount++;
            if (channels.length === finishedCount) {
            	console.log("successResults.length "+successResults.length);
                getLogo(successResults, channels); // match on channel name and save logo url in Channel object
            }
        }); //close .always
    } // close for loop
} //close function

////////////////////////////////////////////////////////////////////////////////////////
// this function is dependent on callChannels being completed
//   it's purpose is to get logo URL for each channel requested

function getLogo(successResults, channels) {
    var finishedCount = 0;
    console.log("getting logo");
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
                        	if(channelObj.logo){ //make sure logo isn't null
                        		successChannel.logo = channelObj["logo"]; //save logo url		
                        	}
                        }
                    }
                }); //close forEach
            },
            error: function(errObj, errStr) { console.log("ERROR:  " + errStr); }
        }).always(function() {
                finishedCount++;
                if (channels.length === finishedCount) {
                    var sortedSuccess = successResults.sort(function(a, b) {
                        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
                        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        // names must be equal
                        return 0;
                    }); //alphabetize object array
                console.log(sortedSuccess);
                sortedSuccess.forEach(function(channelObj) { //loop through channel objects
                    displayChannel(channelObj); //print channel
                }); //close forEach
            } //close if
        }); //close .always
} // close loop
} //close function

////////////////////////////////////////////////////////////////////////////////////////
// dynamically create DOM elements to display Channels 

function displayChannel(channelObj) {
    console.log("Display Channel Function");
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
