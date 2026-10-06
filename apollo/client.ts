import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { onError } from '@apollo/client/link/error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { getJwtToken } from '../libs/auth';
import { sweetErrorAlert } from '../libs/sweetAlert';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const token = getJwtToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => true,
	// @ts-ignore The backend does not expose refresh tokens yet.
	fetchAccessToken: () => null,
});

interface MessagePayload { event: string; text: string; memberData: any; }
interface InfoPayload {
	event: string;
	totalClient?: number;
	totalClients?: number;
	memberData: any;
	action: 'joined' | 'left';
}
type WebSocketMessage = MessagePayload | InfoPayload;

class CustomChatWebSocket {
	private socket: WebSocket | null = null;
	private messageHandlers: Array<(data: MessagePayload) => void> = [];
	private infoHandlers: Array<(data: InfoPayload) => void> = [];
	private connectionHandlers: Array<() => void> = [];
	private errorHandlers: Array<(error: unknown) => void> = [];
	private reconnectAttempts = 0;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(private readonly url: string) {
		if (typeof window !== 'undefined') this.connect();
	}

	private connect() {
		try {
			this.socket = new WebSocket(this.url);
			this.socket.onopen = () => {
				this.reconnectAttempts = 0;
				this.connectionHandlers.forEach((handler) => handler());
			};
			this.socket.onmessage = (event) => {
				try {
					const data: WebSocketMessage = JSON.parse(event.data);
					if (data.event === 'message') this.messageHandlers.forEach((handler) => handler(data as MessagePayload));
					if (data.event === 'info') {
						const info = data as InfoPayload;
						info.totalClients = info.totalClients ?? info.totalClient;
						this.infoHandlers.forEach((handler) => handler(info));
					}
				} catch (error) {
					this.errorHandlers.forEach((handler) => handler(error));
				}
			};
			this.socket.onerror = (error) => this.errorHandlers.forEach((handler) => handler(error));
			this.socket.onclose = () => this.reconnect();
		} catch (error) {
			this.errorHandlers.forEach((handler) => handler(error));
		}
	}

	private reconnect() {
		if (this.reconnectAttempts >= 5) return;
		this.reconnectAttempts += 1;
		this.reconnectTimer = setTimeout(() => this.connect(), 3000);
	}

	send(text: string) {
		if (this.isConnected()) this.socket?.send(JSON.stringify({ event: 'message', data: text }));
	}
	onMessage(handler: (data: MessagePayload) => void) { this.messageHandlers.push(handler); }
	onInfo(handler: (data: InfoPayload) => void) { this.infoHandlers.push(handler); }
	onConnect(handler: () => void) { this.connectionHandlers.push(handler); }
	onError(handler: (error: unknown) => void) { this.errorHandlers.push(handler); }
	isConnected() { return this.socket?.readyState === WebSocket.OPEN; }
	close() {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.socket?.close();
		this.messageHandlers = [];
		this.infoHandlers = [];
		this.connectionHandlers = [];
		this.errorHandlers = [];
	}
}

let chatWebSocket: CustomChatWebSocket | null = null;

export function initializeChatWebSocket(token?: string) {
	if (!chatWebSocket && typeof window !== 'undefined') {
		const baseUrl = process.env.REACT_APP_CHAT_WS_URL || 'ws://localhost:3007';
		const authToken = token || getJwtToken();
		chatWebSocket = new CustomChatWebSocket(`${baseUrl}${authToken ? `?token=${authToken}` : ''}`);
	}
	return chatWebSocket!;
}
export const getChatWebSocket = () => chatWebSocket;
export function closeChatWebSocket() {
	chatWebSocket?.close();
	chatWebSocket = null;
}

function createApolloClient() {
	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({ headers: { ...headers, ...getHeaders() } }));
		return forward(operation);
	});
	// @ts-ignore
	const uploadLink = new createUploadLink({ uri: process.env.REACT_APP_API_GRAPHQL_URL });
	const errorLink = onError(({ graphQLErrors, networkError }) => {
		graphQLErrors?.forEach(({ message, locations, path }) => {
			console.error('[GraphQL error]', { message, locations, path });
			if (!message.includes('input')) sweetErrorAlert(message);
		});
		if (networkError) console.error('[Network error]', networkError);
	});

	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: from([errorLink, tokenRefreshLink, authLink.concat(uploadLink)]),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState: NormalizedCacheObject | null = null) {
	const client = apolloClient ?? createApolloClient();
	if (initialState) client.cache.restore(initialState);
	if (typeof window === 'undefined') return client;
	if (!apolloClient) apolloClient = client;
	return client;
}

export function useApollo(initialState: NormalizedCacheObject | null) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}