import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { NAV } from "@/lib/nav";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Building2, Briefcase, ListChecks, Bell } from "lucide-react";
import { LayoutDashboard } from "lucide-react";

import { useState, useEffect, useCallback } from "react";

export function CommandPalette({
  open,
  onOpenChange,
  initialQuery = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState(initialQuery);

  useEffect(() => {
    if (open) setSearch(initialQuery);
  }, [open, initialQuery]);

  const go = useCallback(
    (to: string) => {
      onOpenChange(false);
      setTimeout(() => {
        navigate(to);
      }, 0);
    },
    [navigate, onOpenChange],
  );

  const { isAdmin, can } = useAuth();
  const { leads, contacts, customers, deals, users, companies, tasks, notifications } = useData();

  const navItems = NAV.filter(
    (navItem) => (navItem.adminOnly ? isAdmin : true) && (navItem.perm ? can(navItem.perm) : true),
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search pages, people, deals…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-125">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {navItems.map((navItem) => (
            <CommandItem key={navItem.to} value={navItem.label} onSelect={() => go(navItem.to)}>
              <navItem.icon className="mr-2 h-4 w-4" /> {navItem.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Leads">
          {leads.slice(0, 8).map((lead) => (
            <CommandItem
              key={lead.id}
              value={`lead ${lead.name} ${lead.company} ${lead.email}`}
              onSelect={() => go(`/leads/${lead.id}`)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4 opacity-50" /> {lead.name}{" "}
              <span className="ml-2 text-xs text-muted-foreground">{lead.company}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Contacts">
          {contacts.slice(0, 8).map((contact) => (
            <CommandItem
              key={contact.id}
              value={`contact ${contact.name} ${contact.company}`}
              onSelect={() => go(`/contacts/${contact.id}`)}
            >
              {contact.name}{" "}
              <span className="ml-2 text-xs text-muted-foreground">
                {contact.title} · {contact.company}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Customers">
          {customers.slice(0, 8).map((customer) => (
            <CommandItem
              key={customer.id}
              value={`customer ${customer.name} ${customer.company}`}
              onSelect={() => go(`/customers/${customer.id}`)}
            >
              {customer.name}{" "}
              <span className="ml-2 text-xs text-muted-foreground">{customer.company}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Deals">
          {deals.slice(0, 8).map((deal) => (
            <CommandItem
              key={deal.id}
              value={`deal ${deal.name} ${deal.customerName}`}
              onSelect={() => go(`/deals/${deal.id}`)}
            >
              {deal.name} <span className="ml-2 text-xs text-muted-foreground">{deal.stage}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Companies">
          {companies.slice(0, 8).map((company) => (
            <CommandItem
              key={company.id}
              value={`company ${company.name} ${company.industry}`}
              onSelect={() => go(`/companies/${company.id}`)}
            >
              <Building2 className="mr-2 h-4 w-4 opacity-50" /> {company.name}{" "}
              <span className="ml-2 text-xs text-muted-foreground">{company.industry}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Tasks">
          {tasks.slice(0, 8).map((task) => (
            <CommandItem
              key={task.id}
              value={`task ${task.name} ${task.description} ${task.status}`}
              onSelect={() => go(`/tasks`)}
            >
              <ListChecks className="mr-2 h-4 w-4 opacity-50" /> {task.name}{" "}
              <span className="ml-2 text-xs text-muted-foreground">{task.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Notifications">
          {notifications.slice(0, 8).map((notification) => (
            <CommandItem
              key={notification.id}
              value={`notification ${notification.title} ${notification.message}`}
              onSelect={() => go(`/notifications`)}
            >
              <Bell className="mr-2 h-4 w-4 opacity-50" /> {notification.title}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Users">
          {users.slice(0, 8).map((user) => (
            <CommandItem
              key={user.id}
              value={`user ${user.name} ${user.email}`}
              onSelect={() => go(`/team/${user.id}`)}
            >
              {user.name} <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
