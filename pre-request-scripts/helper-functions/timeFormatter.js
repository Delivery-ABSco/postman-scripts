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
    var yr = dateObj.getUTCFullYear();
    var mth = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    var date = dateObj.getDate().toString().padStart(2, '0');
    var hrs = dateObj.getHours().toString().padStart(2, '0');
    var mins = dateObj.getMinutes().toString().padStart(2, '0');
    var secs = dateObj.getSeconds().toString().padStart(2, '0');
    var formattedDate = `${yr}-${mth}-${date} ${hrs}:${mins}:${secs}`;
    return formattedDate;
};
