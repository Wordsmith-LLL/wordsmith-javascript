import WsNative from './WsNative';

export default function createTranslator(apiKey, apiHost) {
  const ws = new WsNative(apiKey, apiHost);
  const t = ws.t.bind(ws);
  return { ws, t };
}

export { WsNative };
