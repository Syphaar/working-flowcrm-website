/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { getToken } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import * as entities from "@/services/entities.service";
import type {
  User,
  Lead,
  Contact,
  Company,
  Customer,
  Deal,
  Task,
  CalendarEvent,
  Notification,
  Activity,
  Note,
  Attachment,
  Communication,
  Pipeline,
  RoleDefinition,
  ActivityKind,
} from "@/lib/types";

interface DataState {
  users: User[];
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  customers: Customer[];
  deals: Deal[];
  tasks: Task[];
  events: CalendarEvent[];
  notifications: Notification[];
  activities: Activity[];
  notes: Note[];
  attachments: Attachment[];
  communications: Communication[];
  pipelines: Pipeline[];
  roles: RoleDefinition[];
}

interface DataCtx extends DataState {
  upsert: <K extends keyof DataState>(
    key: K,
    item: DataState[K] extends Array<infer T> ? T : never,
  ) => void;
  remove: <K extends keyof DataState>(key: K, id: string) => void;
  bulkRemove: <K extends keyof DataState>(key: K, ids: string[]) => void;
  setAll: <K extends keyof DataState>(key: K, items: DataState[K]) => void;
  log: (activity: Omit<Activity, "id" | "createdAt">) => void;
  notify: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  resetDemo: () => void;
  isLoading: boolean;
}

const EMPTY_STATE: DataState = {
  users: [],
  leads: [],
  contacts: [],
  companies: [],
  customers: [],
  deals: [],
  tasks: [],
  events: [],
  notifications: [],
  activities: [],
  notes: [],
  attachments: [],
  communications: [],
  pipelines: [],
  roles: [],
};

const Ctx = createContext<DataCtx | null>(null);

type EntityService = {
  getAll: () => Promise<unknown[]>;
  create: (data: Record<string, unknown>) => Promise<unknown>;
  update: (id: string, data: Record<string, unknown>) => Promise<unknown>;
  delete: (id: string) => Promise<{ ok: boolean }>;
  bulkDelete: (ids: string[]) => Promise<{ ok: boolean }>;
};

const ENTITY_SERVICES: Record<string, EntityService> = {
  users: entities.users,
  leads: entities.leads,
  contacts: entities.contacts,
  companies: entities.companies,
  customers: entities.customers,
  deals: entities.deals,
  tasks: entities.tasks,
  events: entities.calendarEvents,
  notifications: entities.notifications,
  activities: entities.activities,
  notes: entities.notes,
  attachments: entities.attachments,
  communications: entities.communications,
  pipelines: entities.pipelines,
  roles: entities.roles,
};

async function fetchAllEntities(): Promise<DataState> {
  const entries = Object.entries(ENTITY_SERVICES) as [keyof DataState, EntityService][];
  const results = await Promise.allSettled(
    entries.map(async ([key, service]) => {
      const data = await service.getAll();
      return [key, data] as const;
    }),
  );

  const state = { ...EMPTY_STATE };
  for (const result of results) {
    if (result.status === "fulfilled") {
      const [key, data] = result.value;
      state[key] = data as never;
    }
  }
  return state;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, setState] = useState<DataState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);

  const lastFetchRef = useRef(0);

  const refetchAll = useCallback(async () => {
    lastFetchRef.current = Date.now();
    const data = await fetchAllEntities();
    setState(data);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setState(EMPTY_STATE);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    refetchAll().finally(() => {
      setIsLoading(false);
    });

    const token = getToken();
    const socket: Socket = io({
      auth: { token },
    });
    socket.on("entity:updated", ({ entity, item }) => {
      setState((s) => {
        if (!(entity in s)) return s;
        const arr = [
          ...(s[entity as keyof DataState] as unknown as Array<Record<string, unknown>>),
        ];
        const index = arr.findIndex((i) => i.id === item.id);
        if (index >= 0) {
          arr[index] = { ...arr[index], ...(item as Record<string, unknown>) };
        } else {
          arr.unshift(item as Record<string, unknown>);
        }
        return { ...s, [entity as keyof DataState]: arr } as DataState;
      });
    });
    socket.on("entity:deleted", ({ entity, id, ids }) => {
      setState((s) => {
        if (!(entity in s)) return s;
        const toRemove = ids ?? (id ? [id] : []);
        if (toRemove.length === 0) return s;
        const arr = (s[entity as keyof DataState] as unknown as Array<{ id: string }>).filter(
          (i) => !toRemove.includes(i.id),
        );
        return { ...s, [entity as keyof DataState]: arr } as DataState;
      });
    });
    socket.on("connect", () => {
      if (lastFetchRef.current > 0) {
        refetchAll();
      }
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refetchAll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      socket.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAuthenticated, refetchAll]);

  const createItemId = useCallback(() => {
    return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }, []);

  const upsert: DataCtx["upsert"] = useCallback(
    (key, item) => {
      const entry = item as Record<string, unknown>;
      const id = entry.id as string;
      const service = ENTITY_SERVICES[key as string];
      if (!service) return;

      const isNew = !id || id.startsWith("tmp_");

      if (isNew) {
        const { id: _id, ...rest } = entry;
        service.create(rest as Record<string, unknown>).then((created) => {
          setState((s) => {
            const arr = [...(s[key] as unknown as Array<Record<string, unknown>>)];
            const createdEntry = created as Record<string, unknown>;
            const existingIndex = arr.findIndex((item) => item.id === id);
            if (existingIndex >= 0) {
              arr[existingIndex] = { ...arr[existingIndex], ...createdEntry };
            } else {
              arr.unshift(createdEntry);
            }
            return { ...s, [key]: arr } as DataState;
          });
        });
      } else {
        service.update(id, entry).then((updated) => {
          setState((s) => {
            const arr = [...(s[key] as unknown as Array<Record<string, unknown>>)];
            const up = updated as Record<string, unknown>;
            const index = arr.findIndex((item) => item.id === id);
            if (index >= 0) {
              arr[index] = { ...arr[index], ...up };
            }
            return { ...s, [key]: arr } as DataState;
          });
        });
      }

      setState((s) => {
        const arr = [...(s[key] as unknown as Array<Record<string, unknown>>)];
        const newEntry = {
          ...entry,
          id: id || createItemId(),
          updatedAt: new Date().toISOString(),
        };
        const index = arr.findIndex((item) => item.id === newEntry.id);
        if (index >= 0) {
          arr[index] = { ...arr[index], ...newEntry };
        } else {
          arr.unshift(newEntry);
        }
        return { ...s, [key]: arr } as DataState;
      });
    },
    [createItemId],
  );

  const remove: DataCtx["remove"] = useCallback((key, id) => {
    const service = ENTITY_SERVICES[key as string];
    if (service) {
      service.delete(id).catch(() => {});
    }
    setState((s) => {
      const arr = (s[key] as unknown as Array<{ id: string }>).filter((item) => item.id !== id);
      return { ...s, [key]: arr } as DataState;
    });
  }, []);

  const bulkRemove: DataCtx["bulkRemove"] = useCallback((key, ids) => {
    const service = ENTITY_SERVICES[key as string];
    if (service) {
      service.bulkDelete(ids).catch(() => {});
    }
    setState((s) => {
      const arr = (s[key] as unknown as Array<{ id: string }>).filter(
        (item) => !ids.includes(item.id),
      );
      return { ...s, [key]: arr } as DataState;
    });
  }, []);

  const setAll: DataCtx["setAll"] = useCallback((key, items) => {
    setState((s) => ({ ...s, [key]: items }) as DataState);
  }, []);

  const log: DataCtx["log"] = useCallback((activity) => {
    entities.createActivity(activity as Record<string, unknown>).catch(() => {});
    setState((s) => ({
      ...s,
      activities: [
        {
          ...activity,
          id: `ac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        } as Activity,
        ...s.activities,
      ].slice(0, 1000),
    }));
  }, []);

  const notify: DataCtx["notify"] = useCallback((notification) => {
    entities.createNotification(notification as Record<string, unknown>).catch(() => {});
    setState((s) => ({
      ...s,
      notifications: [
        {
          ...notification,
          id: `nt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          read: false,
          createdAt: new Date().toISOString(),
        } as Notification,
        ...s.notifications,
      ],
    }));
  }, []);

  const resetDemo = useCallback(() => {
    fetchAllEntities().then((data) => {
      setState(data);
    });
  }, []);

  const value = useMemo<DataCtx>(
    () => ({
      ...state,
      upsert,
      remove,
      bulkRemove,
      setAll,
      log,
      notify,
      resetDemo,
      isLoading,
    }),
    [state, upsert, remove, bulkRemove, setAll, log, notify, resetDemo, isLoading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useData must be inside DataProvider");
  return context;
}

export function useUserById(id?: string) {
  const { users } = useData();
  return users.find((user) => user.id === id);
}

export function useLogAction() {
  const { log } = useData();
  return (
    kind: ActivityKind,
    description: string,
    user: User,
    entity?: string,
    entityId?: string,
  ) =>
    log({
      userId: user.id,
      userName: user.name,
      role: user.role,
      kind,
      description,
      entity,
      entityId,
    });
}
