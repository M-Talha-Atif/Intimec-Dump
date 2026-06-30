import React, { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, GitBranch, User, FileText } from 'lucide-react';
import { useRouter } from "next/navigation";
import { mockCampaigns } from '@/data/mock-access-review-data';

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search campaigns, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Campaigns">
          {mockCampaigns.slice(0, 5).map(campaign => (
            <CommandItem key={campaign.id} onSelect={() => { router.push(`/access-review/campaign/${campaign.id}`); setOpen(false); }}>
              <GitBranch className="mr-2 h-4 w-4" />
              <span>{campaign.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => { router.push('/access-review?tab=myreviews'); setOpen(false); }}>
            <User className="mr-2 h-4 w-4" />
            <span>My Reviews</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
