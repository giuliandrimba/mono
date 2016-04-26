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