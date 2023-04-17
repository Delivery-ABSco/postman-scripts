/*  
    TZ is UTC and format is "YYYY-MM-DD HH:mm:ss"
    ** Set the End Date of the campaign to be 2 weeks ago
    ** Set the Start Date of the campaign to be 1 day ago
*/

/*
    Example use:
    var curTimeUTCMinus2weeks = new Date(Date.now() - 12096e5);
    var curTimeUTCMinus1Day = new Date(Date.now() - 86400000);
    var curTimeUTCMinus1Min = new Date(Date.now() - 60000);

    var curTimeUTCMinus2WeeksFormatted = formatDate(curTimeUTCMinus2weeks);
    var curTimeUTCMinus1DayFormatted = formatDate(curTimeUTCMinus1Day);
    var curTimeUTCMinus1MinFormatted = formatDate(curTimeUTCMinus1Min);
*/

function formatDate(dateObj) {
    var ISOString = dateObj.toISOString();
    var formattedDate = ISOString.slice(0, -5).replace('T', ' ');
    return formattedDate;
};
