import startZMQSubscriber from "@/lib/zmq"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await startZMQSubscriber()
  }
}