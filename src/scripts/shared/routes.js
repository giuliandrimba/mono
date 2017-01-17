import * as layout from "scripts/views/layout";
import * as intro from "scripts/views/intro";
import * as monkey from "scripts/views/monkey";
import * as calendar from "scripts/views/calendar";
import ways from "ways";

export function init() {
  ways.flow('destroy+run');
  
  ways("/", layout.intro, layout.outro);
  ways("/intro", intro.intro, intro.outro, "/");
  ways("/monkey", monkey.intro, monkey.outro, "/");
  ways("/calendar", calendar.intro, calendar.outro, "/");

  ways.go("/monkey")
}