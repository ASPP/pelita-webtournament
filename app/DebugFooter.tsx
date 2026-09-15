import { useDebugMessages } from "./DebugMessages";
import MessageFooter from "./MessageFooter";

export default function DebugFooter() {
  const { debugMessages: messages } = useDebugMessages();

  return <MessageFooter messages={messages} autoOpenOnMessage={true} />;
}
