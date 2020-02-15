# Warpcore - Automation Engine

Warpcore is an automation and task engine written in NodeJS. I wrote this specifically so that I could write automations for my smart home, but there's no reason why you couldn't use it for other purposes.

I began writing this as an alternative to existing solutions for Home Assistant for a few reasons:

1. I found the built-in YAML automation/scripting feature in Home Assistant to be cumbersome.
2. I don't enjoy the visual programming style of NodeRED and it often feels like implementating things in NodeRED is more complex and less elegant than could be accomplished through directly programming them.
3. I don't particularly love writing python, which is what AppDaemon uses.

My primary goal was to build a pure automation engine and leave the responsibility of maintaining state (outside of within an automation or task), to Home Assistant. I also wanted to be able to leverage all of the integrations that Home Assistant provides, but also have the ability to integrate directly with devices if I felt the need (I have found trying to get a well timed a light sequence through Home Assistant is difficult, for example).

Additionally, I had a requirement that couldn't be met by any of the above solutions out-of-the-box-- I wanted a queue system for job execution so that I could:
- Make task diferral easier.
- Have distributed worker nodes.

### Task diferral

Task diferral? What do you mean, what's the use-case?

Lets think about this in terms of an automation:

You have a plant sensor that reports moisture level, and you want to be alerted when it goes below a certain level.

Ok, so in any of the existing automation solutions, it's pretty easy to accomplish a simple notification whenever the sensor drops below a threshold, but what if that happens when we are out? or what if it's the middle of the night? We probably want to difer that notification to a time when we are less likely to forget about it. With Warpcore, we can dispatch a task to a queue to be executed once a condition is met (or immediately if we wanted)

### Distributed Worker Nodes

Really? How crazy are your automations that you need multiple nodes to handle the workload? Why the hell would you need that?

This might sound like it's either over-engineering or completely unnecessary, but it's not necessarily about the quantity of work that needs to be distributed, it's sometimes about the physical location of where that work needs to be done. Lets say your main home assistant server is located in a closet upstairs, but you had a small bluetooth device in your den, or a little IR blaster to turn off your tv, or maybe you had cannibalized one of your car remotes so you could automate your car starting. It's possible that any of these devices could be out of the range of your primary Home Assistant server, with Warpcore, you could deploy a little pi-zero as a worker node in those locations and have it consume a special queue for these tasks.

## Structure

So, how does this all work?

### Events

```
import BaseEvent from '#root/Events/BaseEvent';
import { dispatchTask } from '#root/Dispatcher';
import { TASK_ARM_HOME } from '#tasks/const';
import getLogger from '#services/LoggingService';

const logger = getLogger();

export default class ArmHomeNightly extends BaseEvent {
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
