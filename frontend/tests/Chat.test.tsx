import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";

describe("ChatMessage", () => {
  it("renders message with timestamp", () => {
    const message = {
      text: "Hello!",
      timestamp: Date.now(),
      sender: "me" as const,
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText("Hello!")).toBeInTheDocument();
    expect(screen.getByText(/\[\d{2}:\d{2}\]/)).toBeInTheDocument();
  });

  it("shows divider when showDivider is true", () => {
    const message = {
      text: "Hello!",
      timestamp: Date.now(),
      sender: "them" as const,
    };

    render(<ChatMessage message={message} showDivider={true} />);

    expect(screen.getByText(/──────────────────────────────────────/)).toBeInTheDocument();
  });

  it("aligns message right for 'me' sender", () => {
    const message = {
      text: "My message",
      timestamp: Date.now(),
      sender: "me" as const,
    };

    const { container } = render(<ChatMessage message={message} />);
    const messageDiv = container.querySelector(".justify-end");
    expect(messageDiv).toBeInTheDocument();
  });

  it("aligns message left for 'them' sender", () => {
    const message = {
      text: "Their message",
      timestamp: Date.now(),
      sender: "them" as const,
    };

    const { container } = render(<ChatMessage message={message} />);
    const messageDiv = container.querySelector(".justify-start");
    expect(messageDiv).toBeInTheDocument();
  });
});

describe("ChatInput", () => {
  it("renders input field", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });

  it("sends message on button click", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText("Type a message...");
    const button = screen.getByLabelText("Send message");

    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.click(button);

    expect(onSend).toHaveBeenCalledWith("Hello!");
    expect(input).toHaveValue("");
  });

  it("sends message on Enter key", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText("Type a message...");

    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onSend).toHaveBeenCalledWith("Hello!");
  });

  it("does not send empty message", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const button = screen.getByLabelText("Send message");
    expect(button).toBeDisabled();
  });

  it("disables input when disabled prop is true", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled={true} />);

    const input = screen.getByPlaceholderText("Type a message...");
    expect(input).toBeDisabled();
  });

  it("respects max length", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText("Type a message...");
    expect(input).toHaveAttribute("maxLength", "1000");
  });
});

describe("ChatHeader", () => {
  it("renders partner handle", () => {
    const onEndChat = vi.fn();
    render(<ChatHeader partnerHandle="TestUser" onEndChat={onEndChat} />);

    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByLabelText("End chat")).toBeInTheDocument();
  });

  it("calls onEndChat when button clicked", () => {
    const onEndChat = vi.fn();
    render(<ChatHeader partnerHandle="TestUser" onEndChat={onEndChat} />);

    const button = screen.getByLabelText("End chat");
    fireEvent.click(button);

    expect(onEndChat).toHaveBeenCalled();
  });

  it("shows proximity warning when proximityWarning is true", () => {
    const onEndChat = vi.fn();
    render(
      <ChatHeader
        partnerHandle="TestUser"
        onEndChat={onEndChat}
        proximityWarning={true}
      />
    );

    expect(screen.getByText("Signal weak — chat may end.")).toBeInTheDocument();
  });

  it("does not show proximity warning when proximityWarning is false", () => {
    const onEndChat = vi.fn();
    render(
      <ChatHeader
        partnerHandle="TestUser"
        onEndChat={onEndChat}
        proximityWarning={false}
      />
    );

    expect(screen.queryByText("Signal weak — chat may end.")).not.toBeInTheDocument();
  });
});

