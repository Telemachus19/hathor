import React, { useState } from 'react';

/**
 * Pure JSON-to-React Node Renderer with ZERO assumptions.
 *
 * Rules:
 * 1. Zero hardcoded component names, tag conditionals, or layout section assumptions.
 * 2. Evaluates node.tag directly (div, button, img, h1, p, span, etc.) via React.createElement.
 * 3. Dynamically merges base styles and hoverStyles on mouse enter/leave.
 * 4. Recursively converts nested JSON children into React DOM nodes.
 */
export const PureJsonNode: React.FC<{ node: any; nodeKey: string | number }> = ({
  node,
  nodeKey,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (node === null || node === undefined) return null;

  // Render text / numbers directly
  if (typeof node === 'string' || typeof node === 'number') {
    return <>{node}</>;
  }

  // Render arrays of nodes
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((child, idx) => (
          <PureJsonNode key={`${nodeKey}-${idx}`} node={child} nodeKey={`${nodeKey}-${idx}`} />
        ))}
      </>
    );
  }

  // Render JSON object node
  if (typeof node === 'object') {
    const Tag = node.tag || 'div';

    const mergedStyle = {
      ...node.style,
      ...(isHovered ? node.hoverStyle : {}),
      transition: node.style?.transition || 'all 0.2s ease-in-out',
    };

    const props: any = {
      key: nodeKey,
      style: mergedStyle,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    };

    // Forward standard HTML DOM properties directly from JSON
    if (node.src) props.src = node.src;
    if (node.alt) props.alt = node.alt;
    if (node.href) props.href = node.href;
    if (node.className) props.className = node.className;
    if (node.id) props.id = node.id;

    const children =
      node.children !== undefined ? (
        <PureJsonNode node={node.children} nodeKey={`${nodeKey}-c`} />
      ) : null;

    return React.createElement(Tag, props, children);
  }

  return null;
};

/**
 * Parses raw string JSON and converts it directly to React elements with ZERO assumptions.
 */
export function parseAndRenderPureJson(jsonInput: string | Record<string, any>): React.ReactNode[] {
  let parsed: Record<string, any>;

  if (typeof jsonInput === 'string') {
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e) {
      console.error('Failed to parse layout JSON:', e);
      return [
        <div key="err" style={{ color: '#ff4d4d', padding: '1rem', background: 'rgba(255,0,0,0.1)' }}>
          Invalid Layout JSON Payload
        </div>,
      ];
    }
  } else {
    parsed = jsonInput;
  }

  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, idx) => (
      <PureJsonNode key={`node-${idx}`} node={item} nodeKey={`node-${idx}`} />
    ));
  }

  return Object.entries(parsed).map(([key, val]) => (
    <PureJsonNode key={key} node={val} nodeKey={key} />
  ));
}
