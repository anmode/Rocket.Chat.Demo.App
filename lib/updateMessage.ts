import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function updateMessage(
  modify: IModify,
  message: IMessage,
  updater: IUser,
  text: string
): Promise<void> {
  const msg = modify.getUpdater().message(message.id, updater);

  msg.setText(text);

  await modify.getUpdater().finish(msg);
}
