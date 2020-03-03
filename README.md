# Warpcore - Automation Engine

Warpcore is an automation and task engine written in NodeJS. I wrote this specifically so that I could write automations for my smart home, but there's no reason why you couldn't use it for other purposes.

## Why?

I began writing this as an alternative to existing solutions for Home Assistant for a few reasons:

1. I found the built-in YAML automation/scripting feature in Home Assistant to be cumbersome.
2. I don't enjoy the visual programming style of NodeRED and it often feels like implementating things in NodeRED is more complex and less elegant than could be accomplished through directly programming them.
3. I don't particularly love writing python, which is what AppDaemon uses.

My primary goal was to build a pure automation engine and leave the responsibility of maintaining state (outside of within an automation or task), to Home Assistant. I also wanted to be able to leverage all of the integrations that Home Assistant provides, but also have the ability to integrate directly with devices if I felt the need (I have found trying to get a well timed a light sequence through Home Assistant is difficult, for example).

Additionally, I had a requirement that couldn't be met by any of the above solutions out-of-the-box-- I wanted a queue system for job execution so that I could:
- Make task deferral easier.
- Have distributed worker nodes.

### Task deferral

Task deferral? What do you mean, what's the use-case?

Lets think about this in terms of an automation:

You have a plant sensor that reports moisture level, and you want to be alerted when it goes below a certain level.

Ok, so in any of the existing automation solutions, it's pretty easy to accomplish a simple notification whenever the sensor drops below a threshold, but what if that happens when we are out? or what if it's the middle of the night? We probably want to defer that notification to a time when we are less likely to forget about it. With Warpcore, we can dispatch a task to a queue to be executed once a condition is met (or immediately if we wanted)

### Distributed Worker Nodes

Really? How crazy are your automations that you need multiple nodes to handle the workload? Why the hell would you need that?

This might sound like it's either over-engineering or completely unnecessary, but it's not necessarily about the quantity of work that needs to be distributed, it's sometimes about the physical location of where that work needs to be done. Lets say your main home assistant server is located in a closet upstairs, but you had a small bluetooth device in your den, or a little IR blaster to turn off your tv, or maybe you had cannibalized one of your car remotes so you could automate your car starting. It's possible that any of these devices could be out of the range of your primary Home Assistant server, with Warpcore, you could deploy a little pi-zero as a worker node in those locations and have it consume a special queue for these tasks.

## How does this all work?

First off, let me apologize. This documentation is kinda shitty right now. This project is very much a work in progress, and very incomplete. If you are using it at this stage, it will likely take a bit of digging through the source to see what is going on, but here's the jist of it.

There are two main components to Warpcore that you'll regularly use: Events and Tasks.

### Events

In it's most basic form, an Event is a class with two functions, `meetsCondition()` and `action()`.  If `meetsCondition()` returns true, then `action()` will execute. Right now there are two different event providers, Home Assistant and Time-- All Home Assistant events get evaluated every time an event happens in Home Assistant, and Time events get evaluated once per minute. I'd love to add more providers so feel free to submit a pull request. 

Home Assistant events get the event data passed in to each function. If you want, you can execute whatever you wan directly in the action, but I would suggest dispatching a task so that you can re-use tasks as well as have the benefit of easy task deferral. 

Here's an example event:

```
import BaseEvent from '#root/Events/BaseEvent';
import { dispatchTask } from '#root/Dispatcher';
import { entityWentOn } from '#services/';
import { TASK_ARM_HOME } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class ArmHomeWhenBloomGoesOn extends BaseEvent {
  // I don't know why you would want to do this for real
  static meetsCondition(data) {
    const { hassData } = data;
    return entityWentOn({ hassData, entityId: 'light.bloom' });
  }
  static async action(data) {
    logger.info('Dispatching task arm home');

    dispatchTask({
      taskName: TASK_ARM_HOME,
      taskData: {},
    });
  }
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
import BaseTask from '#root/Tasks/BaseTask';
import HomeAssistantService from '#services/HomeAssistant';
import { PRE_EXECUTION_RESULTS } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class ArmHome extends BaseTask {
  preExecution = async () => {
    return PRE_EXECUTION_RESULTS.EXECUTE;
  };

  execute = async () => {
    logger.info('Arming Home');
    try {
      await HomeAssistantService.callService({
        domain: 'alarm_control_panel',
        service: 'alarm_arm_home',
      });
    } catch (e) {
      logger.error(e);
    }
  };
}
```
## Next Steps

This is very much a work in progress, so if you are brave and want to try getting this going, it might take a bit of exploration to get it going. I'm hoping to continue working on it in my spare time, and I welcome anyone who is interested in contributing to it. I'll try to create some issues for potential contributors, but here are some things I'm hoping to work towards:
 - Better documentation: There's a lot of room for improvement here
 - Make it more portable/modular: Right now, to get it working you basically have to clone the repository and edit the code directly. Ideally, I'd like to be able to have a docker image that you can just mount in your own tasks and events and have it work
 - Event viewer front end: Some sort of event log would be helpful for developing automations
