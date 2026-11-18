"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserRoleAction, updateUserStatusAction } from "@/app/(admin)/admin/users/actions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Role, UserStatus } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}

interface UsersTableProps {
  initialUsers: User[];
  currentUserId: string;
}

export default function UsersTable({ initialUsers, currentUserId }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Sync state if initial changes
  if (initialUsers.length !== users.length) {
    setUsers(initialUsers);
  }

  const handleRoleChange = async (id: string, newRole: Role) => {
    try {
      const res = await updateUserRoleAction(id, newRole);
      if (res.success) {
        toast.success("Role pengguna berhasil diperbarui!");
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      } else {
        toast.error(res.error || "Gagal mengubah role.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: UserStatus) => {
    try {
      const res = await updateUserStatusAction(id, newStatus);
      if (res.success) {
        toast.success("Status pengguna berhasil diperbarui!");
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      } else {
        toast.error(res.error || "Gagal mengubah status.");
      }
    } catch {
      toast.error("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Daftar Pengguna</h1>
        <p className="text-muted-foreground mt-1">
          Kelola peran (role) dan status keaktifan peserta maupun administrator.
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pengguna</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran (Role)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isSelf ? (
                      <Badge variant="outline" className="capitalize">
                        {user.role} (Anda)
                      </Badge>
                    ) : (
                      <Select
                        defaultValue={user.role}
                        onValueChange={(val) => handleRoleChange(user.id, val as Role)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="participant">Participant</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <Badge className="bg-green-500/10 text-green-700 capitalize">
                        {user.status}
                      </Badge>
                    ) : (
                      <Select
                        defaultValue={user.status}
                        onValueChange={(val) => handleStatusChange(user.id, val as UserStatus)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
