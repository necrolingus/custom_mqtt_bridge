# custom_mqtt_bridge_for_sonoff
ISP cant do port forwarding, so wrote my own bridge

Will subscribe to remote server topic, then pass it on to local server topic, then immediately subscribe to "stat"/xxx topic to get the status of the sonoff device, then pass that back in a new connection to the remote server again, closing both internal connections once it is done, leaving only the outer connection open.

Simple enough to expand on and use out of the box
