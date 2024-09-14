import WsNative from './WsNative';

import _PseudoTranslationPolicy from './policies/PseudoTranslationPolicy';
import _SourceStringPolicy from './policies/SourceStringPolicy';

import _SourceErrorPolicy from './policies/SourceErrorPolicy';
import _ThrowErrorPolicy from './policies/ThrowErrorPolicy';
import _MessageFormatRenderer from './renderers/MessageFormatRenderer';

function _createNativeInstance(initOptions) {
  const instance = new WsNative();
  instance.t = instance.translate.bind(instance);
  if (initOptions) {
    instance.init(initOptions);
  }
  return instance;
}

export * from './utils';
export * from './plurals';
export * from './events';

export const PseudoTranslationPolicy = _PseudoTranslationPolicy;
export const SourceStringPolicy = _SourceStringPolicy;
export const SourceErrorPolicy = _SourceErrorPolicy;
export const ThrowErrorPolicy = _ThrowErrorPolicy;
export const MessageFormatRenderer = _MessageFormatRenderer;
export const createNativeInstance = _createNativeInstance;

export const ws = new WsNative();
export const t = ws.translate.bind(ws);
