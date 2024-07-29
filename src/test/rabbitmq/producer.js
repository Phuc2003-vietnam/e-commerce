const amqp = require("amqplib");
const messages = "hello, its tipjs";

const runProducer = async () => {
  try {
    const conn = await amqp.connect("amqp://guest:guest@localhost");
    const channel = await conn.createChannel();
    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      duarable: true,
    });
    channel.sendToQueue(queueName, Buffer.from(messages));
  } catch (error) {
    console.log(error);
  }
};

runProducer().catch(console.error)