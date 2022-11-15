const moment = require('moment');

const formater = {

  number: (val, digits=2) => {
    return (val).toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  date: (format='YYYY-MM-DD', dateString='') => {
    if(dateString) return moment(new Date(dateString)).format(format);
    else return moment(new Date()).format(format);
  },
  
  cleanTelephone: (val) => {
    return val.replaceAll('-', '').replaceAll(' ', '');
  },
  cleanKeyword: (val) => {
    return `${val}`.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  cleanFile: (val) => {
    if(!val) return null;
    val = JSON.parse(val);
    if(!val.path) return null;
    else return {
      originalname: val.originalname,
      mimetype: val.mimetype,
      filename: val.filename,
      size: Number(val.size),
      path: val.path,
    };
  },

};

module.exports = formater;