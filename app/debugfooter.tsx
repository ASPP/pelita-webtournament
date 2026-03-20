import { useDebugMessages } from "./debugmessages";
import MessageFooter from "./footer";

export default function DebugFooter() {
  const { debugMessages: messages } = useDebugMessages();

  return <MessageFooter messages={messages} autoOpenOnMessage={true} />;
}
