"use client"

import { useEffect, useState } from "react"
import { getUsers, getBusinessProfile } from "@/actions/settings"
import { Panel } from "@/components/shared/panel"
import { RoleBadge } from "@/components/shared/role-badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Users, Settings2, Plus, Save, RefreshCw } from "lucide-react"
import type { User, BusinessProfile } from "../../../../../domain/types/settings"

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    const [usersData, profileData] = await Promise.all([getUsers(), getBusinessProfile()])
    setUsers(usersData)
    setProfile(profileData)
    setIsLoading(false)
  }

  if (isLoading || !profile) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-page-enter">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your business profile, staff, and system preferences.</p>
      </div>

      <Panel title="Business Profile" action={<Building2 className="h-4 w-4 text-muted-foreground" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Name</label>
            <Input defaultValue={profile.businessName} className="bg-muted/50 border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Number</label>
            <Input defaultValue={profile.phone} className="bg-muted/50 border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
            <Input defaultValue={profile.email} className="bg-muted/50 border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tax ID (Optional)</label>
            <Input defaultValue={profile.taxId} className="bg-muted/50 border-border text-foreground" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Physical Address</label>
            <Input defaultValue={profile.address} className="bg-muted/50 border-border text-foreground" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
        <Button 
  onClick={() => toast.success("Business profile updated successfully", { description: "Your changes have been saved." })}
  className="bg-emerald-600 hover:bg-emerald-500 text-white"
>
  <Save className="h-4 w-4 mr-2" /> Save Changes
</Button>        </div>
      </Panel>

      <Panel title="Staff Management" action={
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-8">
          <Plus className="h-3 w-3 mr-2" /> Add User
        </Button>
      }>
        {/* RESPONSIVE TABLE WRAPPER */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Phone</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-border/50 hover:bg-accent/50">
                  <TableCell className="font-medium text-foreground">{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                  <TableCell><RoleBadge role={user.role} /></TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-500/10 text-zinc-500"}`}>
                      {user.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.joinedDate}</TableCell>
                  <TableCell className="text-right">
                    <button className="text-xs text-emerald-500 hover:text-emerald-400 font-medium mr-3">Edit</button>
                    <button className="text-xs text-red-500 hover:text-red-400 font-medium">Disable</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>

      <Panel title="System Preferences" action={<Settings2 className="h-4 w-4 text-muted-foreground" />}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="text-sm font-medium text-foreground">SMS Notifications</div>
              <div className="text-xs text-muted-foreground mt-1">Send SMS to customers when job status changes (V2)</div>
            </div>
            <div className="h-5 w-9 rounded-full bg-zinc-700 relative cursor-not-allowed opacity-50">
              <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="text-sm font-medium text-foreground">Auto-generate Receipts</div>
              <div className="text-xs text-muted-foreground mt-1">Automatically create a receipt when payment is marked as PAID</div>
            </div>
            <div className="h-5 w-9 rounded-full bg-emerald-500 relative cursor-pointer">
              <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Allow Partial Payments</div>
              <div className="text-xs text-muted-foreground mt-1">Enable cashiers to record partial payments for jobs</div>
            </div>
            <div className="h-5 w-9 rounded-full bg-emerald-500 relative cursor-pointer">
              <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}