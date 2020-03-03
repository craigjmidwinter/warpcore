[![warpcorejs on NPM](https://img.shields.io/npm/v/warpcorejs?style=for-the-badge)](https://www.npmjs.com/package/warpcorejs)

# Warpcore - Automation Engine

Warpcore is an automation and task engine written in NodeJS. I wrote this specifically so that I could write automations for my smart home, but there's no reason why you couldn't use it for other purposes.

## Why?

I've gone into a few of the reasons why on my blog.[You can check it the post here!](https://149walnut.com/introducing-warpcorejs/)

## How does this all work?

First off, let me apologize. This documentation is kinda shitty right now. This project is very much a work in progress, and very incomplete. If you are using it at this stage, it will likely take a bit of digging through the source to see what is going on, but here's the jist of it.

There are two main components to Warpcore that you'll regularly use: Events and Tasks.

### Events

In it's most basic form, an Event is a class with two functions, `meetsCondition()` and `action()`.  If `meetsCondition()` returns true, then `action()` will execute. Right now there are two different event providers, Home Assistant and Time-- All Home Assistant events get evaluated every time an event happens in Home Assistant, and Time events get evaluated once per minute. I'd love to add more providers so feel free to submit a pull request. 

Home Assistant events get the event data passed in to each function. If you want, you can execute whatever you wan directly in the action, but I would suggest dispatching a task so that you can re-use tasks as well as have the benefit of easy task deferral. 

Here's an example event from my setup it uses `warpcorejs-homeassistant` which is the warpcore service for Home Assistant, but it's triggered by `warpcorejs-time` which is a service which evaluates the events once every second:

```
import { BaseEvent, serviceContainer } from "warpcorejs";
import HomeAssistantService from "warpcorejs-homeassistant";
import moment from "moment";
import ArmHome from "../../Tasks/ArmHome";

export default class NightlyAlarm extends BaseEvent {
  meetsCondition = () => {
    const time = moment().format("HH:mm:ss");
    if (time !== "21:20:00") {
      return false;
    }
    const hassService = serviceContainer.getService(HomeAssistantService);
    return hassService
      .getState("alarm_control_panel.149_walnut_street")
      .then(entity => {
        if (entity.state === "disarmed") {
          return true;
        }

        return false;
      });
  };

  action = data => {
    console.info("dispatching task arm alarm");

    this.dispatchTask({
      taskName: ArmHome.NAME,
      taskData: data
    });
  };
}
```

### Tasks

Tasks at a basic level are a class that consist of two functions, `preExecution()` and `execute()`. When a task gets handled by a worker, it first executes the `preExecution()` function which can return one of three values:
```
PRE_EXECUTION_RESULTS.EXECUTE
PRE_EXECUTION_RESULTS.REQUEUE
PRE_EXECUTION_RESULTS.DISMISS
```

`EXECUTE` will execute the task, `REQUEUE` will put the task back in to the queue to be evaluated again later, and `DISMISS` will delete the task from the queue without executing the task.

Below is an example of a basic task:

```
import { BaseTask, serviceContainer } from "warpcorejs";
import HomeAssistantService from "warpcorejs-homeassistant";

export default class ArmHome extends BaseTask {
  static NAME = "task_arm_home";

  preExecution = async () => {
    const date = new Date();
    const currentHour = date.getHours();
    const hassService = serviceContainer.getService(HomeAssistantService);
    if (!hassService.connected) {
      return BaseTask.Constants.PRE_EXECUTION_RESULTS.REQUEUE;
    }
    // Since we can have multiple triggers per task, lets make sure this is happening only at a reasonable time
    if (currentHour > 19 || currentHour < 8) {
      return BaseTask.Constants.PRE_EXECUTION_RESULTS.EXECUTE;
    }
    return BaseTask.Constants.PRE_EXECUTION_RESULTS.DISMISS;
  };

  execute = async () => {
    console.info("Arming Home");
    const hassService = serviceContainer.getService(HomeAssistantService);
    if (!hassService.connected) {
      throw new Error("not connected");
    }

    hassService.callService({
      domain: "alarm_control_panel",
      service: "alarm_arm_home",
      serviceData: {
        entity_id: "alarm_control_panel.149_walnut_street"
      }
    });
  };
}
```

### Putting it all together
Putting it all together is simple, the entry point for our warpcore project looks like this:

```
import Warpcore from "warpcorejs";
import HomeAssistantService from "warpcorejs-homeassistant";
import TimeService from "warpcorejs-time";
import dotenv from "dotenv"

dotenv.config();

import CraigsLampChanged from "./Events/CraigsLampChanged";
import NightlyAlarm from "./Events/NightlyAlarm";
import ArmHome from "./Tasks/ArmHome";

const {
  HASS_URL,
  HASS_ACCESS_TOKEN,
  BEANSTALK_HOST,
  BEANSTALK_PORT
} = process.env;

const warpcore = new Warpcore({
  services: [
    {
      Service: TimeService,
      Events: [NightlyAlarm]
    },
    {
      Service: HomeAssistantService,
      ServiceOptions: {
        hass_url: HASS_URL,
        access_token: HASS_ACCESS_TOKEN
      },
      Events: [CraigsLampChanged]
    }
  ],
  tasks: {
    [ArmHome.NAME]: ArmHome
  },
  queue: {
    beanstalkd: {
      host: BEANSTALK_HOST,
      port: BEANSTALK_PORT
    }
  }
});

warpcore.start();
```

## Next Steps

This is very much a work in progress, so if you are brave and want to try getting this going, it might take a bit of exploration to get it going. I'm hoping to continue working on it in my spare time, and I welcome anyone who is interested in contributing to it. I'll try to create some issues for potential contributors, but here are some things I'm hoping to work towards:
 - Better documentation: There's a lot of room for improvement here
 - Add worker mode-- 
 - Event viewer front end: Some sort of event log would be helpful for developing automations
