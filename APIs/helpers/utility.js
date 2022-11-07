const utility = {
  
  nextDays: (n=0) => {
    let today = new Date();
    return new Date(today.setDate(today.getDate() + n));
  },
  nexHours: (n=0) => {
    let today = new Date();
    return new Date(today.setHours(today.getHours() + n));
  },
  isToday: (date) => {
    let today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  },

  shuffle: (array) => {
    let currentIndex = array.length,  randomIndex;
    while(currentIndex != 0){
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  },

};

module.exports = utility;