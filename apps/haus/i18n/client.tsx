import * as React from "react";

import messages from "../messages/en.json";

type MessageValue = string | number | boolean | null | MessageValue[] | { [key: string]: MessageValue };
type MessageRecord = Record<string, MessageValue>;
type TranslationValues = Record<string, string | number>;

const I18nContext = React.createContext<MessageRecord>(messages as MessageRecord);

function getNestedValue(source: MessageValue, path: string): MessageValue {
  return path.split(".").reduce<MessageValue>((current, segment) => {
    if (current && typeof current === "object" && !Array.isArray(current) && segment in current) {
      return (current as MessageRecord)[segment];
    }

    throw new Error(`Missing translation key: ${path}`);
  }, source);
}

function formatMessage(template: string, values?: TranslationValues) {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

export function I18nProvider({
  children,
  value = messages as MessageRecord,
}: React.PropsWithChildren<{ value?: MessageRecord }>) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslations(namespace?: string) {
  const dictionary = React.useContext(I18nContext);
  const scoped = React.useMemo(() => {
    if (!namespace) return dictionary;
    return getNestedValue(dictionary, namespace);
  }, [dictionary, namespace]);

  const translate = React.useCallback(
    (key: string, values?: TranslationValues) => {
      const value = getNestedValue(scoped, key);

      if (typeof value !== "string") {
        throw new Error(`Translation key "${namespace ? `${namespace}.${key}` : key}" is not a string`);
      }

      return formatMessage(value, values);
    },
    [namespace, scoped],
  ) as ((key: string, values?: TranslationValues) => string) & {
    raw: <T = MessageValue>(key: string) => T;
  };

  translate.raw = <T = MessageValue,>(key: string) => getNestedValue(scoped, key) as T;

  return translate;
}
