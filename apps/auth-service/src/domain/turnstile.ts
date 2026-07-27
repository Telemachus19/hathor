export interface TurnstileVerifier {
  verify(token: string, remoteIp?: string): Promise<boolean>;
}
