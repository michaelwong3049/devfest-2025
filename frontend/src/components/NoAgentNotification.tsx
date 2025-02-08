import type { AgentState } from "@livekit/components-react";
import { useEffect, useRef, useState } from "react";
import { X, TriangleAlert } from "lucide-react";

interface NoAgentNotificationProps extends React.PropsWithChildren<object> {
  state: AgentState;
}

/**
 * Renders some user info when no agent connects to the room after a certain time.
 */
export function NoAgentNotification(props: NoAgentNotificationProps) {
  const timeToWaitMs = 10_000;
  const timeoutRef = useRef<number | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const agentHasConnected = useRef(false);

  // If the agent has connected, we don't need to show the notification.
  if (
    ["listening", "thinking", "speaking"].includes(props.state) &&
    agentHasConnected.current == false
  ) {
    agentHasConnected.current = true;
  }

  useEffect(() => {
    if (props.state === "connecting") {
      timeoutRef.current = window.setTimeout(() => {
        if (
          props.state === "connecting" &&
          agentHasConnected.current === false
        ) {
          setShowNotification(true);
        }
      }, timeToWaitMs);
    } else {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      setShowNotification(false);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [props.state]);

  return (
    <>
      {showNotification ? (
        <div className="fixed text-sm left-1/2 max-w-[90vw] -translate-x-1/2 flex top-6 items-center gap-4 bg-[#1F1F1F] px-4 py-3 rounded-lg">
          <div>
            {/* Warning Icon */}
            <TriangleAlert size={24} />
          </div>
          <p className="text-pretty w-max">
            It&apos;s quiet... too quiet. Is your agent lost? Ensure your agent
            is properly configured and running on your machine.
          </p>
          <a
            href="https://docs.livekit.io/agents/quickstarts/s2s/"
            target="_blank"
            className="underline whitespace-nowrap"
          >
            View guide
          </a>
          <button onClick={() => setShowNotification(false)}>
            {/* Close Icon */}
            <X size={24} />
          </button>
        </div>
      ) : null}
    </>
  );
}
