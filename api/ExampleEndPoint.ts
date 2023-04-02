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

export class ExampleEndpoint extends ApiEndpoint {
    public path = "example_api";

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        // Check if the user is authenticated
        if (!request.user) {
            return {
                status: HttpStatusCode.UNAUTHORIZED,
                content: "You must be authenticated to access this endpoint.",
            };
        }

        // Get user information from the request
        const { username, emails } = request.user;

        // Let's define the body of the response message
        let responseBody: string;

        // If there is a payload, let's format it to a string/message
        if (Object.entries(request.content).length) {
            responseBody = Object.entries(request.content)
                .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
                .join("\n");
        } else {
            responseBody = "No payload sent :cry:";
        }

        // Log the request body
        this.app.getLogger().info(`Endpoint called by ${username}: ${responseBody}`);
        console.log(`Endpoint called by ${username}: ${responseBody}`);

        // Get the general room by ID
        // All Rocket.Chat workspaces will have by default a channel
        // with id "GENERAL"
        const generalRoom = await read.getRoomReader().getById("GENERAL");

        // If the general room is not found, return a not found error
        if (!generalRoom) {
            return {
                status: HttpStatusCode.NOT_FOUND,
                content: `Room "#general" could not be found`,
            };
        }

        // Let's construct the response message with some user information
        const responseMessage = modify
            .getCreator()
            .startMessage()
            .setText(`Hello ${username}! This is your payload:\n\n${responseBody}\n`)
            .setRoom(generalRoom)
            .setUsernameAlias("Bot")
            .setAvatarUrl("https://cdn.iconscout.com/icon/free/png-256/robot-robots-future-futuristic-ai-artificial-intelligence-34463.png");

        // Send the response message
        const responseMessageId = await modify.getCreator().finish(responseMessage);

        // Return with success
        return this.success({
            success: true,
            messageId: responseMessageId,
        });
    }
}
