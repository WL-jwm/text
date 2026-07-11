import React from 'react';

export function TagFilter({ tags, activeTag, onTagChange }: { tags: string[]; activeTag: string; onTagChange: (tag: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.map(tag => (
        <button key={tag} onClick={() => onTagChange(tag)}
          className={`px-2.5 py-1 rounded-md text-xs transition-all border ${
            activeTag === tag
              ? 'bg-gw-blue/15 text-gw-highlight border-gw-blue/30'
              : 'text-gw-muted border-transparent hover:text-gw-text hover:bg-gw-surface/50'
          }`}>
          {tag}
        </button>
      ))}
    </div>
  );
}
