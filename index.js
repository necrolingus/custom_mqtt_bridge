console.log("Starting MQTT Bridge")

const mqtt = require('mqtt')

//clean: true will be impacted by "persistent_client_expiration" because this option 
//allows persistent clients (those with clean session set to false) to be removed if they do not \
//reconnect within a certain time frame

const connect_options_remote_main = {
    clientId:"custom_bridge_0001",
    username:"xxx",
    password:"xxxx",
    clean:false, //this is a persistent connection.
    rejectUnauthorized : false,
    reconnectPeriod: 5000
}

const connect_options_remote_stat = {
    clientId:"custom_bridge_0002",
    username:"xxxx",
    password:"xxxx",
    clean:false, //this is a persistent connection.
    rejectUnauthorized : false
}

const connect_options_local = {
    clientId:"custom_bridge_0001",
    username:"xxx",
    password:"xxx",
    clean:false, //this is a persistent connection.
}


var publish_options = {
    retain:true,
    qos:2}

var topic_list = ["cmnd/sonoff/dining-lamp/POWER"]


const client_remote = mqtt.connect('mqtts://9xxxxx:8883', connect_options_remote_main)
client_remote.on("connect", () => {	
    console.log("Main Remote Connected: " + client_remote.connected)

    client_remote.subscribe(topic_list) //only subscribe to cmnd topics here
    client_remote.on('message', (topic, message, packet) => {
        
        const client_local = mqtt.connect('mqtt://xxxx:1883', connect_options_local)
        client_local.on("connect", () => {	
            console.log("Main Local Connected: " + client_remote.connected)
            client_local.publish(topic, message, publish_options)

            create_stat_topic = topic.split("/")
            create_stat_topic[0] = "stat"
            create_stat_topic_string = create_stat_topic.join("/")
            
            //seems that sonoff will retain its last STAT message so lets grab it
            client_local.subscribe(create_stat_topic_string)
            client_local.on('message', (topic, message, packet) => {
                console.log("Main Local Topic: " + topic)

                //lets push that STAT message to the remote server and disconnect
                const client_remote2 = mqtt.connect('mqtts://xxxx:8883', connect_options_remote_stat)
                client_remote2.on("connect", () => {
                    console.log("Secondary Remote Connected: " + client_remote2.connected)	
                    client_remote2.publish(topic, message, publish_options)
                    client_remote2.end()
                    console.log("Secondary Remote Ended")
                })
                client_local.end()
                console.log("Main Local Ended")
            })
        })

        client_local.on("error", (error) => {
            console.log("Error: " + error);
            client_local.end()
        })
    })
})

client_remote.on("error", (error) => {
    console.log("Error: " + error);
    client_remote.end()
})
