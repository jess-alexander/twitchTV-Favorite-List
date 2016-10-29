////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////      ISSUES         /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// ReDo Color Scheme

// Style textbox

// make pop-up message to notify user of channel found (same if not found)

// display time of ajax request (similar to facebook's "1 hr ago")

////////////////////////////////////////////////////////////////////////////////////////
var successResults = [];
var errorResults = [];
var listedChannels = ["FreeCodeCamp", "BobRoss", "NoCopyrightSounds", "Food","brunofin","comster404"];

$(document).ready(function(e) {

    $("#newChannel").submit(function(event) {
        event.preventDefault();
        var newChannel = [];
        newChannel.push($("input:first").val());
        listedChannels.push($("input:first").val());
        callChannels(newChannel, successResults);
    });

    $('div.view.all').click(function() {
        $(this).addClass("tabSelected");
        $('div.view.online').removeClass("tabSelected");
        $('div.view.offline').removeClass("tabSelected");
        $('div.view.refresh').removeClass("tabSelected");
        displayChannels("all")
    });
    $('div.view.online').click(function() {
        $(this).addClass("tabSelected");
        $('div.view.all').removeClass("tabSelected");
        $('div.view.offline').removeClass("tabSelected");
        $('div.view.refresh').removeClass("tabSelected");
        displayChannels("online")
    });
    $('div.view.offline').click(function() {
        $(this).addClass("tabSelected");
        $('div.view.all').removeClass("tabSelected");
        $('div.view.online').removeClass("tabSelected");
        $('div.view.refresh').removeClass("tabSelected");
        displayChannels("offline")
    });
    $('div.view.refresh').click(function() {
        $(this).addClass("tabSelected");
        $('div.view.all').addClass("tabSelected");
        $('div.view.online').removeClass("tabSelected");
        $('div.view.offline').removeClass("tabSelected");
        successResults = []; //clear previous channel data
        errorResults = [];
        callChannels(listedChannels); //load fresh data
    });

    callChannels(listedChannels);
    //callChannels will call getLogos once all ajax requests have been completed
    //getLogos will make additional ajax requests to attain channel logo urls
    //once getLogos requests are finished, call displayChannel and displayError
    //display channel will clear the results from the page and re-print them in alphabetical order
    //displayError will also clear results from the page and reprint them (not in alphabetical order)

});

////////////////////////////////////////////////////////////////////////////////////////
//constructor
function Channel(name, url, stream, timeStamp) {
    this.name = name;
    this.url = url;
    this.stream = stream; //stream object, valued at null if channel is offline
    this.timeStamp = timeStamp;
    //Twitch.tv's default image (replaced if channel is found AND has uploaded a photo)
    this.logo = "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";
}

////////////////////////////////////////////////////////////////////////////////////////
// get online status and create/push object into successResults / errorResults

function callChannels(channels) {
    //successResults = []; //clear successful calls 
    //errorResults = [];
    console.log("calling Channels");
    console.log(channels);
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
                    successResults.push(new Channel(name, url, stream, timeStamp())); //create channel object and push into Success Array
                } //close if statement 
            },
            error: function(errObj, errStr) {
                    console.log("ERROR:  " + errStr);
                    console.log("ERRORobj:  " + errObj);
                } //possible problem with API url
        }).always(function() {
            finishedCount++;
            if (channels.length === finishedCount) {
                console.log("successResults.length " + successResults.length);
                getLogo(channels); // match on channel name and save logo url in Channel object
            }
        }); //close .always
    } // close for loop
} //close function

////////////////////////////////////////////////////////////////////////////////////////
// this function is dependent on callChannels being completed
//   its purpose is to get a logo URL for each channel requested

function getLogo(channels) {
    var finishedCount = 0;
    console.log("grabbing logos");
    for (var i = 0; i < channels.length; i++) {
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
            if (channels.length === finishedCount) { // all requests accounted for?
                displayChannels("all"); //(re)print all channel
                displayError(); //(re)print all errors
            } //close if
        }); //close .always
    } // close loop
} //close function

////////////////////////////////////////////////////////////////////////////////////////
// Reset page and loop through sorted channels
function sortArray(arr) {
    console.log("SORT Channels");
    return arr.sort(function(a, b) { //alphabetize object array
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0; // names must be equal
    });
}

function displayChannels(online) {
    console.log("DISPLAY Channels");
    $("#success").html(""); //clear previous results
    sortArray(successResults).forEach(function(channelObj) { //reprint object by object

        switch (online) {
            case 'all':
                appendChannel(channelObj);
                break;
            case 'online':
                if (channelObj.stream !== null) { // if online...
                    appendChannel(channelObj);
                }
                break;
            case 'offline':
                if (channelObj.stream == null) { // if offline...
                    appendChannel(channelObj);
                }
                break;
        }
    });
    $('.view').css("display","inline-block");
}

function appendChannel(channelObj) {
    //entire div is coded (though most of it is duplicat code) because if the div was separated,
    //  jQuery would automatically close div tag, which would separate online status from the rest of 
    //  the user data
    console.log("APPEND Channel");
    if (channelObj.stream == null) { // if offline...
        $("#success").append(
            '<div class = "channel">' +
            '<img src="' + channelObj.logo + '" alt="twitch.tv ' + channelObj.name + ' logo">' +
            '<i class="contents fa fa-circle-o fa-2x" aria-hidden="true"></i>' +
            '<a class = "contents" href="https://www.twitch.tv/' + channelObj.name + '"><h2>' + channelObj.name + '</h2></a>' +
            '<p class = " status">OFFLINE</p> ' +
            '<p class="status clock">' + channelObj.timeStamp + '</p></div>');
    } else { //user is online, display status info
        $("#success").append(
            '<div class = "channel">' +
            '<img src="' + channelObj.logo + '" alt="twitch.tv ' + channelObj.name + ' logo">' +
            '<i class="contents fa fa-circle fa-2x" aria-hidden="true"></i>' +
            '<a class = "contents" href="https://www.twitch.tv/' + channelObj.name + '"><h2>' + channelObj.name + '</h2></a>' +
            '<p class = "status">' + channelObj.stream.channel.status + '</p>' +
            '<p class="status clock">' + channelObj.timeStamp + '</p></div>');
    }

}

////////////////////////////////////////////////////////////////////////////////////////
// display error messages to page

function displayError() {
    console.log("DISPLAY error");
    if (errorResults.length > 0) { //only execute if there are actual error messages to execute
        $("div.channel.error").show(); //unhide error div
        $("#error").html(""); //clear previous results
        errorResults.forEach(function(channelObj) { //reprint object by object
            $("#error").append('<p class = "status">' + channelObj["message"] + '</p>');
        });
    }
}


//////////////     CLOCK CODE   ///////////////////////////

//function to update and format clock
function timeStamp() {
    var weekArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    //fetch system date/time  
    var currentTime = new Date();

    //parse hours, minutes, seconds from currentTime variable 
    var currentDay = currentTime.getDay(); //index of weekArray;
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();

    //add a leading zero to minutes and seconds for more user friendly time display
    currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;

    // check for AM/PM and subtract 12 from PM hours
    var timeOfDay = (currentHours < 12) ? "AM" : "PM";
    currentHours = (currentHours > 12) ? currentHours - 12 : currentHours;

    //change mid-night from zero to twelve
    currentHours = (currentHours == 0) ? 12 : currentHours;

    //splice created variables together for proper display
    return weekArray[currentDay] + ',  ' + currentHours + ':' + currentMinutes + ' ' + timeOfDay;
}
