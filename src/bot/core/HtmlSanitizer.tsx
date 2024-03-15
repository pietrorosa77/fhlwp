// @ts-ignore
import sanitizer from 'dompurify';
import parse from 'html-react-parser';
import * as React from 'react';

export const sanitizeHtml = (dirty: string) => {
  return sanitizer.sanitize(dirty);
};

export const htmlToReact = (html: string) => {
  return parse(html);
};

export const HtmlRenderer = (html: string) => {
  return (
    <div
      className="sanitized-content"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};
