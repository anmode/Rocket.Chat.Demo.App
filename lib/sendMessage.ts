import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IMessageAttachment } from '@rocket.chat/apps-engine/definition/messages';

export async function sendMessage(
    modify: IModify,
    room: IRoom,
    sender: IUser,
    message: string,
    alias?: string,
    attachments?: Array<IMessageAttachment>,
): Promise<string> {

    const msg = modify.getCreator().startMessage()
        .setSender(sender)
        .setRoom(room)
        .setText(message);

    if (alias) {
        msg.setUsernameAlias(alias);
    }

    if (attachments) {
        for (const attachment of attachments) {
            msg.addAttachment(attachment);
        }
    }

    return await modify.getCreator().finish(msg);
}
