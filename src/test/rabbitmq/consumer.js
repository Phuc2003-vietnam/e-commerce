const amqp = require("amqplib");

const runConsumer = async () => {
  try {
    const conn = await amqp.connect("amqp://guest:guest@localhost");
    const channel = await conn.createChannel();
    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      duarable: true,
    });
    channel.consume(queueName, (message) => {
      console.log(`Received: ${message.content.toString()}`);
    },{
        noAck:true        //noAck:true to tell producer that consumer receive message A , iff producer send msg B then consumer only receive B , if ack:true , consumer receives A and B everytime restart
    });
  } catch (error) {
    console.log(error);
  }
};

runConsumer().catch(console.error);
