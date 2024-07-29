const moment = require("moment");
const formatDate = (date) => {
    const retrievedDate = new Date(date);
    const formattedDate = moment(retrievedDate).format("YYYY-MM-DD");
    console.log(formattedDate); // Output: 2023-11-24
  
    return formattedDate;
  }


  module.exports = {formatDate}