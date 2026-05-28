import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Trash2, Play, Clock } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const createTargetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetUrl: z.string().url("Invalid URL"),
  targetType: z.enum(["url", "ip", "domain"]),
  description: z.string().optional(),
});

type CreateTargetInput = z.infer<typeof createTargetSchema>;

export default function Targets() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: targets, isLoading } = trpc.targets.list.useQuery();
  const createMutation = trpc.targets.create.useMutation({
    onSuccess: () => {
      utils.targets.list.invalidate();
      toast.success("Target created successfully");
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create target");
    },
  });

  const deleteMutation = trpc.targets.delete.useMutation({
    onSuccess: () => {
      utils.targets.list.invalidate();
      toast.success("Target deleted");
    },
  });

  const scanMutation = trpc.scans.start.useMutation({
    onSuccess: () => {
      utils.scans.list.invalidate();
      toast.success("Scan started");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start scan");
    },
  });

  const form = useForm<CreateTargetInput>({
    resolver: zodResolver(createTargetSchema),
    defaultValues: {
      targetType: "url",
    },
  });

  const onSubmit = (data: CreateTargetInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scan Targets</h1>
          <p className="text-muted-foreground mt-2">Manage websites, IPs, and domains to scan</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Scan Target</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="ip">IP Address</SelectItem>
                          <SelectItem value="domain">Domain</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target URL/IP/Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com or 192.168.1.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Add notes about this target" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Target
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Targets Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : targets && targets.length > 0 ? (
          targets.map((target: any) => (
            <Card key={target.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {target.name}
                      <span className="text-xs font-normal px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {target.targetType.toUpperCase()}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-2">{target.targetUrl}</CardDescription>
                  </div>
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        target.status === "active"
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(107, 114, 128, 0.1)",
                      color: target.status === "active" ? "#22c55e" : "#6b7280",
                    }}
                  >
                    {target.status.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {target.description && (
                    <p className="text-sm text-muted-foreground">{target.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {target.lastScannedAt ? (
                        <>
                          Last scanned:{" "}
                          {new Date(target.lastScannedAt).toLocaleDateString()}
                        </>
                      ) : (
                        <>Never scanned</>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scanMutation.mutate({ targetId: target.id })}
                        disabled={scanMutation.isPending}
                        className="gap-2"
                      >
                        {scanMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Scan Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate({ id: target.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No targets yet. Create one to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
