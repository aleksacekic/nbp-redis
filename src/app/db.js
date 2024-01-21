import { createClient } from "redis";

const client = createClient({
  password: "fwVzGyxBw8udykChwPq2HvCsPQ5Xshdf",
  socket: {
    host: "redis-13957.c323.us-east-1-2.ec2.cloud.redislabs.com",
    port: 13957,
  },
});

client.on("error", (err) => console.log(err));

if (!client.isOpen) {
  client.connect();
}

const client_lis = createClient({
  password: "fwVzGyxBw8udykChwPq2HvCsPQ5Xshdf",
  socket: {
    host: "redis-13957.c323.us-east-1-2.ec2.cloud.redislabs.com",
    port: 13957,
  },
});

client_lis.on("error", (err) => console.log(err));

if (!client_lis.isOpen) {
  client_lis.connect();
}

export { client, client_lis };