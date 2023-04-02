import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { IUser } from "@rocket.chat/apps-engine/definition/users";

export async function sendDM(
  modify: IModify,
  user: IUser,
  text: string
): Promise<void> {
  const dm = modify.getCreator(). startMessage()
    .setSender(user)
    .setText(text);

  await modify.getCreator().finish(dm);
}
