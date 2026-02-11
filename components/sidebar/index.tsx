'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { AlarmClockIcon, Building, ChevronDown, ChevronRight, FileTextIcon, Globe, HistoryIcon, Settings, User2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { BarChartSvg, CheckSquareSvg, SvgProps } from '../svg';
import { ROUTERS } from '@/constants/routers';
import { USER_ROLE } from '@/enums/auth';
import { useMe } from '@/lib/query/use-auth';
import { hasAccessToPage } from '@/lib/auth/rbac';
import { Button } from '../button';

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  key: string;
  label: string;
  icon?: (props: SvgProps) => React.ReactNode;
  path: string;
  children?: NavItem[];
  roles?: USER_ROLE[];
}

interface NavItemProps {
  item: NavItem;
  isDesktop: boolean;
  collapsed: boolean;
}

interface NavItemWithChildrenProps extends NavItemProps {
  isExpanded: boolean;
  onToggle: () => void;
}

// ============================================================================
// Constants & Helpers
// ============================================================================

const getMenuItems = (t: (key: string) => string): NavItem[] => [
  {
    key: 'review-extraction',
    label: t('sidebar.reviewExtraction'),
    icon: (props: SvgProps) => <CheckSquareSvg {...props} />,
    path: ROUTERS.REVIEW_EXTRACTION,
    roles: [USER_ROLE.CREDIT_OFFICER_ANALYST],
  },
  {
    key: 'analysis',
    label: t('sidebar.analysis'),
    icon: (props: SvgProps) => <BarChartSvg {...props} />,
    path: ROUTERS.ANALYSIS,
    roles: [USER_ROLE.CREDIT_OFFICER_ANALYST],
  },
  {
    key: 'user-management',
    label: t('sidebar.userManagement'),
    icon: (props: SvgProps) => <User2 {...props} className="size-4" />,
    path: ROUTERS.USER_MANAGEMENT,
    roles: [USER_ROLE.ADMIN],
  },
  {
    key: 'audit-logs',
    label: t('sidebar.auditLogs'),
    icon: (props: SvgProps) => <HistoryIcon {...props} className="size-4" />,
    path: ROUTERS.AUDIT_LOG,
    roles: [USER_ROLE.ADMIN, USER_ROLE.COMPLIANCE_OFFICER],
  },
  {
    key: 'settings',
    label: t('sidebar.settings'),
    icon: (props: SvgProps) => <Settings {...props} className="size-4" />,
    path: ROUTERS.SETTINGS,
    roles: [USER_ROLE.ADMIN],
    children: [
      {
        key: 'institution',
        label: t('sidebar.institution'),
        icon: (props: SvgProps) => <Building {...props} className="size-4" />,
        path: ROUTERS.INSTITUTION,
        roles: [USER_ROLE.ADMIN],
      },
      {
        key: 'SSOConfiguration',
        label: t('sidebar.SSOConfiguration'),
        icon: (props: SvgProps) => <Globe {...props} className="size-4" />,
        path: ROUTERS.SSO_CONFIGURATION,
        roles: [USER_ROLE.ADMIN],
      },
    ],
  },
  {
    key: 'document-retention',
    label: t('sidebar.documentRetention'),
    icon: (props: SvgProps) => <AlarmClockIcon {...props} className="size-4" />,
    path: ROUTERS.DOCUMENT_RETENTION,
    roles: [USER_ROLE.COMPLIANCE_OFFICER],
  },
  {
    key: 'retention-policy',
    label: t('sidebar.retentionPolicy'),
    icon: (props: SvgProps) => <Settings {...props} className="size-4" />,
    path: ROUTERS.RETENTION_POLICY,
    roles: [USER_ROLE.COMPLIANCE_OFFICER],
  },
];

const getActiveStyle = (isActive: boolean, isDesktop: boolean): React.CSSProperties => {
  if (isActive) {
    return {
      background: 'var(--sidebar-primary)',
      borderRadius: '4px',
    };
  }
  return {
    color: 'var(--sidebar-foreground)',
    ...(isDesktop ? { borderRight: '3px solid transparent' } : {}),
  };
};

const isPathActive = (pathname: string, itemPath: string): boolean => {
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
};

// ============================================================================
// Sub-components
// ============================================================================

export const Logo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="cursor-pointer">
    <img src="/assets/images/logo.png" alt="ClearSight" className="h-auto w-[121px]" />
  </button>
);

const NavItemComponent: React.FC<NavItemProps & { isChild?: boolean }> = ({ item, isDesktop, collapsed, isChild = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = isPathActive(pathname, item.path);
  const activeStyle = isChild ? {} : getActiveStyle(isActive, isDesktop);

  // Determine icon and text colors based on active state and isChild
  let iconColor: string | undefined;
  let textColor: string;

  if (isActive) {
    iconColor = isChild ? '#2A9D8F' : 'white';
    textColor = isChild ? 'text-(--color-text-link)' : 'text-white';
  } else {
    iconColor = undefined;
    textColor = isChild ? 'text-[#9CA3AF]' : 'text-sidebar-foreground';
  }

  return (
    <button
      onClick={() => router.push(item.path)}
      className={cn(
        'flex w-full cursor-pointer flex-nowrap items-center',
        isDesktop ? 'gap-2.5 px-4 py-2.5 pr-0' : 'gap-3 rounded-r-md px-3 py-3 text-left',
        collapsed ? 'justify-center px-0' : 'text-left',
        !isActive && 'hover:opacity-80'
      )}
      style={activeStyle}
    >
      {item.icon && <div className="flex h-4 w-4 items-center justify-center">{item.icon(iconColor ? { color: iconColor } : {})}</div>}
      {!collapsed && <span className={cn('text-sm whitespace-nowrap', textColor)}>{item.label}</span>}
    </button>
  );
};

const NavItemWithChildren: React.FC<NavItemWithChildrenProps> = ({ item, isDesktop, collapsed, isExpanded, onToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = item.children?.some((child) => isPathActive(pathname, child.path)) ?? false;
  const activeStyle = getActiveStyle(isActive, isDesktop);

  const triggerButton = (
    <button
      type="button"
      onClick={collapsed ? undefined : onToggle}
      className={cn(
        'flex w-full cursor-pointer items-center',
        isDesktop ? 'gap-2.5 px-4 py-2.5' : 'gap-3 rounded-r-md px-3 py-3 text-left',
        collapsed ? 'justify-center px-0' : 'text-left'
      )}
      style={activeStyle}
    >
      {item.icon && <span className="flex-none">{item.icon({ color: isActive ? 'white' : 'black' })}</span>}
      {!collapsed && (
        <>
          <span className={cn('flex-1 text-sm', isActive ? 'text-white' : 'text-sidebar-foreground')}>{item.label}</span>
          {isExpanded ? (
            <ChevronDown className={cn('h-4 w-4', isActive ? 'text-white' : 'text-sidebar-foreground')} />
          ) : (
            <ChevronRight className={cn('h-4 w-4', isActive ? 'text-white' : 'text-sidebar-foreground')} />
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <div className="space-y-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={8} className="flex min-w-[200px] flex-col gap-1 rounded-[4px]!">
            {item.children?.map((child) => {
              const childActive = isPathActive(pathname, child.path);
              return (
                <DropdownMenuItem
                  key={child.key}
                  className={cn(
                    'cursor-pointer rounded-[4px] hover:bg-[#ccc]/50! hover:text-black!',
                    childActive && 'bg-sidebar-primary text-white'
                  )}
                  onClick={() => router.push(child.path)}
                >
                  {child.icon && (
                    <span className="flex h-4 w-4 items-center justify-center">
                      {child.icon({ color: childActive ? 'white' : undefined })}
                    </span>
                  )}
                  {child.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {triggerButton}
      {isExpanded && item.children && item.children.length > 0 && (
        <div className="ml-2">
          {item.children.map((child) => (
            <NavItemComponent key={child.key} item={child} isDesktop={isDesktop} collapsed={collapsed} isChild />
          ))}
        </div>
      )}
    </div>
  );
};

const Navigation: React.FC<{ variant: 'mobile' | 'desktop'; collapsed?: boolean; items: NavItem[] }> = ({
  variant,
  collapsed = false,
  items,
}) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const isDesktop = variant === 'desktop';

  const getActiveParent = () => {
    const firstSegment = pathname.split('/').find(Boolean);
    return firstSegment || 'upload-history';
  };

  const isItemExpanded = (key: string, item: NavItem): boolean => {
    if (expanded[key] !== undefined) {
      return expanded[key];
    }
    // Auto-expand if any child is active
    if (item.children) {
      return item.children.some((child) => isPathActive(pathname, child.path));
    }
    return key === getActiveParent();
  };

  const handleToggle = (itemKey: string, currentExpanded: boolean) => {
    setExpanded((prev) => ({
      ...prev,
      [itemKey]: !currentExpanded,
    }));
  };

  return (
    <nav className="flex-1 space-y-2 p-[8px]">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          const expanded = isItemExpanded(item.key, item);
          return (
            <NavItemWithChildren
              key={item.key}
              item={item}
              isDesktop={isDesktop}
              collapsed={collapsed}
              isExpanded={expanded}
              onToggle={() => handleToggle(item.key, expanded)}
            />
          );
        }

        return <NavItemComponent key={item.key} item={item} isDesktop={isDesktop} collapsed={collapsed} />;
      })}
    </nav>
  );
};

const MobileSidebar: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger asChild className="bg-(--color-background-color)">
        <Button
          className="lg:hidden"
          type="text"
          aria-label="Open menu"
          icon={<img src="/assets/icons/hamburger-icon.svg" alt="Menu" className="h-4 w-4" />}
          onClick={() => {}}
        />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-r bg-[#ffffff] p-0">
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Sidebar navigation</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>
        <section className="flex h-full flex-col gap-2 bg-(--color-background-color)">
          <div className="mt-2 flex items-center justify-between px-4 pt-3">
            <Logo onClick={() => router.push('/')} />
          </div>
          <Navigation variant="mobile" items={items} />
        </section>
      </SheetContent>
    </Sheet>
  );
};

const STORAGE_KEY = 'sidebar-collapsed';

const sidebarCollapsedStore = {
  getSnapshot: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  },
  getServerSnapshot: (): boolean => false,
  _listeners: new Set<() => void>(),
  subscribe: (onStoreChange: () => void) => {
    sidebarCollapsedStore._listeners.add(onStoreChange);
    return () => {
      sidebarCollapsedStore._listeners.delete(onStoreChange);
    };
  },
  emit: () => {
    sidebarCollapsedStore._listeners.forEach((fn) => fn());
  },
};

const DesktopSidebar: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const router = useRouter();
  const isCollapsed = useSyncExternalStore(
    sidebarCollapsedStore.subscribe,
    sidebarCollapsedStore.getSnapshot,
    sidebarCollapsedStore.getServerSnapshot
  );

  const handleToggle = () => {
    const next = !sidebarCollapsedStore.getSnapshot();
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // ignore localStorage errors (e.g. private mode)
    }
    sidebarCollapsedStore.emit();
  };

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen border-r bg-(--color-background-color) transition-all duration-200 lg:block',
        isCollapsed ? 'w-16' : 'w-[256px]'
      )}
    >
      <section className="flex h-full flex-col">
        <div
          className={cn(
            'flex h-[48px] items-center border-b border-(--color-border) px-[16px]',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && <Logo onClick={() => router.push('/')} />}
          <button
            onClick={handleToggle}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded p-0"
            type="button"
            aria-label="Toggle sidebar"
          >
            <img src="/assets/icons/hamburger-icon.svg" alt="Menu" className="h-4 w-4" />
          </button>
        </div>
        <Navigation variant="desktop" collapsed={isCollapsed} items={items} />
      </section>
    </aside>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function Sidebar() {
  const { t } = useTranslation();
  const allItems = React.useMemo(() => getMenuItems(t), [t]);
  const { data: user } = useMe();
  const filteredItems = React.useMemo(() => {
    return allItems.filter((item) => {
      if (!user) return false;
      return hasAccessToPage(user.role as USER_ROLE, item.path);
    });
  }, [allItems, user]);

  return (
    <>
      <MobileSidebar items={filteredItems} />
      <DesktopSidebar items={filteredItems} />
    </>
  );
}
