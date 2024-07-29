const generateUserNum = () => {
  const CurrentDate = new Date();

  const year = CurrentDate.getFullYear().toString().slice(2);
  const month = (CurrentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = CurrentDate.getDate().toString().padStart(2, '0');
  const hour = CurrentDate.getHours().toString().padStart(2, '0');

  const randomNum2 = Math.floor(Math.random() * 90) + 10;

  const refNum = `${randomNum2}${month}${day}${hour}${year}`; //output: 1004100924
  
  return refNum;
}

module.exports = generateUserNum;