import {
    HttpStatusCode,
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";
import { RocketChatAssociationModel, RocketChatAssociationRecord } from "@rocket.chat/apps-engine/definition/metadata";

export class ApiWithPersistence extends ApiEndpoint {
    public path = "persistence_with_api";

    // Let's declare how the data will be associated.
    // Here we do not have any room or user,
    // so we'll associate it with a MISC value of 'persistence_with_api'.
    public associations: Array<RocketChatAssociationRecord> = [
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'persistence_with_api'), 
    ];

    // Let's handle POST.
    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        // Let's define the body of the message.
        let body: any;

        // If there is a payload, let's format it to a string/message.
        if (Object.entries(request.content).length) {
            body = request.content
        } else {
            body = { "default_text": "No Payload sent :(" }
        }

        // Log it, if you want.
        this.app.getLogger().info(["ENDPOINT WITH PERSISTENCE POST CALLED: ", body]);
        console.log("ENDPOINT WITH PERSISTENCE POST CALLED: ", body);

        // Now we get the GENERAL ROOM by ID.
        // All Rocket.Chat workspaces will have by default a channel
        // with id GENERAL.
        const room = await read.getRoomReader().getById("GENERAL");

        // Oh, no! No GENERAL room. Return a not found error.
        if (!room) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Room "#general" could not be found`,
            };
        }

        await persis.updateByAssociations(this.associations, body, true);

        // Let's construct the message.
        const messageBuilder = modify
            .getCreator()
            .startMessage()
            .setText(JSON.stringify(body))
            .setRoom(room);

        // Send the message.
        const messageId = await modify.getCreator().finish(messageBuilder);

        // Return with success.
        const persistenceRead = this.app.getAccessors().reader.getPersistenceReader();
        return this.success({
            success: true,
            messageId: messageId,
            result: request.content
        });
    }

    // Let's handle GET.
    public async get(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        // Log it, if you want.
        this.app.getLogger().info(["ENDPOINT WITH PERSISTENCE GET CALLED: ", request.content]);
        console.log("ENDPOINT WITH PERSISTENCE GET CALLED: ", request.content);

        // Now we get the data.
        let result: any = {};
        const persistenceRead = this.app.getAccessors().reader.getPersistenceReader();
        try {
            const records: any = (await persistenceRead.readByAssociations(this.associations));

            if (records.length) {
                result = records;
            }else{
                result = {}
            }
        } catch (err) {
            console.warn(err);
        }
        
        return this.success({
            success: true,
            "result": result
        });

    }
    // lets handle DELETE
    // example call 
    // curl --request DELETE --url http://localhost:3000/api/apps/public/67a4e34b-5c04-4c9c-9358-3d0fd217cefd/persistence_with_api
    public async delete(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse>{
        this.app.getLogger().info(["ENDPOINT WITH PERSITENCE DELETE CALLED: ", request.content]);
        console.log("ENDPOINT WITH PERSITENCE POST CALLED: ", request.content);
        await persis.removeByAssociations(this.associations);
        return this.success({
            success: true,
        });
    }
}