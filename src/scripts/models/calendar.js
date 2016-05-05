import moment from "moment";
import chineseLunar from "chinese-lunar";
var gregorian = [];
var chinese = [];
var TOTAL_DAYS = 15;

window.chineseLunar = chineseLunar;

export function days(month, theme){
  if(theme === "chinese") {
    return chineseDays(month)
  }
  else{
    return romanDays(month)
  }
}

export function season(month){
  switch(month) {
    case 3:
    case 4:
      return "春天";
      break
    case 5:
    case 6:
    case 7:
      return "夏天";
      break
    case 8:
    case 9:
      return "秋天";
      break
    case 10:
    case 11:
    case 0:
    case 1:
    case 2:
      return "冬天";
      break
  }
}

function chineseDays(month){
  var diff = moment().month() - month;
  var date = moment().subtract(14 * diff, 'days')
  chinese = [];

  var l = chineseLunar.solarToLunar(new Date(date.year(), date.month(), date.date()))
  chinese[7] = chineseLunar.format(l, "D")

  for(var i = 6; i > -1; i--) {
    var a = date.clone();
    var b = a.subtract(7 - i, 'days')
    var l = chineseLunar.solarToLunar(new Date(b.year(), b.month(), b.date()))
    chinese[i] = chineseLunar.format(l, "D")
  }

  for(var i = 8; i < TOTAL_DAYS; i++) {
    var a = date.clone();
    var b = a.add(i - 7, 'days')
    var l = chineseLunar.solarToLunar(new Date(b.year(), b.month(), b.date()))
    chinese[i] = chineseLunar.format(l, "D")
  }

  return chinese;
}

function romanDays(month) {
  var diff = moment().month() - month;
  var date = moment().subtract(14 * diff, 'days')
  gregorian = [];
  gregorian[7] = date.date()

  for(var i = 6; i > -1; i--) {
    var a = date.clone();
    gregorian[i] = a.subtract(7 - i, 'days').date()
  }

  for(var i = 8; i < TOTAL_DAYS; i++) {
    var a = date.clone();
    gregorian[i] = a.add(i - 7, 'days').date()
  }

  return gregorian;
}