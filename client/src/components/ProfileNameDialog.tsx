import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";

interface ProfileNameDialogProps {
  userId: string;
  open: boolean;
  onClose: (displayName?: string) => void;
}

export function ProfileNameDialog({
  open,
  onClose,
}: ProfileNameDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a display name",
      });
      return;
    }

    setLoading(true);

    try {
      // Pass the display name to the parent component
      onClose(displayName.trim());
      toast({
        title: "Success",
        description: "Your profile name has been updated!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile name",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Welcome to Sparkgen!</DialogTitle>
            <DialogDescription>
              Please enter a name to display on your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayName" className="text-right">
                Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="col-span-3"
                autoFocus
                placeholder="Enter your display name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}