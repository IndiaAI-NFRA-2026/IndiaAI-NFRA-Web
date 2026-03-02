'use client';

import { useState, useRef, useLayoutEffect, type ReactNode } from 'react';
import { formatFieldPath, formatFieldPathsInContent } from '@/lib/utils/helpers';

// Helper function to safely convert values to strings
const safeStringify = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

// Render value, process HTML when string contains tags (used for old_value, new_value, etc.)
function renderValueWithHTML(value: any, className?: string): ReactNode {
  if (value === null || value === undefined) {
    return <span className={className || 'text-gray-500 italic'}>null</span>;
  }
  if (typeof value === 'string' && /<[^>]+>/.test(value)) {
    return <span className={className || ''} dangerouslySetInnerHTML={{ __html: value }} />;
  }
  return <span className={className}>{safeStringify(value)}</span>;
}

// Parse description and determine render type
function parseDescription(description: string): {
  type: 'expected' | 'object' | 'text';
  data: any;
} {
  if (!description) {
    return { type: 'text', data: null };
  }

  try {
    const parsed = typeof description === 'string' ? JSON.parse(description) : description;

    // Check if parsed is an object (not null, not array, not primitive)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // Check for expected structure - check both root level and metadata
      const hasRootLevelFields = parsed.action || parsed.document_id || parsed.file_name;
      const hasMetadataFields = parsed.metadata && (parsed.metadata.action || parsed.metadata.document_id || parsed.metadata.file_name);
      const hasChanges = Array.isArray(parsed.changes) && parsed.changes.length > 0;
      const hasExpectedStructure = hasRootLevelFields || hasMetadataFields || hasChanges;

      if (hasExpectedStructure) {
        return { type: 'expected', data: parsed };
      } else {
        return { type: 'object', data: parsed };
      }
    }

    return { type: 'text', data: description };
  } catch {
    return { type: 'text', data: description };
  }
}

// Helper function to check if an object or its children contain "reason"
function hasReasonField(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  // Check if current object has "reason" field
  if ('reason' in obj && obj.reason !== null && obj.reason !== undefined) {
    return true;
  }

  // Recursively check nested objects
  return Object.values(obj).some((value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return hasReasonField(value);
    }
    return false;
  });
}

// Helper function to filter object, keeping only paths that lead to "reason"
function filterObjectWithReason(obj: any): any {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  // If current object has "reason" field, keep the entire object
  if ('reason' in obj && obj.reason !== null && obj.reason !== undefined) {
    return obj;
  }

  // Otherwise, check nested objects and keep only those with "reason"
  const filtered: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Check if this nested object contains "reason"
      if (hasReasonField(value)) {
        // Recursively filter and keep this path
        const filteredValue = filterObjectWithReason(value);
        if (filteredValue) {
          filtered[key] = filteredValue;
        }
      }
    }
  }

  return Object.keys(filtered).length > 0 ? filtered : null;
}

// Helper function to render only nodes with "reason" field using the original style
function renderPathsWithReason(obj: any) {
  const filtered = filterObjectWithReason(obj);

  if (!filtered || Object.keys(filtered).length === 0) {
    return null; // Return null, will be handled by renderGroupedChanges
  }

  return renderNestedObjectAsHTML(filtered);
}

// Helper function to render grouped changes as tree
function renderGroupedChanges(tree: any, depth: number = 0, t?: (key: string) => string): any {
  const entries = Object.entries(tree);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
      {entries.map(([key, value]: [string, any]) => {
        const keyFormatted = key.replaceAll('_', ' ').replaceAll(/\b\w/g, (l) => l.toUpperCase());
        const hasChanges = value._changes && value._changes.length > 0;
        const hasChildren = value._children && Object.keys(value._children).length > 0;

        return (
          <div key={key} className="space-y-2">
            <div className="font-medium text-gray-700">{keyFormatted}:</div>
            {hasChanges && (
              <div className="ml-2 space-y-2">
                {value._changes.map((change: any, idx: number) => {
                  const fieldFormatted = change.fieldName.replaceAll('_', ' ').replaceAll(/\b\w/g, (l: string) => l.toUpperCase());

                  return (
                    <div key={`field-${fieldFormatted}-${idx}`} className="space-y-1 rounded-md bg-gray-50 p-2">
                      <div className="text-[11px] font-medium text-gray-600">{fieldFormatted}:</div>
                      <div className="space-y-1">
                        {change.old_value !== null && change.old_value !== undefined && (
                          <div>
                            <span className="text-[10px] font-medium text-gray-500">
                              {t ? `${t('auditLogs.description.oldValue')}: ` : 'Old: '}
                            </span>
                            {renderValueWithHTML(change.old_value, 'text-[11px] text-red-600 line-through')}
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-medium text-gray-500">
                            {t ? `${t('auditLogs.description.newValue')}: ` : 'New: '}
                          </span>
                          {renderValueWithHTML(change.new_value, 'text-[11px] font-medium text-gray-600')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {hasChildren && <div className="ml-2">{renderGroupedChanges(value._children, depth + 1, t)}</div>}
          </div>
        );
      })}
    </div>
  );
}

// Helper function to render nested object as HTML
function renderNestedObjectAsHTML(obj: any, depth: number = 0) {
  if (obj === null || obj === undefined) {
    return <span className="text-gray-500 italic">null</span>;
  }

  if (typeof obj === 'string') {
    // Check if string contains HTML tags
    if (/<[^>]+>/.test(obj)) {
      return <div className="prose prose-sm max-w-none text-xs" dangerouslySetInnerHTML={{ __html: obj }} />;
    }
    return <span>{obj}</span>;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return <span className="text-(--color-sidebar-foreground)">{String(obj)}</span>;
  }

  if (Array.isArray(obj)) {
    const marginLeft = depth > 0 ? 'ml-4' : '';
    return (
      <ul className={`list-inside list-disc ${marginLeft}`}>
        {obj.map((item, index) => {
          let itemKey: string | number;
          if (typeof item === 'object' && item !== null && 'id' in item) {
            itemKey = item.id;
          } else if (typeof item === 'string') {
            itemKey = item;
          } else {
            itemKey = `item-${index}`;
          }
          return (
            <li key={`array-item-${itemKey}-${index}`} className="mb-1">
              {renderNestedObjectAsHTML(item, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return <span className="text-gray-400">{}</span>;
    }

    return (
      <div className={`space-y-2 ${depth > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4' : ''}`}>
        {entries.map(([key, value]) => {
          const keyFormatted = key.replaceAll('_', ' ').replaceAll(/\b\w/g, (l) => l.toUpperCase());
          const isNestedObject = value && typeof value === 'object' && !Array.isArray(value);
          const isComplexValue = isNestedObject || (Array.isArray(value) && value.length > 0);

          return (
            <div key={key} className="space-y-1">
              <div className="font-medium text-gray-700">{keyFormatted}:</div>
              <div className="ml-2">
                {isComplexValue ? (
                  renderNestedObjectAsHTML(value, depth + 1)
                ) : (
                  <div className="text-gray-600">{renderNestedObjectAsHTML(value, depth + 1)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <span>{String(obj)}</span>;
}

function renderChangeItem(change: any, isOverrideAction: boolean, t: (key: string) => string) {
  return (
    <>
      <div>
        <span className="font-medium">{t('auditLogs.description.field')}: </span>
        <span className="text-(--color-sidebar-foreground)">{formatFieldPath(safeStringify(change.field))}</span>
      </div>
      <div className="pl-2">
        {change.old_value !== null && change.old_value !== undefined ? (
          <>
            {renderValueWithHTML(change.old_value, 'text-[11px] text-red-600 line-through')}
            <span className="mx-2 text-(--color-sidebar-foreground)">→</span>
          </>
        ) : null}
        {renderValueWithHTML(change.new_value, 'text-[11px] text-green-600')}
      </div>
    </>
  );
}

// Helper function to render changes section
function renderChangesSection(changes: any[], isOverrideAction: boolean, t: (key: string) => string) {
  return changes.map((change: any, index: number) => {
    const changeKey = change.field || change.path || `change-${index}`;
    return (
      <div key={`change-${changeKey}-${index}`} className="space-y-2">
        {renderChangeItem(change, isOverrideAction, t)}
      </div>
    );
  });
}

// Helper function to render change types in a user-friendly format
function renderChangeTypes(changeTypes: any, t: (key: string) => string) {
  if (!changeTypes || typeof changeTypes !== 'object' || Object.keys(changeTypes).length === 0) {
    return null;
  }

  const typeLabels: Record<string, string> = {
    modified: t('auditLogs.description.modified'),
    added: t('auditLogs.description.added'),
    deleted: t('auditLogs.description.deleted'),
  };

  const items = Object.entries(changeTypes).map(([key, value]) => {
    const label = typeLabels[key] || key.replaceAll('_', ' ').replaceAll(/\b\w/g, (l) => l.toUpperCase());
    return (
      <div key={key} className="flex items-center gap-2">
        <span className="text-gray-600">{label}:</span>
        {renderValueWithHTML(value, 'font-medium text-(--color-sidebar-foreground)')}
      </div>
    );
  });

  return <div className="mt-1 space-y-1">{items}</div>;
}

// Helper function to check if metadata only contains fields already displayed
function shouldShowMetadata(metadata: any, action: any, documentId: any, fileName: any): boolean {
  if (!metadata || typeof metadata !== 'object' || Object.keys(metadata).length === 0) {
    return false;
  }

  // Get all keys from metadata
  const metadataKeys = Object.keys(metadata);

  // Check if metadata only contains action, document_id, and file_name
  const commonKeys = new Set(['action', 'document_id', 'documentId', 'file_name', 'fileName']);
  const hasOnlyCommonKeys = metadataKeys.every((key) => commonKeys.has(key.toLowerCase()));

  // If metadata only has common keys and we've already displayed them, don't show metadata
  if (hasOnlyCommonKeys && (action || documentId || fileName)) {
    return false;
  }

  return true;
}

// Helper function to render expected type content
function renderExpectedContent(data: any, actionType: string, t: (key: string) => string) {
  const isOverrideAction = actionType?.toLowerCase() === 'override' || data.action === 'overwrite_financial_analysis';

  // Get action, document_id, file_name from root or metadata
  const action = data.action || data.metadata?.action;
  const documentId = data.document_id || data.metadata?.document_id;
  const fileName = data.file_name || data.metadata?.file_name;

  // Check if we should show metadata (only if it has additional info beyond what's already shown)
  const shouldShowMetadataSection = shouldShowMetadata(data.metadata, action, documentId, fileName);

  return (
    <div className="space-y-3 text-xs">
      {/* Main Information Section */}
      {(action || documentId || fileName) && (
        <div className="space-y-2 border-b border-gray-200 pb-2">
          {action && (
            <div className="flex items-start gap-2">
              <span className="min-w-[100px] font-medium text-gray-700">{t('auditLogs.description.action')}:</span>
              <span className="text-(--color-sidebar-foreground)">{safeStringify(action)}</span>
            </div>
          )}
          {documentId && (
            <div className="flex items-start gap-2">
              <span className="min-w-[100px] font-medium text-gray-700">{t('auditLogs.description.documentId')}:</span>
              <span className="break-all text-(--color-sidebar-foreground)">{safeStringify(documentId)}</span>
            </div>
          )}
          {fileName && (
            <div className="flex items-start gap-2">
              <span className="min-w-[100px] font-medium text-gray-700">{t('auditLogs.description.fileName')}:</span>
              <span className="text-(--color-sidebar-foreground)">{safeStringify(fileName)}</span>
            </div>
          )}
        </div>
      )}

      {/* Summary Section */}
      {(data.total_changes !== null && data.total_changes !== undefined) ||
      (data.change_types && typeof data.change_types === 'object' && Object.keys(data.change_types).length > 0) ? (
        <div className="space-y-2 border-b border-gray-200 pb-2">
          {data.total_changes !== null && data.total_changes !== undefined && (
            <div className="flex items-center gap-2">
              <span className="min-w-[100px] font-medium text-gray-700">{t('auditLogs.description.totalChanges')}:</span>
              <span className="text-(--color-sidebar-foreground)">{safeStringify(data.total_changes)}</span>
            </div>
          )}
          {data.change_types && typeof data.change_types === 'object' && Object.keys(data.change_types).length > 0 && (
            <div>
              <span className="min-w-[100px] font-medium text-gray-700">{t('auditLogs.description.changeTypes')}:</span>
              {renderChangeTypes(data.change_types, t)}
            </div>
          )}
        </div>
      ) : null}

      {/* Changes Section */}
      {data.changes && Array.isArray(data.changes) && data.changes.length > 0 && (
        <div>
          <span className="font-medium text-gray-700">{t('auditLogs.description.changes')}:</span>
          <div className="mt-2 space-y-2 border-l-2 border-(--color-table-action-type-border) pl-4">
            {renderChangesSection(data.changes, isOverrideAction, t)}
          </div>
        </div>
      )}

      {/* Metadata Section - only show if it has additional information */}
      {shouldShowMetadataSection && (
        <div className="mt-2 rounded-md bg-gray-50 p-2">
          <span className="text-[11px] font-medium text-gray-600">{t('auditLogs.description.metadata')}:</span>
          <div className="mt-1">{renderNestedObjectAsHTML(data.metadata, 0)}</div>
        </div>
      )}
    </div>
  );
}

// Helper component for expand/collapse button
function ExpandCollapseButton({
  isExpanded,
  isTruncated,
  onToggle,
  t,
}: Readonly<{ isExpanded: boolean; isTruncated: boolean; onToggle: () => void; t: (key: string) => string }>) {
  if (!isTruncated && !isExpanded) return null;
  return (
    <button onClick={onToggle} className="mt-1 cursor-pointer text-[11px] text-blue-600 underline hover:text-blue-800">
      {isExpanded ? t('auditLogs.description.showLess') : t('auditLogs.description.showMore')}
    </button>
  );
}

// Component for rendering description with expand/collapse
export const DescriptionCell = ({
  description,
  actionType,
  t,
}: Readonly<{ description: string; actionType: string; t: (key: string) => string }>) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasTruncatedRef = useRef(false);
  const prevDescriptionRef = useRef(description);

  useLayoutEffect(() => {
    if (prevDescriptionRef.current !== description) {
      prevDescriptionRef.current = description;
      wasTruncatedRef.current = false;
      setTimeout(() => {
        setIsExpanded(false);
        setIsTruncated(false);
      }, 0);
    }
  }, [description]);

  useLayoutEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const isContentTruncated = element.scrollHeight > element.clientHeight;

        // When collapsed, check if content needs truncation
        if (isExpanded === false) {
          setIsTruncated(isContentTruncated);
          if (isContentTruncated) {
            wasTruncatedRef.current = true;
          }
        } else {
          // When expanded, show button if content was ever truncated
          setIsTruncated(wasTruncatedRef.current);
        }
      }
    };

    // Small delay to ensure DOM has rendered with max-height applied
    const timeoutId = setTimeout(checkTruncation, 100);

    // Also check on window resize in case content width changes
    globalThis.window.addEventListener('resize', checkTruncation);

    return () => {
      clearTimeout(timeoutId);
      globalThis.window.removeEventListener('resize', checkTruncation);
    };
  }, [isExpanded, description]);

  if (!description) {
    return <span>-</span>;
  }

  const { type, data } = parseDescription(description);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  if (type === 'expected') {
    const content = renderExpectedContent(data, actionType, t);
    return (
      <div>
        <div
          ref={contentRef}
          className={`text-xs text-(--color-sidebar-foreground) transition-all duration-200 ${isExpanded ? '' : 'max-h-20 overflow-hidden'}`}
        >
          {content}
        </div>
        <ExpandCollapseButton isExpanded={isExpanded} isTruncated={isTruncated} onToggle={toggleExpanded} t={t} />
      </div>
    );
  }

  if (type === 'object') {
    return (
      <div>
        <div ref={contentRef} className={`text-xs text-(--color-sidebar-foreground) ${isExpanded ? '' : 'line-clamp-2'}`}>
          {renderNestedObjectAsHTML(data)}
        </div>
        <ExpandCollapseButton isExpanded={isExpanded} isTruncated={isTruncated} onToggle={toggleExpanded} t={t} />
      </div>
    );
  }

  // type === 'text'
  const textContent = typeof data === 'string' ? data : safeStringify(data);
  const containsHTML = typeof textContent === 'string' && /<[^>]+>/.test(textContent);
  const formattedContent = typeof textContent === 'string' ? formatFieldPathsInContent(textContent) : textContent;

  return (
    <div>
      {containsHTML ? (
        <div
          ref={contentRef}
          className={`prose prose-sm max-w-none text-xs text-(--color-sidebar-foreground) ${isExpanded ? '' : 'line-clamp-3'}`}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      ) : (
        <div ref={contentRef} className={`text-xs text-(--color-sidebar-foreground) ${isExpanded ? '' : 'line-clamp-3'}`}>
          {formattedContent}
        </div>
      )}
      <ExpandCollapseButton isExpanded={isExpanded} isTruncated={isTruncated} onToggle={toggleExpanded} t={t} />
    </div>
  );
};
