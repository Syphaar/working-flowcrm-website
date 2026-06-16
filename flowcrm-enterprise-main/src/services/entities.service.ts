import { createEntityService, request } from "./api";
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
} from "@/lib/types";

const users = createEntityService<User>("users");
const leads = createEntityService<Lead>("leads");
const contacts = createEntityService<Contact>("contacts");
const companies = createEntityService<Company>("companies");
const customers = createEntityService<Customer>("customers");
const deals = createEntityService<Deal>("deals");
const tasks = createEntityService<Task>("tasks");
const calendarEvents = createEntityService<CalendarEvent>("events");
const notifications = createEntityService<Notification>("notifications");
const activities = createEntityService<Activity>("activities");
const notes = createEntityService<Note>("notes");
const attachments = createEntityService<Attachment>("attachments");
const communications = createEntityService<Communication>("communications");
const pipelines = createEntityService<Pipeline>("pipelines");
const roles = createEntityService<RoleDefinition>("roles");

async function uploadAttachment(file: File, entity: string, entityId: string): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entity", entity);
  formData.append("entityId", entityId);
  return request<Attachment>("/attachments/upload", {
    method: "POST",
    body: formData,
  });
}

async function createActivity(data: Record<string, unknown>): Promise<Activity> {
  return request<Activity>("/activities", { method: "POST", body: data });
}

async function createNotification(data: Record<string, unknown>): Promise<Notification> {
  return request<Notification>("/notifications", { method: "POST", body: data });
}

export {
  users,
  leads,
  contacts,
  companies,
  customers,
  deals,
  tasks,
  calendarEvents,
  notifications,
  activities,
  notes,
  attachments,
  communications,
  pipelines,
  roles,
  uploadAttachment,
  createActivity,
  createNotification,
};
